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
            $code = $this->generateCode($request->name);
            $category = AssetCategory::create([
                'name' => $request->name,
                'code' => $code,
            ]);

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
            // Preserve existing code; if missing, generate a new one based on the current name.
            $category->update([
                'name' => $request->name,
                'code' => $category->code ?: $this->generateCode($request->name, (int) $id),
            ]);

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

    /**
     * Generate a unique category code based on the category name.
     */
    private function generateCode(string $name, ?int $ignoreId = null): string
    {
        $cleaned = trim($name);
        $initials = '';

        if ($cleaned !== '') {
            $words = preg_split('/\s+/', $cleaned);
            foreach ($words as $word) {
                $initials .= mb_substr($word, 0, 1);
            }
        }

        $prefix = strtoupper($initials !== '' ? $initials : 'CAT');
        $prefix = mb_substr($prefix, 0, 4);

        $query = AssetCategory::where('code', 'like', $prefix . '-%');
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        $existingCodes = $query->pluck('code');
        $maxNumber = 0;

        foreach ($existingCodes as $code) {
            if (preg_match('/-(\d+)$/', $code, $matches)) {
                $num = (int) $matches[1];
                if ($num > $maxNumber) {
                    $maxNumber = $num;
                }
            }
        }

        $nextNumber = $maxNumber + 1;

        return sprintf('%s-%03d', $prefix, $nextNumber);
    }
}
