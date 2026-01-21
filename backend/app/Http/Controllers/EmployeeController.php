<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\AssetMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index()
    {
        try {
            $employees = Employee::with(['branch', 'position', 'department'])
                ->orderBy('fullname', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $employees,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch employees',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullname' => [
                'required',
                'string',
                'max:255',
                Rule::unique('employee', 'fullname')->where(function ($query) use ($request) {
                    return $query
                        ->where('branch_id', $request->branch_id)
                        ->where('department_id', $request->department_id)
                        ->where('position_id', $request->position_id);
                }),
            ],
            'branch_id' => 'required|exists:branch,id',
            'department_id' => 'nullable|exists:section,id',
            'position_id' => 'required|exists:position,id',
        ], [
            'fullname.unique' => 'An employee with the same name, branch, department, and position already exists.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $employee = Employee::create($request->all());
            $employee->load(['branch', 'position', 'department']);

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'data' => $employee,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified employee.
     */
    public function show($id)
    {
        try {
            $employee = Employee::with(['branch', 'position', 'department', 'assignedAssets'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $employee,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'fullname' => [
                'required',
                'string',
                'max:255',
                Rule::unique('employee', 'fullname')->where(function ($query) use ($request) {
                    return $query
                        ->where('branch_id', $request->branch_id)
                        ->where('department_id', $request->department_id)
                        ->where('position_id', $request->position_id);
                })->ignore($id),
            ],
            'branch_id' => 'required|exists:branch,id',
            'department_id' => 'nullable|exists:section,id',
            'position_id' => 'required|exists:position,id',
        ], [
            'fullname.unique' => 'An employee with the same name, branch, department, and position already exists.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $employee = Employee::findOrFail($id);
            $employee->update($request->all());
            $employee->load(['branch', 'position', 'department']);

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'data' => $employee,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update employee',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified employee.
     */
    public function destroy($id)
    {
        try {
            $employee = Employee::findOrFail($id);

            // Check if employee has assigned assets
            if ($employee->assignedAssets()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete employee with assigned assets',
                ], 409);
            }

            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete employee',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get asset movement history for a specific employee
     * Returns only movements where this employee was directly involved
     */
    public function getAssetHistory($id, Request $request)
    {
        try {
            $employee = Employee::findOrFail($id);

            // Fetch only movements where this employee was directly involved
            // This includes:
            // 1. Assets assigned TO this employee (to_employee_id)
            // 2. Assets transferred FROM this employee (from_employee_id)
            // 3. Movements for assets currently assigned to this employee
            $query = AssetMovement::with([
                'asset.category',
                'asset.status',
                'asset.vendor',
                'fromEmployee.branch',
                'fromEmployee.position',
                'toEmployee.branch',
                'toEmployee.position',
                'fromStatus',
                'toStatus',
                'fromBranch',
                'toBranch',
                'repair.vendor',
                'performedBy',
            ])
            ->where(function ($query) use ($id) {
                $query->where('to_employee_id', $id)
                      ->orWhere('from_employee_id', $id)
                      ->orWhereHas('asset', function ($q) use ($id) {
                          $q->where('assigned_to_employee_id', $id);
                      });
            });

            // Apply filters
            if ($request->has('movement_type') && $request->movement_type) {
                $types = is_array($request->movement_type) ? $request->movement_type : [$request->movement_type];
                $query->whereIn('movement_type', $types);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('movement_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('movement_date', '<=', $request->date_to);
            }

            if ($request->has('asset_id') && $request->asset_id) {
                $query->where('asset_id', $request->asset_id);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'movement_date');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            if ($sortBy !== 'created_at') {
                $query->orderBy('created_at', 'desc');
            }

            // Pagination
            $perPage = $request->get('per_page', 50);
            $movements = $query->paginate($perPage);

            // Enhance each movement with description, icon, and color
            $movements->getCollection()->transform(function ($movement) {
                return array_merge($movement->toArray(), [
                    'description' => $movement->getMovementDescription(),
                    'icon' => $movement->getIconClass(),
                    'color' => $movement->getColorClass(),
                ]);
            });

            // Get statistics for movements involving this employee
            $statsQuery = AssetMovement::where(function ($q) use ($id) {
                $q->where('to_employee_id', $id)
                  ->orWhere('from_employee_id', $id)
                  ->orWhereHas('asset', function ($query) use ($id) {
                      $query->where('assigned_to_employee_id', $id);
                  });
            });

            // Get unique asset IDs from the movements
            $uniqueAssetIds = (clone $statsQuery)->distinct()->pluck('asset_id')->toArray();

            // Get currently assigned assets count
            $currentlyAssignedCount = DB::table('assets')
                ->where('assigned_to_employee_id', $id)
                ->count();

            $stats = [
                'total_movements' => (clone $statsQuery)->count(),
                'total_assets' => count($uniqueAssetIds),
                'currently_assigned' => $currentlyAssignedCount,
                'by_type' => (clone $statsQuery)
                    ->select('movement_type', DB::raw('count(*) as count'))
                    ->groupBy('movement_type')
                    ->pluck('count', 'movement_type'),
            ];

            return response()->json([
                'success' => true,
                'data' => $movements->items(),
                'meta' => [
                    'total' => $movements->total(),
                    'per_page' => $movements->perPage(),
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                ],
                'statistics' => $stats,
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->fullname,
                    'position' => $employee->position?->position_name,
                    'branch' => $employee->branch?->branch_name,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch employee asset history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
