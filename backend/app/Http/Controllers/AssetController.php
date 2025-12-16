<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            // employee, return all of their assets.
            $hasEmployeeFilter = $request->has('assigned_to_employee_id') && $request->assigned_to_employee_id;
            if (!$hasEmployeeFilter) {
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
            'purchase_date' => 'nullable|date',
            'acq_cost' => 'nullable|numeric|min:0',
            'waranty_expiration_date' => 'nullable|date',
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

        try {
            $data = $request->except(['status_id', 'book_value']); // Remove status and book_value from request

            // Auto-assign "New" status
            $newStatus = \App\Models\Status::where('name', 'New')->first();
            if (!$newStatus) {
                // If "New" status doesn't exist, create it or use first available status
                $newStatus = \App\Models\Status::firstOrCreate(
                    ['name' => 'New'],
                    ['description' => 'Newly added asset']
                );
            }
            $data['status_id'] = $newStatus->id;

            // Create asset
            $asset = Asset::create($data);

            // Calculate and set initial book value
            $bookValueCalc = $asset->calculateBookValue();
            $asset->book_value = $bookValueCalc['book_value'];
            $asset->save();

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
                'message' => 'Asset created successfully with status "New"',
                'data' => $asset,
                'depreciation_info' => $bookValueCalc,
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
            'purchase_date' => 'nullable|date',
            'acq_cost' => 'nullable|numeric|min:0',
            'waranty_expiration_date' => 'nullable|date',
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

            $assetIds = Asset::where('assigned_to_employee_id', $employeeId)->pluck('id');
            if ($assetIds->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No assets found for this employee',
                ], 404);
            }

            $deletedCount = Asset::whereIn('id', $assetIds)->delete();

            return response()->json([
                'success' => true,
                'message' => $deletedCount . ' asset(s) deleted for employee ' . $employee->fullname,
                'deleted_count' => $deletedCount,
                'deleted_asset_ids' => $assetIds,
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
            Asset::whereIn('id', $request->ids)->delete();

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
        $validator = Validator::make($request->all(), [
            'field' => 'required|string',
            'value' => 'nullable',
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

            $asset->update([$request->field => $request->value]);

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
}
