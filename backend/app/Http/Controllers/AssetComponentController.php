<?php

namespace App\Http\Controllers;

use App\Models\AssetComponent;
use App\Models\Asset;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AssetComponentController extends Controller
{
    /**
     * Get all components for a specific asset
     */
    public function index($assetId)
    {
        try {
            $asset = Asset::findOrFail($assetId);

            $components = AssetComponent::with([
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'parentAsset.category'
            ])
            ->where('parent_asset_id', $assetId)
            ->get();

            return response()->json([
                'success' => true,
                'data' => $components,
                'parent_asset' => $asset,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch components',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new component
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'parent_asset_id' => 'required|exists:assets,id',
            'component_type' => 'required|in:system_unit,monitor,keyboard_mouse,other',
            'component_name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:asset_components,serial_number',
            'acq_cost' => 'nullable|numeric|min:0',
            'status_id' => 'required|exists:status,id',
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
            $component = AssetComponent::create($request->all());

            // Generate QR code and barcode
            try {
                $component->generateAndSaveQRCode();
                $component->generateAndSaveBarcode();
            } catch (\Exception $e) {
                Log::warning("Failed to generate codes for component {$component->id}: " . $e->getMessage());
            }

            $component->refresh();
            $component->load([
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'parentAsset.category'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Component created successfully',
                'data' => $component,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create component',
                'error' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => 'Component not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update a component
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'component_type' => 'required|in:system_unit,monitor,keyboard_mouse,other',
            'component_name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:asset_components,serial_number,' . $id,
            'acq_cost' => 'nullable|numeric|min:0',
            'status_id' => 'required|exists:status,id',
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
            $component = AssetComponent::findOrFail($id);
            $component->update($request->all());

            $component->load([
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'parentAsset.category'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Component updated successfully',
                'data' => $component,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update component',
                'error' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete component',
                'error' => $e->getMessage(),
            ], 500);
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
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'parentAsset.category'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Component transferred successfully',
                'data' => $component,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to transfer component',
                'error' => $e->getMessage(),
            ], 500);
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

            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'data' => [
                    'id' => $component->id,
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
}
