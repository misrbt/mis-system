<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetComponent;
use App\Models\Employee;
use App\Models\Status;
use App\Services\InventoryAuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class AssetController extends Controller
{
    /**
     * Display a listing of assets with advanced filtering.
     */
    public function index(Request $request)
    {
        try {
            $query = Asset::with([
                'category',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedEmployee.department'
            ]);

            // Advanced filtering
            if ($request->has('branch_id') && $request->branch_id) {
                $query->whereHas('assignedEmployee', function ($q) use ($request) {
                    $q->where('branch_id', $request->branch_id);
                });
            }

            if ($request->has('category_id') && $request->category_id) {
                $query->where('asset_category_id', $request->category_id);
            }

            if ($request->has('status_id') && $request->status_id) {
                $query->where('status_id', $request->status_id);
            }

            if ($request->has('vendor_id') && $request->vendor_id) {
                $query->where('vendor_id', $request->vendor_id);
            }

            // Filter by assigned employee
            if ($request->has('assigned_to_employee_id') && $request->assigned_to_employee_id) {
                $query->where('assigned_to_employee_id', $request->assigned_to_employee_id);
            }

            // Purchase date range filter
            if ($request->has('purchase_date_from') && $request->purchase_date_from) {
                $query->where('purchase_date', '>=', $request->purchase_date_from);
            }

            if ($request->has('purchase_date_to') && $request->purchase_date_to) {
                $query->where('purchase_date', '<=', $request->purchase_date_to);
            }

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('asset_name', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%")
                      ->orWhere('brand', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $assets = $query->get();

            // Return a single row per employee for the main list; when filtering by a specific
            // employee, return all of their assets. If ?all=1 is provided, return everything.
            $hasEmployeeFilter = $request->has('assigned_to_employee_id') && $request->assigned_to_employee_id;
            $returnAll = $request->boolean('all', false);
            if (!$hasEmployeeFilter && !$returnAll) {
                $assets = $assets
                    ->unique(fn ($asset) => (int) ($asset->assigned_to_employee_id ?: 0))
                    ->values();
            }

            return response()->json([
                'success' => true,
                'data' => $assets,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assets',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Return acquisition cost totals grouped by employee for filtered assets.
     */
    public function totals(Request $request)
    {
        try {
            $query = Asset::query();

            if ($request->has('branch_id') && $request->branch_id) {
                $query->whereHas('assignedEmployee', function ($q) use ($request) {
                    $q->where('branch_id', $request->branch_id);
                });
            }

            if ($request->has('category_id') && $request->category_id) {
                $query->where('asset_category_id', $request->category_id);
            }

            if ($request->has('status_id') && $request->status_id) {
                $query->where('status_id', $request->status_id);
            }

            if ($request->has('vendor_id') && $request->vendor_id) {
                $query->where('vendor_id', $request->vendor_id);
            }

            if ($request->has('assigned_to_employee_id') && $request->assigned_to_employee_id) {
                $query->where('assigned_to_employee_id', $request->assigned_to_employee_id);
            }

            if ($request->has('purchase_date_from') && $request->purchase_date_from) {
                $query->where('purchase_date', '>=', $request->purchase_date_from);
            }

            if ($request->has('purchase_date_to') && $request->purchase_date_to) {
                $query->where('purchase_date', '<=', $request->purchase_date_to);
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('asset_name', 'like', "%{$search}%")
                        ->orWhere('serial_number', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%");
                });
            }

            $totals = $query
                ->selectRaw('assigned_to_employee_id, COALESCE(SUM(acq_cost), 0) as total_acq_cost')
                ->groupBy('assigned_to_employee_id')
                ->get()
                ->map(fn ($row) => [
                    'employee_id' => $row->assigned_to_employee_id,
                    'total_acq_cost' => (float) $row->total_acq_cost,
                ]);

            return response()->json([
                'success' => true,
                'data' => $totals,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch asset totals',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created asset.
     * Automatically assigns "New" status and calculates initial book value.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_name' => 'required|string|max:255',
            'asset_category_id' => 'required|exists:asset_category,id',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'acq_cost' => 'nullable|numeric|min:0',
            'waranty_expiration_date' => 'nullable|date',
            'warranty_duration_value' => 'nullable|numeric|min:0',
            'warranty_duration_unit' => 'nullable|in:months,weeks,years',
            'estimate_life' => 'nullable|integer|min:0',
            'vendor_id' => 'nullable|exists:vendors,id',
            'remarks' => 'nullable|string',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Add component validation if components are provided
        if ($request->has('components')) {
            $componentValidator = Validator::make($request->all(), [
                'components' => 'array',
                'components.*.component_type' => 'required|in:system_unit,monitor,keyboard_mouse,other',
                'components.*.component_name' => 'required|string|max:255',
                'components.*.brand' => 'nullable|string|max:255',
                'components.*.model' => 'nullable|string|max:255',
                'components.*.serial_number' => 'nullable|string|max:255|unique:asset_components,serial_number',
                'components.*.acq_cost' => 'nullable|numeric|min:0',
                'components.*.remarks' => 'nullable|string',
            ]);

            if ($componentValidator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Component validation failed',
                    'errors' => $componentValidator->errors(),
                ], 422);
            }
        }

        try {
            $data = $request->except(['status_id', 'book_value']); // Remove status and book_value from request

            // Compute warranty expiration if duration is provided; otherwise respect provided date or leave null
            $data['waranty_expiration_date'] = $this->calculateWarrantyExpiration(
                $request->purchase_date,
                $request->warranty_duration_value,
                $request->warranty_duration_unit,
                $request->waranty_expiration_date
            );

            // Auto-assign status based on purchase date
            // If purchase date is within 1 month from today -> "New"
            // If purchase date is more than 1 month old -> "Functional"
            $purchaseDate = Carbon::parse($request->purchase_date);
            $today = Carbon::today();
            $oneMonthAgo = $today->copy()->subMonth();

            // If purchase date is more than 1 month old, set to Functional
            if ($purchaseDate->lessThan($oneMonthAgo)) {
                $statusName = 'Functional';
            } else {
                $statusName = 'New';
            }

            $status = Status::where('name', $statusName)->first();
            if (!$status) {
                // If status doesn't exist, create it
                $status = Status::firstOrCreate(
                    ['name' => $statusName],
                    ['description' => $statusName === 'New' ? 'Newly added asset' : 'Functional asset']
                );
            }
            $data['status_id'] = $status->id;

            // Create asset
            $asset = Asset::create($data);

            // Calculate and set initial book value
            $bookValueCalc = $asset->calculateBookValue();
            $asset->book_value = $bookValueCalc['book_value'];
            $asset->save();

            // Generate QR code for the asset (non-blocking - won't fail asset creation)
            try {
                $asset->generateAndSaveQRCode();
            } catch (\Exception $e) {
                // Log error but don't fail asset creation
                Log::warning("Failed to generate QR code for asset {$asset->id}: " . $e->getMessage());
            }

            // Generate barcode for the asset (non-blocking - won't fail asset creation)
            try {
                $asset->generateAndSaveBarcode();
            } catch (\Exception $e) {
                // Log error but don't fail asset creation
                Log::warning("Failed to generate barcode for asset {$asset->id}: " . $e->getMessage());
            }

            // Refresh the asset to get the generated QR code and barcode
            $asset->refresh();

            // Create components if provided (for Desktop PC assets)
            $createdComponents = [];
            if ($request->has('components') && is_array($request->components)) {
                foreach ($request->components as $componentData) {
                    $component = AssetComponent::create([
                        'parent_asset_id' => $asset->id,
                        'component_type' => $componentData['component_type'],
                        'component_name' => $componentData['component_name'],
                        'brand' => $componentData['brand'] ?? null,
                        'model' => $componentData['model'] ?? null,
                        'serial_number' => $componentData['serial_number'] ?? null,
                        'acq_cost' => $componentData['acq_cost'] ?? null,
                        'status_id' => $asset->status_id, // Inherit parent status initially
                        'assigned_to_employee_id' => $asset->assigned_to_employee_id, // Inherit parent assignment
                        'remarks' => $componentData['remarks'] ?? null,
                    ]);

                    // Generate codes for component (non-blocking)
                    try {
                        $component->generateAndSaveQRCode();
                        $component->generateAndSaveBarcode();
                    } catch (\Exception $e) {
                        Log::warning("Failed to generate codes for component {$component->id}: " . $e->getMessage());
                    }

                    $createdComponents[] = $component;
                }

                // Load components relationship
                $asset->load('components');
            }

            // Load relationships
            $asset->load([
                'category',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedEmployee.department'
            ]);

            return response()->json([
                'success' => true,
                'message' => "Asset created successfully with status \"{$statusName}\"",
                'data' => $asset,
                'depreciation_info' => $bookValueCalc,
                'components_created' => count($createdComponents),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create asset',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified asset.
     */
    public function show($id)
    {
        try {
            $asset = Asset::with([
                'category',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedEmployee.department'
            ])->findOrFail($id);

            // Calculate depreciation information
            $depreciationInfo = $asset->calculateBookValue();

            return response()->json([
                'success' => true,
                'data' => $asset,
                'depreciation_info' => $depreciationInfo,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Asset not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified asset.
     * Recalculates book value if purchase_date, acq_cost, or estimate_life changes.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'asset_name' => 'required|string|max:255',
            'asset_category_id' => 'required|exists:asset_category,id',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'acq_cost' => 'nullable|numeric|min:0',
            'waranty_expiration_date' => 'nullable|date',
            'warranty_duration_value' => 'nullable|numeric|min:0',
            'warranty_duration_unit' => 'nullable|in:months,weeks,years',
            'estimate_life' => 'nullable|integer|min:0',
            'vendor_id' => 'nullable|exists:vendors,id',
            'status_id' => 'required|exists:status,id',
            'remarks' => 'nullable|string',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $asset = Asset::findOrFail($id);

            // Check if depreciation-related fields are being updated
            $needsRecalculation = $request->has('purchase_date')
                || $request->has('acq_cost')
                || $request->has('estimate_life');

            // Update asset (excluding book_value from request)
            $data = $request->except(['book_value']);

            // Auto-adjust status based on purchase date if:
            // 1. Purchase date is being changed
            // 2. Current status is "New" or "Functional" (don't override manual statuses)
            if ($request->has('purchase_date')) {
                $currentStatus = $asset->status;
                if ($currentStatus && in_array($currentStatus->name, ['New', 'Functional'])) {
                    $purchaseDate = Carbon::parse($request->purchase_date);
                    $today = Carbon::today();
                    $oneMonthAgo = $today->copy()->subMonth();

                    // Determine the appropriate status
                    if ($purchaseDate->lessThan($oneMonthAgo)) {
                        $statusName = 'Functional';
                    } else {
                        $statusName = 'New';
                    }

                    // Only update if different from current
                    if ($currentStatus->name !== $statusName) {
                        $newStatus = Status::where('name', $statusName)->first();
                        if ($newStatus) {
                            $data['status_id'] = $newStatus->id;
                        }
                    }
                }
            }

            // Compute warranty expiration if duration input is provided; otherwise honor provided date or keep current
            $computedWarranty = $this->calculateWarrantyExpiration(
                $request->purchase_date ?? $asset->purchase_date,
                $request->warranty_duration_value,
                $request->warranty_duration_unit,
                $request->waranty_expiration_date
            );
            if (!is_null($computedWarranty)) {
                $data['waranty_expiration_date'] = $computedWarranty;
            }

            $asset->update($data);

            // Recalculate book value if needed
            $bookValueCalc = null;
            if ($needsRecalculation) {
                $bookValueCalc = $asset->calculateBookValue();
                $asset->book_value = $bookValueCalc['book_value'];
                $asset->save();
            }

            // Load relationships
            $asset->load([
                'category',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedEmployee.department'
            ]);

            $response = [
                'success' => true,
                'message' => 'Asset updated successfully',
                'data' => $asset,
            ];

            if ($bookValueCalc) {
                $response['depreciation_info'] = $bookValueCalc;
                $response['message'] .= ' (book value recalculated)';
            }

        return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update asset',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified asset.
     */
    public function destroy($id)
    {
        try {
            $asset = Asset::findOrFail($id);
            $asset->delete();

            return response()->json([
                'success' => true,
                'message' => 'Asset deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete asset',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove all assets assigned to a specific employee.
     */
    public function destroyByEmployee($employeeId)
    {
        try {
            $employee = Employee::find($employeeId);
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found',
                ], 404);
            }

            $assets = Asset::where('assigned_to_employee_id', $employeeId)->get();
            if ($assets->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No assets found for this employee',
                ], 404);
            }

            $deletedCount = 0;
            $deletedAssets = [];
            foreach ($assets as $asset) {
                $deletedAssets[] = [
                    'id' => $asset->id,
                    'name' => $asset->asset_name,
                    'serial_number' => $asset->serial_number,
                ];
                $asset->delete(); // This triggers AssetObserver for individual asset logs
                $deletedCount++;
            }

            // Log the bulk operation summary
            InventoryAuditLogService::logBulkDelete(
                'asset',
                $deletedAssets,
                "Bulk delete all assets for employee: {$employee->fullname}"
            );

            return response()->json([
                'success' => true,
                'message' => $deletedCount . ' asset(s) deleted for employee ' . $employee->fullname,
                'deleted_count' => $deletedCount,
                'deleted_asset_ids' => $assets->pluck('id'),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete assets for employee',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk delete assets.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|exists:assets,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $assets = Asset::whereIn('id', $request->ids)->get();
            $deletedAssets = [];

            foreach ($assets as $asset) {
                $deletedAssets[] = [
                    'id' => $asset->id,
                    'name' => $asset->asset_name,
                    'serial_number' => $asset->serial_number,
                ];
                $asset->delete(); // This triggers AssetObserver for individual asset logs
            }

            // Log the bulk operation summary
            InventoryAuditLogService::logBulkDelete(
                'asset',
                $deletedAssets,
                'Bulk delete operation'
            );

            return response()->json([
                'success' => true,
                'message' => count($request->ids) . ' asset(s) deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete assets',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update specific field of an asset (for inline editing).
     */
    public function updateField(Request $request, $id)
    {
        $rules = [
            'field' => 'required|string',
            'value' => 'nullable',
        ];

        // Tighten validation for status changes (explicit table name via model to avoid pluralization issues)
        if ($request->field === 'status_id') {
            $rules['value'] = [
                'required',
                'integer',
                Rule::exists((new Status())->getTable(), 'id'),
            ];
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $asset = Asset::findOrFail($id);

            // Only allow updating specific fields (book_value is auto-calculated)
            $allowedFields = [
                'asset_name',
                'asset_category_id',
                'brand',
                'model',
                'serial_number',
                'purchase_date',
                'acq_cost',
                'waranty_expiration_date',
                'estimate_life',
                'remarks',
                'status_id',
                'assigned_to_employee_id',
            ];

            if (!in_array($request->field, $allowedFields)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Field not allowed for inline editing',
                ], 400);
            }

            $value = $request->field === 'status_id'
                ? (int) $request->value
                : $request->value;

            $asset->update([$request->field => $value]);

            // Recalculate book value if depreciation-related field was updated
            $depreciationFields = ['purchase_date', 'acq_cost', 'estimate_life'];
            $bookValueCalc = null;
            if (in_array($request->field, $depreciationFields)) {
                $bookValueCalc = $asset->calculateBookValue();
                $asset->book_value = $bookValueCalc['book_value'];
                $asset->save();
            }

            $asset->load([
                'category',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedEmployee.department'
            ]);

            $response = [
                'success' => true,
                'message' => 'Field updated successfully',
                'data' => $asset,
            ];

            if ($bookValueCalc) {
                $response['depreciation_info'] = $bookValueCalc;
                $response['message'] .= ' (book value recalculated)';
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update field',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update only the asset status (dedicated endpoint).
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status_id' => [
                'required',
                'integer',
                Rule::exists((new Status())->getTable(), 'id'),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $asset = Asset::findOrFail($id);
            $asset->status_id = (int) $request->status_id;
            $asset->save();

            $asset->load([
                'category',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedEmployee.department'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => $asset,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate QR code for a specific asset
     */
    public function generateQRCode($id)
    {
        try {
            $asset = Asset::findOrFail($id);
            $qrCode = $asset->generateAndSaveQRCode();

            // Log QR code generation
            InventoryAuditLogService::logCodeGeneration(
                $asset->id,
                'qr_code',
                $asset->asset_name
            );

            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'data' => [
                    'id' => $asset->id,
                    'qr_code' => $qrCode,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate QR codes for all assets that don't have one
     */
    public function generateAllQRCodes()
    {
        try {
            $assetsWithoutQR = Asset::whereNull('qr_code')->orWhere('qr_code', '')->get();
            $generated = 0;
            $assetIds = [];

            foreach ($assetsWithoutQR as $asset) {
                $asset->generateAndSaveQRCode();
                $assetIds[] = $asset->id;
                $generated++;
            }

            // Log bulk QR code generation
            if ($generated > 0) {
                InventoryAuditLogService::logBulkCodeGeneration(
                    'qr_code',
                    $generated,
                    $assetIds
                );
            }

            return response()->json([
                'success' => true,
                'message' => "QR codes generated successfully for {$generated} assets",
                'data' => [
                    'generated_count' => $generated,
                    'total_assets' => Asset::count(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR codes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate warranty expiration date based on purchase date and duration.
     */
    private function calculateWarrantyExpiration($purchaseDate, $durationValue, $durationUnit, $explicitDate = null)
    {
        // If duration is provided, calculate; otherwise use explicit date (or null)
        $value = is_null($durationValue) ? null : (float) $durationValue;
        $unit = $durationUnit ?: 'months';

        if (!is_null($value) && $value > 0) {
            $baseDate = $purchaseDate ? Carbon::parse($purchaseDate) : Carbon::now();
            switch ($unit) {
                case 'weeks':
                    $baseDate->addWeeks($value);
                    break;
                case 'years':
                    $baseDate->addYears($value);
                    break;
                case 'months':
                default:
                    $baseDate->addMonths($value);
                    break;
            }
            return $baseDate->toDateString();
        }

        return $explicitDate ?: null;
    }
}
