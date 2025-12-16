<?php

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StatusController extends Controller
{
    /**
     * Display a listing of statuses.
     */
    public function index()
    {
        try {
            $statuses = Status::orderBy('name', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $statuses,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statuses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created status.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:status,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $status = Status::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Status created successfully',
                'data' => $status,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified status.
     */
    public function show($id)
    {
        try {
            $status = Status::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $status,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Status not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified status.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:status,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $status = Status::findOrFail($id);
            $status->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => $status,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified status.
     */
    public function destroy($id)
    {
        try {
            $status = Status::findOrFail($id);
            $status->delete();

            return response()->json([
                'success' => true,
                'message' => 'Status deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
