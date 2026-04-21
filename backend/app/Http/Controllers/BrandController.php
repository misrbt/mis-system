<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\EquipmentModel;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /**
     * List all brands.
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        $brands = Brand::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $brands,
        ]);
    }

    /**
     * Create a new brand.
     */
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
        ]);

        $brand = Brand::create(['name' => trim($request->name)]);

        return response()->json([
            'success' => true,
            'message' => 'Brand created successfully',
            'data' => $brand,
        ], 201);
    }

    /**
     * List models for a specific brand.
     */
    public function models(Brand $brand): \Illuminate\Http\JsonResponse
    {
        $models = $brand->equipmentModels()->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $models,
        ]);
    }

    /**
     * Create a new model under a brand.
     */
    public function storeModel(Request $request, Brand $brand): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $exists = $brand->equipmentModels()
            ->where('name', trim($request->name))
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This model already exists for this brand',
            ], 422);
        }

        $model = $brand->equipmentModels()->create([
            'name' => trim($request->name),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Model created successfully',
            'data' => $model,
        ], 201);
    }

    /**
     * List all models (with brand info).
     */
    public function allModels(): \Illuminate\Http\JsonResponse
    {
        $models = EquipmentModel::with('brand')
            ->orderBy('brand_id')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $models,
        ]);
    }
}
