<?php

namespace App\Http\Controllers;

use App\Models\Repair;
use App\Models\RepairRemark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RepairController extends Controller
{
    /**
     * Display a listing of repairs with filters.
     */
    public function index(Request $request)
    {
        try {
            $query = Repair::with([
                'asset.category',
                'asset.assignedEmployee',
                'vendor'
            ]);

            // Filter by asset
            if ($request->has('asset_id') && $request->asset_id) {
                $query->where('asset_id', $request->asset_id);
            }

            // Filter by vendor
            if ($request->has('vendor_id') && $request->vendor_id) {
                $query->where('vendor_id', $request->vendor_id);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Date range filters
            if ($request->has('repair_date_from') && $request->repair_date_from) {
                $query->where('repair_date', '>=', $request->repair_date_from);
            }

            if ($request->has('repair_date_to') && $request->repair_date_to) {
                $query->where('repair_date', '<=', $request->repair_date_to);
            }

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhereHas('asset', function ($assetQuery) use ($search) {
                          $assetQuery->where('asset_name', 'like', "%{$search}%");
                      });
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $repairs = $query->get();

            return response()->json([
                'success' => true,
                'data' => $repairs,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch repairs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created repair.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'vendor_id' => 'required|exists:vendors,id',
            'description' => 'required|string',
            'repair_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:repair_date',
            'actual_return_date' => 'nullable|date|after_or_equal:repair_date',
            'repair_cost' => 'nullable|numeric|min:0',
            'status' => 'required|in:Pending,In Repair,Completed,Returned',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validate that the asset has "Under Repair" status
        $asset = \App\Models\Asset::with('status')->find($request->asset_id);
        if (!$asset || !$asset->status || $asset->status->name !== 'Under Repair') {
            return response()->json([
                'success' => false,
                'message' => 'Only assets with "Under Repair" status can be added to repair records',
            ], 422);
        }

        try {
            $repair = Repair::create($request->all());
            $repair->load(['asset.category', 'vendor']);

            return response()->json([
                'success' => true,
                'message' => 'Repair record created successfully',
                'data' => $repair,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create repair record',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified repair.
     */
    public function show($id)
    {
        try {
            $repair = Repair::with([
                'asset.category',
                'asset.assignedEmployee.branch',
                'vendor'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $repair,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Repair record not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified repair.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'asset_id' => 'required|exists:assets,id',
            'vendor_id' => 'required|exists:vendors,id',
            'description' => 'required|string',
            'repair_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:repair_date',
            'actual_return_date' => 'nullable|date|after_or_equal:repair_date',
            'repair_cost' => 'nullable|numeric|min:0',
            'status' => 'required|in:Pending,In Repair,Completed,Returned',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $repair = Repair::findOrFail($id);
            $repair->update($request->all());
            $repair->load(['asset.category', 'vendor']);

            return response()->json([
                'success' => true,
                'message' => 'Repair record updated successfully',
                'data' => $repair,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update repair record',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified repair.
     */
    public function destroy($id)
    {
        try {
            $repair = Repair::findOrFail($id);
            $repair->delete();

            return response()->json([
                'success' => true,
                'message' => 'Repair record deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete repair record',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update status of repair (for workflow transitions).
     */
    public function updateStatus(Request $request, $id)
    {
        $rules = [
            'status' => 'required|in:Pending,In Repair,Completed,Returned',
            'actual_return_date' => 'nullable|date',
            'remark' => 'nullable|string',
            'remark_type' => 'nullable|string|in:general,status_change,pending_reason',
        ];

        // Additional validation based on status
        if ($request->status === 'Completed') {
            $rules['repair_cost'] = 'required|numeric|min:0';
            $rules['invoice_no'] = 'nullable|string|max:255';
            $rules['completion_description'] = 'nullable|string';
        }

        if ($request->status === 'In Repair') {
            $rules['delivered_by_type'] = 'required|in:employee,branch';
            $rules['job_order'] = 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120'; // 5MB max

            // Add conditional validation based on delivered_by_type
            if ($request->delivered_by_type === 'employee') {
                $rules['delivered_by_employee_name'] = 'required|string|max:255';
            } elseif ($request->delivered_by_type === 'branch') {
                $rules['delivered_by_branch_id'] = 'required|exists:branch,id';
            }
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $repair = Repair::findOrFail($id);

            $repair->status = $request->status;

            // Handle "Completed" status
            if ($request->status === 'Completed') {
                $repair->repair_cost = $request->repair_cost;
                $repair->invoice_no = $request->invoice_no;
                $repair->completion_description = $request->completion_description;
            }

            // Handle "In Repair" status
            if ($request->status === 'In Repair') {
                $repair->delivered_by_type = $request->delivered_by_type;

                if ($request->delivered_by_type === 'employee') {
                    $repair->delivered_by_employee_name = $request->delivered_by_employee_name;
                    $repair->delivered_by_employee_id = null;
                    $repair->delivered_by_branch_id = null;
                } else {
                    $repair->delivered_by_branch_id = $request->delivered_by_branch_id;
                    $repair->delivered_by_employee_name = null;
                    $repair->delivered_by_employee_id = null;
                }

                // Handle job order file upload
                if ($request->hasFile('job_order')) {
                    $file = $request->file('job_order');
                    $filename = 'job_order_' . $repair->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('job_orders', $filename, 'public');
                    $repair->job_order_path = $path;
                }
            }

            // Auto-set actual return date when status becomes "Returned"
            if ($request->status === 'Returned' && !$repair->actual_return_date) {
                $repair->actual_return_date = $request->actual_return_date ?? now();
            }

            $repair->save();

            // Save remark if provided
            if ($request->has('remark') && $request->remark) {
                RepairRemark::create([
                    'repair_id' => $repair->id,
                    'remark' => $request->remark,
                    'remark_type' => $request->remark_type ?? 'general',
                ]);
            }

            $repair->load(['asset.category', 'vendor', 'deliveredByEmployee.branch', 'deliveredByEmployee.position', 'deliveredByBranch']);

            return response()->json([
                'success' => true,
                'message' => 'Repair status updated successfully',
                'data' => $repair,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update repair status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get repair statistics/summary.
     */
    public function statistics()
    {
        try {
            $stats = [
                'total' => Repair::count(),
                'pending' => Repair::where('status', 'Pending')->count(),
                'in_repair' => Repair::where('status', 'In Repair')->count(),
                'completed' => Repair::where('status', 'Completed')->count(),
                'returned' => Repair::where('status', 'Returned')->count(),
                'total_cost' => Repair::sum('repair_cost'),
                'overdue_count' => Repair::whereIn('status', ['Pending', 'In Repair', 'Completed'])
                    ->where('expected_return_date', '<', now())
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch repair statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download job order file for a repair.
     */
    public function downloadJobOrder($id)
    {
        try {
            $repair = Repair::findOrFail($id);

            if (!$repair->job_order_path) {
                return response()->json([
                    'success' => false,
                    'message' => 'No job order file found for this repair',
                ], 404);
            }

            $filePath = storage_path('app/public/' . $repair->job_order_path);

            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job order file not found',
                ], 404);
            }

            // Get the original filename from the path
            $originalFilename = basename($filePath);

            // Detect MIME type based on file extension
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            $mimeTypes = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'pdf' => 'application/pdf',
            ];

            $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

            // Return the file with the original filename and correct MIME type
            return response()->download($filePath, $originalFilename, [
                'Content-Type' => $mimeType,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download job order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get remarks for a repair.
     */
    public function getRemarks($id)
    {
        try {
            $repair = Repair::findOrFail($id);
            $remarks = $repair->remarks()->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $remarks,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch remarks',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Add a remark to a repair.
     */
    public function addRemark(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'remark' => 'required|string',
            'remark_type' => 'nullable|string|in:general,status_change,pending_reason',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $repair = Repair::findOrFail($id);

            $remark = RepairRemark::create([
                'repair_id' => $id,
                'remark' => $request->remark,
                'remark_type' => $request->remark_type ?? 'general',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Remarks added successfully',
                'data' => $remark,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add remark',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
