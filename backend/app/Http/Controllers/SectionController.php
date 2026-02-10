<?php

namespace App\Http\Controllers;

use App\Http\Requests\Section\StoreSectionRequest;
use App\Http\Requests\Section\UpdateSectionRequest;
use App\Models\Section;

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
                'data' => $sections,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch sections');
        }
    }

    /**
     * Store a newly created section.
     */
    public function store(StoreSectionRequest $request)
    {
        try {
            $section = Section::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Section created successfully',
                'data' => $section,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create section');
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
                'data' => $section,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Section not found', 404);
        }
    }

    /**
     * Update the specified section.
     */
    public function update(UpdateSectionRequest $request, $id)
    {
        try {
            $section = Section::findOrFail($id);
            $section->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Section updated successfully',
                'data' => $section,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update section');
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
                    'message' => 'Cannot delete section with assigned employees',
                ], 409);
            }

            $section->delete();

            return response()->json([
                'success' => true,
                'message' => 'Section deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete section');
        }
    }
}
