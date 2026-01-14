<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VendorController extends Controller
{
    /**
     * Display a listing of vendors.
     */
    public function index()
    {
        try {
            $vendors = Vendor::withCount('assets')
                ->orderBy('company_name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $vendors,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vendors',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created vendor.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255|unique:vendors,company_name',
            'contact_no' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $vendor = Vendor::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Vendor created successfully',
                'data' => $vendor,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create vendor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified vendor.
     */
    public function show($id)
    {
        try {
            $vendor = Vendor::withCount('assets')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $vendor,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified vendor.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255|unique:vendors,company_name,' . $id,
            'contact_no' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $vendor = Vendor::findOrFail($id);
            $vendor->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Vendor updated successfully',
                'data' => $vendor,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update vendor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified vendor.
     */
    public function destroy($id)
    {
        try {
            $vendor = Vendor::findOrFail($id);

            if ($vendor->assets()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete vendor with assigned assets',
                ], 409);
            }

            $vendor->delete();

            return response()->json([
                'success' => true,
                'message' => 'Vendor deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete vendor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
