<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetCategoryController extends Controller
{
    /**
     * Display a listing of asset categories.
     */
    public function index()
    {
        try {
            $categories = AssetCategory::orderBy('name', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $categories,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch asset categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created asset category.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:asset_category,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $category = AssetCategory::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Asset category created successfully',
                'data' => $category,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create asset category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified asset category.
     */
    public function show($id)
    {
        try {
            $category = AssetCategory::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $category,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Asset category not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified asset category.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:asset_category,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $category = AssetCategory::findOrFail($id);
            $category->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Asset category updated successfully',
                'data' => $category,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update asset category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified asset category.
     */
    public function destroy($id)
    {
        try {
            $category = AssetCategory::findOrFail($id);

            // Check if category has assets
            if ($category->assets()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with assigned assets',
                ], 409);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Asset category deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete asset category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
