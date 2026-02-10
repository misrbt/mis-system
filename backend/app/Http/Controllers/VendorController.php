<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Models\Vendor;

class VendorController extends Controller
{
    /**
     * Display a listing of vendors.
     */
    public function index()
    {
        try {
            // Cache vendors for 24 hours (86400 seconds)
            $vendors = \Illuminate\Support\Facades\Cache::remember('vendors_all', 86400, function () {
                return Vendor::withCount('assets')
                    ->orderBy('company_name', 'asc')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $vendors,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch vendors');
        }
    }

    /**
     * Store a newly created vendor.
     */
    public function store(StoreVendorRequest $request)
    {
        try {
            $vendor = Vendor::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Vendor created successfully',
                'data' => $vendor,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create vendor');
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
            return $this->handleException($e, 'Vendor not found', 404);
        }
    }

    /**
     * Update the specified vendor.
     */
    public function update(UpdateVendorRequest $request, $id)
    {
        try {
            $vendor = Vendor::findOrFail($id);
            $vendor->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Vendor updated successfully',
                'data' => $vendor,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update vendor');
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
            return $this->handleException($e, 'Failed to delete vendor');
        }
    }
}
