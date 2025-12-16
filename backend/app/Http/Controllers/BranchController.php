<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BranchController extends Controller
{
    /**
     * Display a listing of branches.
     */
    public function index()
    {
        try {
            $branches = Branch::withCount('employees')
                ->orderBy('brcode', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $branches
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch branches',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created branch.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_name' => 'required|string|max:255|unique:branch,branch_name',
            'brak' => 'required|string|max:255',
            'brcode' => 'required|string|max:255|unique:branch,brcode',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $branch = Branch::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Branch created successfully',
                'data' => $branch
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create branch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified branch.
     */
    public function show($id)
    {
        try {
            $branch = Branch::withCount('employees')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $branch
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified branch.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'branch_name' => 'required|string|max:255|unique:branch,branch_name,' . $id,
            'brak' => 'required|string|max:255',
            'brcode' => 'required|string|max:255|unique:branch,brcode,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $branch = Branch::findOrFail($id);
            $branch->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Branch updated successfully',
                'data' => $branch
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update branch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified branch.
     */
    public function destroy($id)
    {
        try {
            $branch = Branch::findOrFail($id);

            // Check if branch has employees
            if ($branch->employees()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete branch with assigned employees'
                ], 409);
            }

            $branch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Branch deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete branch',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
