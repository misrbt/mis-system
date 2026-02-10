<?php

namespace App\Http\Controllers;

use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Models\Branch;

class BranchController extends Controller
{
    /**
     * Display a listing of branches.
     */
    public function index()
    {
        try {
            // Cache branches for 24 hours (86400 seconds)
            $branches = \Illuminate\Support\Facades\Cache::remember('branches_all', 86400, function () {
                return Branch::withCount('employees')
                    ->orderBy('brcode', 'asc')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $branches,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch branches');
        }
    }

    /**
     * Store a newly created branch.
     */
    public function store(StoreBranchRequest $request)
    {
        try {
            $branch = Branch::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Branch created successfully',
                'data' => $branch,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create branch');
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
                'data' => $branch,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Branch not found', 404);
        }
    }

    /**
     * Update the specified branch.
     */
    public function update(UpdateBranchRequest $request, $id)
    {
        try {
            $branch = Branch::findOrFail($id);
            $branch->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Branch updated successfully',
                'data' => $branch,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update branch');
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
                    'message' => 'Cannot delete branch with assigned employees',
                ], 409);
            }

            $branch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Branch deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete branch');
        }
    }
}
