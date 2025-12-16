<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            'fullname' => 'required|string|max:255',
            'branch_id' => 'required|exists:branch,id',
            'department_id' => 'nullable|exists:section,id',
            'position_id' => 'required|exists:position,id',
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
            'fullname' => 'required|string|max:255',
            'branch_id' => 'required|exists:branch,id',
            'department_id' => 'nullable|exists:section,id',
            'position_id' => 'required|exists:position,id',
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
}
