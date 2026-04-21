<?php

namespace App\Http\Controllers;

use App\Http\Requests\Equipment\StoreEquipmentRequest;
use App\Http\Requests\Equipment\UpdateEquipmentRequest;
use App\Models\Brand;
use App\Models\Equipment;
use App\Models\EquipmentModel;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    /**
     * Get all equipment
     */
    public function index(Request $request)
    {
        try {
            $query = Equipment::with(['category', 'subcategory', 'brandRelation', 'equipmentModel']);

            // Search by brand or model
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%");
                });
            }

            $equipment = $query->orderBy('brand')->orderBy('model')->get();

            return response()->json([
                'success' => true,
                'data' => $equipment,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch equipment');
        }
    }

    /**
     * Get a specific equipment
     */
    public function show($id)
    {
        try {
            $equipment = Equipment::with(['assets', 'category', 'subcategory'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $equipment,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Equipment not found', 404);
        }
    }

    /**
     * Create new equipment
     */
    public function store(StoreEquipmentRequest $request)
    {
        try {
            [$brandId, $modelId, $brandName, $modelName] = $this->resolveBrandAndModel($request);

            $equipment = Equipment::create([
                'brand' => $brandName,
                'model' => $modelName,
                'brand_id' => $brandId,
                'equipment_model_id' => $modelId,
                'description' => $request->description,
                'asset_category_id' => $request->input('asset_category_id') ?: null,
                'subcategory_id' => $request->input('subcategory_id') ?: null,
            ]);

            $equipment->load(['brandRelation', 'equipmentModel', 'category', 'subcategory']);

            return response()->json([
                'success' => true,
                'message' => 'Equipment created successfully',
                'data' => $equipment,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create equipment');
        }
    }

    /**
     * Update equipment
     */
    public function update(UpdateEquipmentRequest $request, $id)
    {
        try {
            $equipment = Equipment::findOrFail($id);

            [$brandId, $modelId, $brandName, $modelName] = $this->resolveBrandAndModel($request);

            $equipment->update([
                'brand' => $brandName,
                'model' => $modelName,
                'brand_id' => $brandId,
                'equipment_model_id' => $modelId,
                'description' => $request->description,
                'asset_category_id' => $request->input('asset_category_id') ?: null,
                'subcategory_id' => $request->input('subcategory_id') ?: null,
            ]);

            $equipment->load(['brandRelation', 'equipmentModel', 'category', 'subcategory']);

            return response()->json([
                'success' => true,
                'message' => 'Equipment updated successfully',
                'data' => $equipment,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update equipment');
        }
    }

    /**
     * Get equipment assignments (employees and branches using this equipment)
     */
    public function getAssignments($id)
    {
        try {
            $equipment = Equipment::with(['category', 'subcategory'])->findOrFail($id);

            // Get all assets using this equipment with their assigned employees and branches
            $assets = \App\Models\Asset::with([
                'assigned_employee.branch',
                'assigned_employee.position',
                'status',
            ])
                ->where('equipment_id', $id)
                ->whereNotNull('assigned_to_employee_id')
                ->get();

            // Format the response
            $assignments = $assets->map(function ($asset) {
                return [
                    'asset_id' => $asset->id,
                    'asset_name' => $asset->asset_name,
                    'serial_number' => $asset->serial_number,
                    'employee_id' => $asset->assigned_employee->id ?? null,
                    'employee_name' => $asset->assigned_employee->fullname ?? null,
                    'branch_id' => $asset->assigned_employee->branch->id ?? null,
                    'branch_name' => $asset->assigned_employee->branch->branch_name ?? null,
                    'position' => $asset->assigned_employee->position->title ?? null,
                    'status_id' => $asset->status->id ?? null,
                    'status_name' => $asset->status->name ?? null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'equipment' => $equipment,
                    'assignments' => $assignments,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch equipment assignments');
        }
    }

    /**
     * Delete equipment
     */
    public function destroy($id)
    {
        try {
            $equipment = Equipment::findOrFail($id);

            // Check if equipment is being used by any assets
            if ($equipment->assets()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete equipment that is being used by assets',
                ], 400);
            }

            $equipment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Equipment deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete equipment');
        }
    }

    /**
     * Resolve brand_id and equipment_model_id from request.
     * Accepts either IDs (brand_id, equipment_model_id) or text (brand, model).
     * Auto-creates brand/model records when text is provided without matching IDs.
     *
     * @return array{0: ?int, 1: ?int, 2: string, 3: string}
     */
    private function resolveBrandAndModel(Request $request): array
    {
        $brandId = $request->input('brand_id') ?: null;
        $modelId = $request->input('equipment_model_id') ?: null;
        $brandName = trim($request->input('brand', ''));
        $modelName = trim($request->input('model', ''));

        // Resolve brand: use brand_id if provided, otherwise find or create from text
        if (! $brandId && $brandName) {
            $brand = Brand::firstOrCreate(['name' => $brandName]);
            $brandId = $brand->id;
        }

        // Resolve model: use equipment_model_id if provided, otherwise find or create from text
        if (! $modelId && $modelName && $brandId) {
            $model = EquipmentModel::firstOrCreate([
                'brand_id' => $brandId,
                'name' => $modelName,
            ]);
            $modelId = $model->id;
        }

        // Ensure text fields stay in sync with the resolved records
        if ($brandId && ! $brandName) {
            $brandName = Brand::find($brandId)?->name ?? '';
        }
        if ($modelId && ! $modelName) {
            $modelName = EquipmentModel::find($modelId)?->name ?? '';
        }

        return [$brandId, $modelId, $brandName, $modelName];
    }
}
