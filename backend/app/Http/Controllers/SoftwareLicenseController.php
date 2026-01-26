<?php

namespace App\Http\Controllers;

use App\Models\SoftwareLicense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SoftwareLicenseController extends Controller
{
    /**
     * Display a listing of software licenses.
     */
    public function index(Request $request)
    {
        try {
            $query = SoftwareLicense::with([
                'employee',
                'position',
                'section',
                'branch',
                'assetCategory',
                'officeTool'
            ]);

            // Filter by employee
            if ($request->has('employee_id') && $request->employee_id) {
                $query->where('employee_id', $request->employee_id);
            }

            // Filter by branch
            if ($request->has('branch_id') && $request->branch_id) {
                $query->where('branch_id', $request->branch_id);
            }

            // Filter by section
            if ($request->has('section_id') && $request->section_id) {
                $query->where('section_id', $request->section_id);
            }

            // Filter by position
            if ($request->has('position_id') && $request->position_id) {
                $query->where('position_id', $request->position_id);
            }

            // Filter by asset category
            if ($request->has('asset_category_id') && $request->asset_category_id) {
                $query->where('asset_category_id', $request->asset_category_id);
            }

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('operating_system', 'like', "%{$search}%")
                        ->orWhere('licensed', 'like', "%{$search}%")
                        ->orWhere('client_access', 'like', "%{$search}%")
                        ->orWhereHas('officeTool', function ($ot) use ($search) {
                            $ot->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('employee', function ($emp) use ($search) {
                            $emp->where('fullname', 'like', "%{$search}%");
                        });
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $licenses = $query->get();

            return response()->json([
                'success' => true,
                'data' => $licenses,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch software licenses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created software license.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'nullable|exists:employee,id',
            'position_id' => 'nullable|exists:position,id',
            'section_id' => 'nullable|exists:section,id',
            'branch_id' => 'nullable|exists:branch,id',
            'asset_category_id' => 'nullable|exists:asset_category,id',
            'operating_system' => 'nullable|string|max:255',
            'licensed' => 'nullable|string|max:255',
            'office_tool_id' => 'nullable|exists:office_tools,id',
            'client_access' => 'nullable|string|max:255',
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
            $license = SoftwareLicense::create($request->all());

            // Load relationships
            $license->load([
                'employee',
                'position',
                'section',
                'branch',
                'assetCategory',
                'officeTool'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software license created successfully',
                'data' => $license,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create software license',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified software license.
     */
    public function show($id)
    {
        try {
            $license = SoftwareLicense::with([
                'employee',
                'position',
                'section',
                'branch',
                'assetCategory',
                'officeTool'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $license,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Software license not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified software license.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'nullable|exists:employee,id',
            'position_id' => 'nullable|exists:position,id',
            'section_id' => 'nullable|exists:section,id',
            'branch_id' => 'nullable|exists:branch,id',
            'asset_category_id' => 'nullable|exists:asset_category,id',
            'operating_system' => 'nullable|string|max:255',
            'licensed' => 'nullable|string|max:255',
            'office_tool_id' => 'nullable|exists:office_tools,id',
            'client_access' => 'nullable|string|max:255',
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
            $license = SoftwareLicense::findOrFail($id);
            $license->update($request->all());

            // Load relationships
            $license->load([
                'employee',
                'position',
                'section',
                'branch',
                'assetCategory',
                'officeTool'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software license updated successfully',
                'data' => $license,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update software license',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified software license.
     */
    public function destroy($id)
    {
        try {
            $license = SoftwareLicense::findOrFail($id);
            $license->delete();

            return response()->json([
                'success' => true,
                'message' => 'Software license deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete software license',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk delete software licenses.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|exists:software_licenses,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            SoftwareLicense::whereIn('id', $request->ids)->delete();

            return response()->json([
                'success' => true,
                'message' => count($request->ids) . ' software license(s) deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete software licenses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
