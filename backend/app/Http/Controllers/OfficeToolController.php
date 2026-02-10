<?php

namespace App\Http\Controllers;

use App\Http\Requests\OfficeTool\StoreOfficeToolRequest;
use App\Http\Requests\OfficeTool\UpdateOfficeToolRequest;
use App\Models\OfficeTool;
use App\Traits\ValidatesSort;
use Illuminate\Http\Request;

class OfficeToolController extends Controller
{
    use ValidatesSort;

    /**
     * Display a listing of office tools.
     */
    public function index(Request $request)
    {
        try {
            $query = OfficeTool::query();

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('version', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Sorting with SQL injection protection
            $allowedSortFields = ['id', 'name', 'version', 'description', 'created_at', 'updated_at'];

            [$sortBy, $sortOrder] = $this->validateSort(
                $request->get('sort_by', 'name'),
                $request->get('sort_order', 'asc'),
                $allowedSortFields
            );

            $query->orderBy($sortBy, $sortOrder);

            // Pagination - limit results per page (max 100)
            $perPage = min($request->get('per_page', 50), 100);
            $paginated = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'total' => $paginated->total(),
                    'per_page' => $paginated->perPage(),
                    'last_page' => $paginated->lastPage(),
                    'from' => $paginated->firstItem(),
                    'to' => $paginated->lastItem(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch office tools');
        }
    }

    /**
     * Store a newly created office tool.
     */
    public function store(StoreOfficeToolRequest $request)
    {
        try {
            $officeTool = OfficeTool::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Office tool created successfully',
                'data' => $officeTool,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create office tool');
        }
    }

    /**
     * Display the specified office tool.
     */
    public function show($id)
    {
        try {
            $officeTool = OfficeTool::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $officeTool,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Office tool not found', 404);
        }
    }

    /**
     * Update the specified office tool.
     */
    public function update(UpdateOfficeToolRequest $request, $id)
    {
        try {
            $officeTool = OfficeTool::findOrFail($id);
            $officeTool->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Office tool updated successfully',
                'data' => $officeTool,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update office tool');
        }
    }

    /**
     * Remove the specified office tool.
     */
    public function destroy($id)
    {
        try {
            $officeTool = OfficeTool::findOrFail($id);

            // Check if office tool is being used by any software licenses
            if ($officeTool->softwareLicenses()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete office tool that is assigned to software licenses',
                ], 409);
            }

            $officeTool->delete();

            return response()->json([
                'success' => true,
                'message' => 'Office tool deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete office tool');
        }
    }

    /**
     * Bulk delete office tools.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|exists:office_tools,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check if any of the office tools are being used
            $inUse = OfficeTool::whereIn('id', $request->ids)
                ->whereHas('softwareLicenses')
                ->count();

            if ($inUse > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some office tools are assigned to software licenses and cannot be deleted',
                ], 409);
            }

            OfficeTool::whereIn('id', $request->ids)->delete();

            return response()->json([
                'success' => true,
                'message' => count($request->ids).' office tool(s) deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete office tools');
        }
    }
}
