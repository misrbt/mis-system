<?php

namespace App\Http\Controllers;

use App\Http\Requests\Position\StorePositionRequest;
use App\Http\Requests\Position\UpdatePositionRequest;
use App\Models\Position;

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
                'data' => $positions,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch positions');
        }
    }

    /**
     * Store a newly created position.
     */
    public function store(StorePositionRequest $request)
    {
        try {
            $position = Position::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Position created successfully',
                'data' => $position,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create position');
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
                'data' => $position,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Position not found', 404);
        }
    }

    /**
     * Update the specified position.
     */
    public function update(UpdatePositionRequest $request, $id)
    {
        try {
            $position = Position::findOrFail($id);
            $position->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Position updated successfully',
                'data' => $position,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update position');
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
                    'message' => 'Cannot delete position with assigned employees',
                ], 409);
            }

            $position->delete();

            return response()->json([
                'success' => true,
                'message' => 'Position deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete position');
        }
    }
}
