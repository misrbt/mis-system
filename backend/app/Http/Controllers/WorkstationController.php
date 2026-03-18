<?php

namespace App\Http\Controllers;

use App\Http\Requests\Workstation\AssignAssetRequest;
use App\Http\Requests\Workstation\AssignEmployeeRequest;
use App\Http\Requests\Workstation\StoreWorkstationRequest;
use App\Http\Requests\Workstation\TransferAssetRequest;
use App\Http\Requests\Workstation\UpdateWorkstationRequest;
use App\Models\Workstation;
use App\Services\WorkstationService;
use Illuminate\Http\Request;

class WorkstationController extends Controller
{
    public function __construct(
        protected WorkstationService $workstationService
    ) {}

    /**
     * Display a listing of workstations.
     */
    public function index(Request $request)
    {
        try {
            $query = Workstation::with(['branch', 'position', 'employee'])
                ->withCount('assets');

            // Filter by branch
            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }

            // Filter by position
            if ($request->has('position_id')) {
                $query->where('position_id', $request->position_id);
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search by name
            if ($request->has('search')) {
                $search = $request->search;
                $query->where('name', 'ilike', "%{$search}%");
            }

            $workstations = $query->orderBy('branch_id')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $workstations,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch workstations');
        }
    }

    /**
     * Store a newly created workstation.
     */
    public function store(StoreWorkstationRequest $request)
    {
        try {
            $workstation = $this->workstationService->createFromBranchPosition(
                $request->branch_id,
                $request->position_id,
                $request->name,
                $request->description
            );

            // Update is_active if provided
            if ($request->has('is_active')) {
                $workstation->is_active = $request->boolean('is_active');
                $workstation->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Workstation created successfully',
                'data' => $workstation->load(['branch', 'position']),
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create workstation');
        }
    }

    /**
     * Display the specified workstation with assets and employees.
     */
    public function show($id)
    {
        try {
            $workstation = Workstation::with([
                'branch',
                'position',
                'assets' => function ($query) {
                    $query->with(['category', 'status', 'assignedEmployee']);
                },
                'employee.branch',
                'employee.position',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $workstation,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Workstation not found', 404);
        }
    }

    /**
     * Update the specified workstation.
     */
    public function update(UpdateWorkstationRequest $request, $id)
    {
        try {
            $workstation = Workstation::findOrFail($id);
            $workstation->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Workstation updated successfully',
                'data' => $workstation->load(['branch', 'position']),
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update workstation');
        }
    }

    /**
     * Remove the specified workstation.
     */
    public function destroy($id)
    {
        try {
            $workstation = Workstation::withCount('assets')->findOrFail($id);

            // Check if workstation has assets
            if ($workstation->assets_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete workstation with assigned assets. Please reassign or remove assets first.',
                ], 409);
            }

            // Check if workstation has an employee
            if ($workstation->employee_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete workstation with assigned employee. Please unassign employee first.',
                ], 409);
            }

            $workstation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Workstation deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete workstation');
        }
    }

    /**
     * Assign an employee to a workstation.
     */
    public function assignEmployee(AssignEmployeeRequest $request, $id)
    {
        try {
            $result = $this->workstationService->assignEmployee($id, $request->employee_id);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => $result['workstation'],
            ], $result['success'] ? 200 : 409);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to assign employee');
        }
    }

    /**
     * Unassign an employee from a workstation.
     */
    public function unassignEmployee(AssignEmployeeRequest $request, $id)
    {
        try {
            $result = $this->workstationService->unassignEmployee($id, $request->employee_id);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => $result['workstation'],
            ], $result['success'] ? 200 : 409);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to unassign employee');
        }
    }

    /**
     * Assign an asset to a workstation.
     */
    public function assignAsset(AssignAssetRequest $request, $id)
    {
        try {
            $result = $this->workstationService->assignAsset($id, $request->asset_id);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => $result['asset'],
            ], $result['success'] ? 200 : 409);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to assign asset');
        }
    }

    /**
     * Transfer an asset from this workstation to another.
     */
    public function transferAsset(TransferAssetRequest $request, $id)
    {
        try {
            $result = $this->workstationService->transferAsset(
                $request->asset_id,
                $id,
                $request->to_workstation_id
            );

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => $result['asset'],
            ], $result['success'] ? 200 : 409);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to transfer asset');
        }
    }

    /**
     * Get workstations for a specific branch.
     */
    public function byBranch($branchId)
    {
        try {
            $workstations = Workstation::with(['position', 'employee'])
                ->withCount('assets')
                ->where('branch_id', $branchId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $workstations,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch workstations for branch');
        }
    }

    /**
     * Get assets at a specific workstation.
     */
    public function assets($id)
    {
        try {
            $workstation = Workstation::findOrFail($id);

            $assets = $workstation->assets()
                ->with(['category', 'status', 'assignedEmployee', 'vendor'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $assets,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch workstation assets');
        }
    }

    /**
     * Get employee assigned to a specific workstation.
     */
    public function employees($id)
    {
        try {
            $workstation = Workstation::with(['employee.branch', 'employee.position', 'employee.department'])
                ->findOrFail($id);

            // Return employee in array format for backward compatibility
            $employees = $workstation->employee ? [$workstation->employee] : [];

            return response()->json([
                'success' => true,
                'data' => $employees,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch workstation employee');
        }
    }
}
