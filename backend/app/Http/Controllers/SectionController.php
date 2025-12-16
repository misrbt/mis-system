<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SectionController extends Controller
{
    /**
     * Display a listing of sections.
     */
    public function index()
    {
        try {
            $sections = Section::withCount('employees')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $sections
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sections',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created section.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:section,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $section = Section::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Section created successfully',
                'data' => $section
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified section.
     */
    public function show($id)
    {
        try {
            $section = Section::withCount('employees')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $section
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified section.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:section,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $section = Section::findOrFail($id);
            $section->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Section updated successfully',
                'data' => $section
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update section',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified section.
     */
    public function destroy($id)
    {
        try {
            $section = Section::findOrFail($id);

            // Check if section has employees
            if ($section->employees()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete section with assigned employees'
                ], 409);
            }

            $section->delete();

            return response()->json([
                'success' => true,
                'message' => 'Section deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete section',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
