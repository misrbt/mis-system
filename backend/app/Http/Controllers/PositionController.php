<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PositionController extends Controller
{
    /**
     * Display a listing of positions.
     */
    public function index()
    {
        try {
            $positions = Position::withCount('employees')
                ->orderBy('title', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $positions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch positions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created position.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:position,title',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $position = Position::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Position created successfully',
                'data' => $position
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified position.
     */
    public function show($id)
    {
        try {
            $position = Position::withCount('employees')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $position
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Position not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified position.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:position,title,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $position = Position::findOrFail($id);
            $position->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Position updated successfully',
                'data' => $position
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified position.
     */
    public function destroy($id)
    {
        try {
            $position = Position::findOrFail($id);

            // Check if position has employees
            if ($position->employees()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete position with assigned employees'
                ], 409);
            }

            $position->delete();

            return response()->json([
                'success' => true,
                'message' => 'Position deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete position',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
