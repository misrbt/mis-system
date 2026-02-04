<?php

namespace App\Http\Controllers;

use App\Models\Replenishment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReplenishmentController extends Controller
{
    /**
     * Get all replenishments with filters
     */
    public function index(Request $request)
    {
        try {
            $query = Replenishment::with([
                'category',
                'subcategory',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedBranch'
            ]);

            // Filter by category
            if ($request->has('category_id') && $request->category_id) {
                $query->where('asset_category_id', $request->category_id);
            }

            // Filter by status
            if ($request->has('status_id') && $request->status_id) {
                $query->where('status_id', $request->status_id);
            }

            // Filter by branch (assigned to branch)
            if ($request->has('branch_id') && $request->branch_id) {
                $query->where('assigned_to_branch_id', $request->branch_id);
            }

            // Filter by vendor
            if ($request->has('vendor_id') && $request->vendor_id) {
                $query->where('vendor_id', $request->vendor_id);
            }

            // Search by asset name, serial number, brand, or model
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('asset_name', 'like', "%{$search}%")
                        ->orWhere('serial_number', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%");
                });
            }

            // Filter by assignment status
            if ($request->has('assignment_status') && $request->assignment_status) {
                if ($request->assignment_status === 'assigned') {
                    $query->where(function ($q) {
                        $q->whereNotNull('assigned_to_employee_id')
                            ->orWhereNotNull('assigned_to_branch_id');
                    });
                } elseif ($request->assignment_status === 'unassigned') {
                    $query->whereNull('assigned_to_employee_id')
                        ->whereNull('assigned_to_branch_id');
                }
            }

            $replenishments = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $replenishments,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch replenishments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new replenishment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_category,id',
            'subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'acq_cost' => 'nullable|numeric|min:0',
            'book_value' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'warranty_expiration_date' => 'nullable|date',
            'estimate_life' => 'nullable|integer|min:0',
            'vendor_id' => 'nullable|exists:vendors,id',
            'status_id' => 'nullable|exists:status,id',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
            'assigned_to_branch_id' => 'nullable|exists:branches,id',
            'remarks' => 'nullable|string',
            'specifications' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $replenishment = Replenishment::create([
                'asset_name' => $request->asset_name,
                'serial_number' => $request->serial_number,
                'asset_category_id' => $request->asset_category_id,
                'subcategory_id' => $request->subcategory_id,
                'brand' => $request->brand,
                'model' => $request->model,
                'acq_cost' => $request->acq_cost,
                // 'book_value' => $request->book_value, // We verify/calc this below
                'purchase_date' => $request->purchase_date,
                'warranty_expiration_date' => $request->warranty_expiration_date,
                'estimate_life' => $request->estimate_life,
                'vendor_id' => $request->vendor_id,
                'status_id' => $request->status_id,
                'assigned_to_employee_id' => $request->assigned_to_employee_id,
                'assigned_to_branch_id' => $request->assigned_to_branch_id,
                'remarks' => $request->remarks,
                'specifications' => $request->specifications,
            ]);

            // Calculate and set initial book value
            $bookValueCalc = $replenishment->calculateBookValue();
            $replenishment->book_value = $bookValueCalc['book_value'];
            $replenishment->save();

            $replenishment->load([
                'category',
                'subcategory',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedBranch'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Replenishment created successfully',
                'data' => $replenishment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create replenishment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific replenishment
     */
    public function show($id)
    {
        try {
            $replenishment = Replenishment::with([
                'category',
                'subcategory',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedBranch'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $replenishment,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Replenishment not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update a replenishment
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'asset_name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_category,id',
            'subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'acq_cost' => 'nullable|numeric|min:0',
            'book_value' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'warranty_expiration_date' => 'nullable|date',
            'estimate_life' => 'nullable|integer|min:0',
            'vendor_id' => 'nullable|exists:vendors,id',
            'status_id' => 'nullable|exists:status,id',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
            'assigned_to_branch_id' => 'nullable|exists:branches,id',
            'remarks' => 'nullable|string',
            'specifications' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $replenishment = Replenishment::findOrFail($id);

            // Check if depreciation-related fields are being updated
            $needsRecalculation = $request->has('purchase_date')
                || $request->has('acq_cost')
                || $request->has('estimate_life');

            $replenishment->update([
                'asset_name' => $request->asset_name,
                'serial_number' => $request->serial_number,
                'asset_category_id' => $request->asset_category_id,
                'subcategory_id' => $request->subcategory_id,
                'brand' => $request->brand,
                'model' => $request->model,
                'acq_cost' => $request->acq_cost,
                // 'book_value' => $request->book_value, // Calculated below if needed
                'purchase_date' => $request->purchase_date,
                'warranty_expiration_date' => $request->warranty_expiration_date,
                'estimate_life' => $request->estimate_life,
                'vendor_id' => $request->vendor_id,
                'status_id' => $request->status_id,
                'assigned_to_employee_id' => $request->assigned_to_employee_id,
                'assigned_to_branch_id' => $request->assigned_to_branch_id,
                'remarks' => $request->remarks,
                'specifications' => $request->specifications,
            ]);

            // Recalculate book value if needed
            if ($needsRecalculation) {
                $bookValueCalc = $replenishment->calculateBookValue();
                $replenishment->book_value = $bookValueCalc['book_value'];
                $replenishment->save();
            }

            $replenishment->load([
                'category',
                'subcategory',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedBranch'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Replenishment updated successfully',
                'data' => $replenishment,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update replenishment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a replenishment
     */
    public function destroy($id)
    {
        try {
            $replenishment = Replenishment::findOrFail($id);
            $replenishment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Replenishment deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete replenishment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign replenishment to an employee
     * This moves the replenishment to the assets table and assigns it to the employee
     */
    public function assignToEmployee(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employee,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $replenishment = Replenishment::findOrFail($id);

            // Get employee to retrieve their branch
            $employee = \App\Models\Employee::findOrFail($request->employee_id);

            // Create new asset from replenishment data
            $asset = \App\Models\Asset::create([
                'asset_name' => $replenishment->asset_name,
                'asset_category_id' => $replenishment->asset_category_id,
                'subcategory_id' => $replenishment->subcategory_id,
                'serial_number' => $replenishment->serial_number,
                'purchase_date' => $replenishment->purchase_date,
                'acq_cost' => $replenishment->acq_cost,
                'book_value' => $replenishment->book_value ?? $replenishment->acq_cost,
                'waranty_expiration_date' => $replenishment->warranty_expiration_date,
                'estimate_life' => $replenishment->estimate_life,
                'vendor_id' => $replenishment->vendor_id,
                'status_id' => $replenishment->status_id,
                'remarks' => $replenishment->remarks,
                'specifications' => $replenishment->specifications,
                'assigned_to_employee_id' => $request->employee_id,
            ]);

            // Generate QR code and barcode for the new asset
            try {
                $asset->generateAndSaveQRCode('simple', true);
                $asset->generateAndSaveBarcode();
            } catch (\Exception $e) {
                \Log::warning('Failed to generate QR/Barcode for asset ' . $asset->id . ': ' . $e->getMessage());
            }

            // Load relationships for the asset
            $asset->load([
                'category',
                'subcategory',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
            ]);

            // Delete the replenishment since it's now an asset
            $replenishment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Reserve asset has been deployed and assigned to ' . $employee->fullname,
                'data' => $asset,
                'deployed' => true,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign replenishment to employee',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign replenishment to a branch
     */
    public function assignToBranch(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $replenishment = Replenishment::findOrFail($id);

            $replenishment->update([
                'assigned_to_branch_id' => $request->branch_id,
                'assigned_to_employee_id' => null, // Clear employee assignment when assigning to branch
            ]);

            $replenishment->load([
                'category',
                'subcategory',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedBranch'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Replenishment assigned to branch successfully',
                'data' => $replenishment,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign replenishment to branch',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove assignment from replenishment
     */
    public function removeAssignment($id)
    {
        try {
            $replenishment = Replenishment::findOrFail($id);

            $replenishment->update([
                'assigned_to_employee_id' => null,
                'assigned_to_branch_id' => null,
            ]);

            $replenishment->load([
                'category',
                'subcategory',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
                'assignedBranch'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Assignment removed successfully',
                'data' => $replenishment,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove assignment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
