<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EquipmentController extends Controller
{
    /**
     * Get all equipment
     */
    public function index(Request $request)
    {
        try {
            $query = Equipment::query();

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
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch equipment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific equipment
     */
    public function show($id)
    {
        try {
            $equipment = Equipment::with(['assets'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $equipment,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Equipment not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Create new equipment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $equipment = Equipment::create([
                'brand' => $request->brand,
                'model' => $request->model,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Equipment created successfully',
                'data' => $equipment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create equipment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update equipment
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $equipment = Equipment::findOrFail($id);

            $equipment->update([
                'brand' => $request->brand,
                'model' => $request->model,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Equipment updated successfully',
                'data' => $equipment,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update equipment',
                'error' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete equipment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
