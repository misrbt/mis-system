<?php

namespace App\Http\Controllers;

use App\Http\Requests\SoftwareLicense\StoreSoftwareLicenseRequest;
use App\Http\Requests\SoftwareLicense\UpdateSoftwareLicenseRequest;
use App\Models\SoftwareLicense;
use App\Traits\ValidatesSort;
use Illuminate\Http\Request;

class SoftwareLicenseController extends Controller
{
    use ValidatesSort;

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
                'officeTool',
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

            // Sorting with SQL injection protection
            $allowedSortFields = [
                'id',
                'employee_id',
                'position_id',
                'section_id',
                'branch_id',
                'asset_category_id',
                'operating_system',
                'licensed',
                'office_tool_id',
                'client_access',
                'created_at',
                'updated_at',
            ];

            [$sortBy, $sortOrder] = $this->validateSort(
                $request->get('sort_by', 'created_at'),
                $request->get('sort_order', 'desc'),
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
            return $this->handleException($e, 'Failed to fetch software licenses');
        }
    }

    /**
     * Store a newly created software license.
     */
    public function store(StoreSoftwareLicenseRequest $request)
    {
        try {
            $license = SoftwareLicense::create($request->validated());

            // Load relationships
            $license->load([
                'employee',
                'position',
                'section',
                'branch',
                'assetCategory',
                'officeTool',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software license created successfully',
                'data' => $license,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create software license');
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
                'officeTool',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $license,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Software license not found', 404);
        }
    }

    /**
     * Update the specified software license.
     */
    public function update(UpdateSoftwareLicenseRequest $request, $id)
    {
        try {
            $license = SoftwareLicense::findOrFail($id);
            $license->update($request->validated());

            // Load relationships
            $license->load([
                'employee',
                'position',
                'section',
                'branch',
                'assetCategory',
                'officeTool',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software license updated successfully',
                'data' => $license,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update software license');
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
            return $this->handleException($e, 'Failed to delete software license');
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
                'message' => count($request->ids).' software license(s) deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete software licenses');
        }
    }
}
