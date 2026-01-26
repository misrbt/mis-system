<?php

namespace App\Http\Controllers;

use App\Models\AssetSubcategory;
use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AssetSubcategoryController extends Controller
{
    /**
     * Display a listing of subcategories
     */
    public function index(Request $request)
    {
        try {
            $query = AssetSubcategory::with(['category']);

            // Filter by category if provided
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $subcategories = $query->orderBy('name', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $subcategories,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subcategories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get subcategories for a specific category
     */
    public function getByCategory($categoryId)
    {
        try {
            $category = AssetCategory::findOrFail($categoryId);

            $subcategories = AssetSubcategory::where('category_id', $categoryId)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $subcategories,
                'category' => $category,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subcategories for category',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Store a newly created subcategory
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:asset_category,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('asset_subcategories')->where(function ($query) use ($request) {
                    return $query->where('category_id', $request->category_id);
                }),
            ],
            'description' => 'nullable|string',
        ], [
            'name.unique' => 'A subcategory with this name already exists in this category.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $subcategory = AssetSubcategory::create([
                'category_id' => $request->category_id,
                'name' => $request->name,
                'description' => $request->description,
            ]);

            $subcategory->load('category');
            $subcategory->assets_count = 0;

            return response()->json([
                'success' => true,
                'message' => 'Subcategory created successfully',
                'data' => $subcategory,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create subcategory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified subcategory
     */
    public function show($id)
    {
        try {
            $subcategory = AssetSubcategory::with(['category', 'assets'])->findOrFail($id);
            $subcategory->assets_count = $subcategory->assets()->count();

            return response()->json([
                'success' => true,
                'data' => $subcategory,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Subcategory not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified subcategory
     */
    public function update(Request $request, $id)
    {
        $subcategory = AssetSubcategory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:asset_category,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('asset_subcategories')->where(function ($query) use ($request) {
                    return $query->where('category_id', $request->category_id);
                })->ignore($id),
            ],
            'description' => 'nullable|string',
        ], [
            'name.unique' => 'A subcategory with this name already exists in this category.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            if ($request->category_id != $subcategory->category_id) {
                $assetsCount = $subcategory->assets()->count();
                if ($assetsCount > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => "Cannot change category. This subcategory is assigned to {$assetsCount} asset(s).",
                    ], 400);
                }
            }

            $subcategory->update([
                'category_id' => $request->category_id,
                'name' => $request->name,
                'description' => $request->description,
            ]);

            $subcategory->load('category');
            $subcategory->assets_count = $subcategory->assets()->count();

            return response()->json([
                'success' => true,
                'message' => 'Subcategory updated successfully',
                'data' => $subcategory,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update subcategory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified subcategory
     */
    public function destroy($id)
    {
        try {
            $subcategory = AssetSubcategory::findOrFail($id);

            $assetsCount = $subcategory->assets()->count();
            if ($assetsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete subcategory. It is assigned to {$assetsCount} asset(s).",
                    'assets_count' => $assetsCount,
                ], 400);
            }

            $subcategory->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subcategory deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete subcategory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
