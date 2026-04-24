<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TicketCategoryController extends Controller
{
    /**
     * List categories. By default returns only active ones (the dropdown on
     * the public submit form and the Tickets filter consume this shape).
     * Admin management page passes ?all=1 to see inactive ones too.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = TicketCategory::query();

            if (! $request->boolean('all')) {
                $query->where('is_active', true);
            }

            $categories = $query
                ->orderBy('sort_order')
                ->orderBy('name')
                ->withCount('tickets')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch ticket categories');
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $category = TicketCategory::withCount('tickets')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $category,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Category not found', 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:ticket_categories,name',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0|max:65535',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Default sort_order to "append to end" when not provided.
            if (! isset($data['sort_order'])) {
                $data['sort_order'] = (int) (TicketCategory::max('sort_order') ?? 0) + 10;
            }

            $data['is_active'] = $data['is_active'] ?? true;

            $category = TicketCategory::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Category created',
                'data' => $category,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create category');
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $category = TicketCategory::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:ticket_categories,name,'.$category->id,
                'description' => 'nullable|string|max:1000',
                'is_active' => 'nullable|boolean',
                'sort_order' => 'nullable|integer|min:0|max:65535',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $category->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Category updated',
                'data' => $category->fresh()->loadCount('tickets'),
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update category');
        }
    }

    /**
     * Quick on/off toggle — useful for retiring a category without losing
     * its historical tickets.
     */
    public function toggleActive(string $id): JsonResponse
    {
        try {
            $category = TicketCategory::findOrFail($id);
            $category->is_active = ! $category->is_active;
            $category->save();

            return response()->json([
                'success' => true,
                'message' => $category->is_active ? 'Category activated' : 'Category deactivated',
                'data' => $category,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to toggle category');
        }
    }

    /**
     * Delete refuses to drop a category that has any tickets (even
     * soft-deleted ones) — deactivate instead to keep history intact.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $category = TicketCategory::findOrFail($id);

            $inUse = Ticket::withTrashed()->where('category_id', $category->id)->exists();
            if ($inUse) {
                return response()->json([
                    'success' => false,
                    'message' => 'This category is used by existing tickets. Deactivate it instead.',
                ], 422);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete category');
        }
    }
}
