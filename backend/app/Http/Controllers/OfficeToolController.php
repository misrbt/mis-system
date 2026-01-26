<?php

namespace App\Http\Controllers;

use App\Models\OfficeTool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OfficeToolController extends Controller
{
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

            // Sorting
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $officeTools = $query->get();

            return response()->json([
                'success' => true,
                'data' => $officeTools,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch office tools',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created office tool.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:office_tools,name',
            'version' => 'nullable|string|max:255',
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
            $officeTool = OfficeTool::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Office tool created successfully',
                'data' => $officeTool,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create office tool',
                'error' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => 'Office tool not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified office tool.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:office_tools,name,' . $id,
            'version' => 'nullable|string|max:255',
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
            $officeTool = OfficeTool::findOrFail($id);
            $officeTool->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Office tool updated successfully',
                'data' => $officeTool,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update office tool',
                'error' => $e->getMessage(),
            ], 500);
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete office tool',
                'error' => $e->getMessage(),
            ], 500);
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
                'message' => count($request->ids) . ' office tool(s) deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete office tools',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
