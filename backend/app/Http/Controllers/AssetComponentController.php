<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetComponent;
use App\Models\Status;
use App\Services\InventoryAuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AssetComponentController extends Controller
{
    /**
     * Get all components for a specific asset
     */
    public function index($assetId)
    {
        try {
            $asset = Asset::findOrFail($assetId);

            $components = AssetComponent::where('parent_asset_id', $assetId)
                ->with([
                    'status',
                    'category',
                    'subcategory',
                    'vendor',
                    'assignedEmployee.branch',
                    'assignedEmployee.position',
                    'parentAsset.category',
                ])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $components,
                'parent_asset' => $asset,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch components');
        }
    }

    /**
     * Create new components for an asset
     */
    public function store(Request $request, $assetId)
    {
        // Verify asset exists
        $asset = Asset::findOrFail($assetId);

        $validator = Validator::make($request->all(), [
            'components' => 'required|array',
            'components.*.category_id' => 'required|exists:asset_category,id',
            'components.*.subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'components.*.component_name' => 'required|string|max:255',
            'components.*.brand' => 'nullable|string|max:255',
            'components.*.model' => 'nullable|string|max:255',
            'components.*.serial_number' => 'required|string|max:255|unique:asset_components,serial_number',
            'components.*.purchase_date' => 'nullable|date',
            'components.*.specifications' => 'nullable|array',
            'components.*.acq_cost' => 'nullable|numeric|min:0',
            'components.*.vendor_id' => 'nullable|exists:vendors,id',
            'components.*.status_id' => 'required|exists:status,id',
            'components.*.assigned_to_employee_id' => 'nullable|exists:employee,id',
            'components.*.remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $createdComponents = [];

            foreach ($request->components as $componentData) {
                $component = AssetComponent::create([
                    'parent_asset_id' => $assetId,
                    'category_id' => $componentData['category_id'],
                    'subcategory_id' => $componentData['subcategory_id'] ?? null,
                    'component_name' => $componentData['component_name'],
                    'brand' => $componentData['brand'] ?? null,
                    'model' => $componentData['model'] ?? null,
                    'serial_number' => $componentData['serial_number'] ?? null,
                    'purchase_date' => $componentData['purchase_date'] ?? null,
                    'specifications' => $componentData['specifications'] ?? null,
                    'acq_cost' => $componentData['acq_cost'] ?? null,
                    'vendor_id' => $componentData['vendor_id'] ?? null,
                    'status_id' => $componentData['status_id'],
                    'assigned_to_employee_id' => $componentData['assigned_to_employee_id'] ?? null,
                    'remarks' => $componentData['remarks'] ?? null,
                ]);

                // Generate QR code and barcode
                try {
                    $component->generateAndSaveQRCode();
                    $component->generateAndSaveBarcode();
                } catch (\Exception $e) {
                    Log::warning("Failed to generate codes for component {$component->id}: ".$e->getMessage());
                }

                $component->refresh();
                $component->load([
                    'status',
                    'category',
                    'subcategory',
                    'vendor',
                    'assignedEmployee.branch',
                    'assignedEmployee.position',
                    'parentAsset.category',
                ]);

                $createdComponents[] = $component;
            }

            return response()->json([
                'success' => true,
                'message' => 'Components created successfully',
                'data' => $createdComponents,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create component');
        }
    }

    /**
     * Get a specific component
     */
    public function show($id)
    {
        try {
            $component = AssetComponent::with([
                'status',
                'category',
                'subcategory',
                'vendor',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'parentAsset.category',
                'movements.fromEmployee',
                'movements.toEmployee',
                'movements.fromStatus',
                'movements.toStatus',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $component,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Component not found', 404);
        }
    }

    /**
     * Update a component
     */
    public function update(Request $request, $id)
    {
        // If only updating assigned_to_employee_id (transfer), make other fields optional
        $isTransferOnly = $request->has('assigned_to_employee_id') && count($request->all()) === 1;

        $validator = Validator::make($request->all(), [
            'category_id' => $isTransferOnly ? 'sometimes|exists:asset_category,id' : 'required|exists:asset_category,id',
            'subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'component_name' => $isTransferOnly ? 'sometimes|string|max:255' : 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => ['nullable', 'string', 'max:255', Rule::unique('asset_components', 'serial_number')->ignore($id)],
            'purchase_date' => 'nullable|date',
            'specifications' => 'nullable|array',
            'acq_cost' => 'nullable|numeric|min:0',
            'vendor_id' => 'nullable|exists:vendors,id',
            'status_id' => $isTransferOnly ? 'sometimes|exists:status,id' : 'required|exists:status,id',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            Log::info('Component Update - Request Data', [
                'id' => $id,
                'data' => $request->all(),
            ]);

            $component = AssetComponent::findOrFail($id);

            Log::info('Component Update - Before', [
                'id' => $id,
                'current' => $component->toArray(),
            ]);

            // Use only validated/whitelisted fields
            $data = $request->only([
                'category_id', 'subcategory_id', 'component_name',
                'brand', 'model', 'serial_number', 'purchase_date',
                'specifications', 'acq_cost', 'vendor_id', 'status_id',
                'assigned_to_employee_id', 'remarks',
            ]);
            $component->update($data);

            Log::info('Component Update - After', [
                'id' => $id,
                'updated' => $component->toArray(),
            ]);

            $component->load([
                'status',
                'category',
                'subcategory',
                'vendor',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'parentAsset.category',
            ]);

            Log::info('Component Update - Success');

            return response()->json([
                'success' => true,
                'message' => 'Component updated successfully',
                'data' => $component,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Component Update - Exception', [
                'id' => $id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->handleException($e, 'Failed to update component');
        }
    }

    /**
     * Delete a component
     */
    public function destroy($id)
    {
        try {
            $component = AssetComponent::findOrFail($id);
            $component->delete();

            return response()->json([
                'success' => true,
                'message' => 'Component deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete component');
        }
    }

    /**
     * Transfer component to different employee
     */
    public function transfer(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'to_employee_id' => 'required|exists:employee,id',
            'reason' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $component = AssetComponent::findOrFail($id);
            $component->assigned_to_employee_id = $request->to_employee_id;
            $component->save();

            $component->load([
                'status',
                'category',
                'subcategory',
                'vendor',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'parentAsset.category',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Component transferred successfully',
                'data' => $component,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to transfer component');
        }
    }

    /**
     * Regenerate QR code for component
     */
    public function generateQRCode($id)
    {
        try {
            $component = AssetComponent::findOrFail($id);
            $qrCode = $component->generateAndSaveQRCode();

            // Log QR code generation for component
            InventoryAuditLogService::logCodeGeneration(
                $component->parent_asset_id,
                'component_qr_code',
                $component->component_name
            );

            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'data' => [
                    'id' => $component->id,
                    'qr_code' => $qrCode,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to generate QR code');
        }
    }

    /**
     * Get all components across all assets
     */
    public function all(Request $request)
    {
        try {
            $query = AssetComponent::with([
                'status',
                'category',
                'subcategory',
                'vendor',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'parentAsset.category',
                'parentAsset.assignedToEmployee',
            ]);

            // Filter by category
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by status
            if ($request->has('status_id') && $request->status_id) {
                $query->where('status_id', $request->status_id);
            }

            // Filter by parent asset
            if ($request->has('parent_asset_id') && $request->parent_asset_id) {
                $query->where('parent_asset_id', $request->parent_asset_id);
            }

            // Search by name, brand, model, or serial number
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('component_name', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('serial_number', 'like', "%{$search}%");
                });
            }

            $components = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $components,
                'total' => $components->count(),
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch components');
        }
    }

    /**
     * Get movement history for a specific component
     */
    public function movements($id)
    {
        try {
            $component = AssetComponent::findOrFail($id);

            $movements = $component->movements()
                ->with([
                    'fromEmployee',
                    'toEmployee',
                    'fromStatus',
                    'toStatus',
                    'performedBy',
                ])
                ->orderBy('movement_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $movements,
                'component' => [
                    'id' => $component->id,
                    'component_name' => $component->component_name,
                    'category_name' => $component->category?->name,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch component movements', 404);
        }
    }
}
