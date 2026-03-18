<?php

namespace App\Http\Controllers;

use App\Http\Requests\Replenishment\AssignToBranchRequest;
use App\Http\Requests\Replenishment\AssignToEmployeeRequest;
use App\Http\Requests\Replenishment\StoreReplenishmentRequest;
use App\Http\Requests\Replenishment\UpdateReplenishmentRequest;
use App\Models\Replenishment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReplenishmentController extends Controller
{
    /**
     * Standard eager loading for replenishment queries.
     */
    private function eagerLoadRelations(): array
    {
        return [
            'category',
            'subcategory',
            'vendor',
            'status',
            'assignedWorkstation:id,name,branch_id,employee_id',
            'assignedWorkstation.branch:id,branch_name',
            'assignedWorkstation.employee:id,fullname,branch_id,position_id',
            'assignedWorkstation.employee.branch:id,branch_name',
            'assignedWorkstation.employee.position:id,title',
            'assignedBranch',
        ];
    }

    /**
     * Get all replenishments with filters
     */
    public function index(Request $request)
    {
        try {
            $query = Replenishment::with($this->eagerLoadRelations());

            // Filter by category
            if ($request->has('category_id') && $request->category_id) {
                $query->where('asset_category_id', $request->category_id);
            }

            // Filter by status
            if ($request->has('status_id') && $request->status_id) {
                $query->where('status_id', $request->status_id);
            }

            // Filter by branch (via workstation or direct branch assignment)
            if ($request->has('branch_id') && $request->branch_id) {
                $branchId = $request->branch_id;
                $query->where(function ($q) use ($branchId) {
                    $q->where('assigned_to_branch_id', $branchId)
                        ->orWhereHas('assignedWorkstation', function ($ws) use ($branchId) {
                            $ws->where('branch_id', $branchId);
                        });
                });
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
                        $q->whereNotNull('assigned_to_workstation_id')
                            ->orWhereNotNull('assigned_to_branch_id');
                    });
                } elseif ($request->assignment_status === 'unassigned') {
                    $query->whereNull('assigned_to_workstation_id')
                        ->whereNull('assigned_to_branch_id');
                }
            }

            if ($request->boolean('all', false)) {
                $replenishments = $query->orderBy('created_at', 'desc')->get();

                return response()->json([
                    'success' => true,
                    'data' => $replenishments,
                ], 200);
            }

            $perPage = min((int) $request->input('per_page', 50), 100);
            $replenishments = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $replenishments,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch replenishments');
        }
    }

    /**
     * Create a new replenishment
     */
    public function store(StoreReplenishmentRequest $request)
    {
        try {
            $replenishment = Replenishment::create([
                'asset_name' => $request->asset_name,
                'serial_number' => $request->serial_number,
                'asset_category_id' => $request->asset_category_id,
                'subcategory_id' => $request->subcategory_id,
                'brand' => $request->brand,
                'model' => $request->model,
                'acq_cost' => $request->acq_cost,
                'purchase_date' => $request->purchase_date,
                'warranty_expiration_date' => $request->warranty_expiration_date,
                'estimate_life' => $request->estimate_life,
                'vendor_id' => $request->vendor_id,
                'status_id' => $request->status_id,
                'assigned_to_workstation_id' => $request->assigned_to_workstation_id,
                'assigned_to_branch_id' => $request->assigned_to_branch_id,
                'remarks' => $request->remarks,
                'specifications' => $request->specifications,
            ]);

            // Calculate and set initial book value
            $bookValueCalc = $replenishment->calculateBookValue();
            $replenishment->book_value = $bookValueCalc['book_value'];
            $replenishment->save();

            $replenishment->load($this->eagerLoadRelations());

            return response()->json([
                'success' => true,
                'message' => 'Replenishment created successfully',
                'data' => $replenishment,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create replenishment');
        }
    }

    /**
     * Get a specific replenishment
     */
    public function show($id)
    {
        try {
            $replenishment = Replenishment::with($this->eagerLoadRelations())->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $replenishment,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Replenishment not found', 404);
        }
    }

    /**
     * Update a replenishment
     */
    public function update(UpdateReplenishmentRequest $request, $id)
    {
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
                'purchase_date' => $request->purchase_date,
                'warranty_expiration_date' => $request->warranty_expiration_date,
                'estimate_life' => $request->estimate_life,
                'vendor_id' => $request->vendor_id,
                'status_id' => $request->status_id,
                'assigned_to_workstation_id' => $request->assigned_to_workstation_id,
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

            $replenishment->load($this->eagerLoadRelations());

            return response()->json([
                'success' => true,
                'message' => 'Replenishment updated successfully',
                'data' => $replenishment,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update replenishment');
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
            return $this->handleException($e, 'Failed to delete replenishment');
        }
    }

    /**
     * Assign replenishment to a workstation.
     * This moves the replenishment to the assets table and assigns it to the workstation.
     */
    public function assignToEmployee(AssignToEmployeeRequest $request, $id)
    {
        try {
            $replenishment = Replenishment::findOrFail($id);

            // Get workstation to retrieve branch info
            $workstation = \App\Models\Workstation::with('employee')->findOrFail($request->workstation_id);

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
                'workstation_id' => $workstation->id,
                'workstation_branch_id' => $workstation->branch_id,
                'workstation_position_id' => $workstation->position_id,
            ]);

            // Load relationships needed for QR code data
            $asset->load([
                'category:id,name',
                'status:id,name',
                'workstation:id,name,branch_id,employee_id',
                'workstation.employee:id,fullname',
                'workstation.branch:id,branch_name',
            ]);

            // Generate QR code for the asset (non-blocking)
            try {
                $qrResult = $asset->generateAndSaveQRCode('full', true);
                if (! $qrResult['success']) {
                    Log::warning("QR code generation failed for deployed asset {$asset->id}", $qrResult);
                }
            } catch (\Exception $e) {
                Log::warning('Failed to generate QR code for deployed asset '.$asset->id.': '.$e->getMessage());
            }

            // Generate barcode for the asset (non-blocking, separate try/catch)
            try {
                $asset->generateAndSaveBarcode();
            } catch (\Exception $e) {
                Log::warning('Failed to generate barcode for deployed asset '.$asset->id.': '.$e->getMessage());
            }

            // Load relationships for the asset
            $asset->load([
                'category',
                'subcategory',
                'vendor',
                'status',
                'workstation.employee',
                'workstation.branch',
            ]);

            // Delete the replenishment since it's now an asset
            $replenishment->delete();

            $assignedTo = $workstation->employee
                ? $workstation->employee->fullname
                : $workstation->name;

            return response()->json([
                'success' => true,
                'message' => 'Reserve asset has been deployed and assigned to '.$assignedTo,
                'data' => $asset,
                'deployed' => true,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to assign replenishment to workstation');
        }
    }

    /**
     * Assign replenishment to a branch
     */
    public function assignToBranch(AssignToBranchRequest $request, $id)
    {
        try {
            $replenishment = Replenishment::findOrFail($id);

            $replenishment->update([
                'assigned_to_branch_id' => $request->branch_id,
                'assigned_to_workstation_id' => null, // Clear workstation when assigning to branch
            ]);

            $replenishment->load($this->eagerLoadRelations());

            return response()->json([
                'success' => true,
                'message' => 'Replenishment assigned to branch successfully',
                'data' => $replenishment,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to assign replenishment to branch');
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
                'assigned_to_workstation_id' => null,
                'assigned_to_branch_id' => null,
            ]);

            $replenishment->load($this->eagerLoadRelations());

            return response()->json([
                'success' => true,
                'message' => 'Assignment removed successfully',
                'data' => $replenishment,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to remove assignment');
        }
    }
}
