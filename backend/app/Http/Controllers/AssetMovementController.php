<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssetMovement\BulkTransferAssetsRequest;
use App\Http\Requests\AssetMovement\ReturnAssetRequest;
use App\Http\Requests\AssetMovement\TransferAssetRequest;
use App\Http\Requests\AssetMovement\UpdateAssetStatusRequest;
use App\Models\Asset;
use App\Models\AssetMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetMovementController extends Controller
{
    /**
     * Get movement history for a specific asset
     *
     * @param  int  $assetId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAssetHistory($assetId)
    {
        try {
            $movements = AssetMovement::with([
                'fromEmployee.branch',
                'fromEmployee.position',
                'toEmployee.branch',
                'toEmployee.position',
                'fromStatus',
                'toStatus',
                'fromBranch',
                'toBranch',
                'repair.vendor',
                'performedBy',
            ])
                ->where('asset_id', $assetId)
                ->orderBy('movement_date', 'desc')
                ->get()
                ->map(function ($movement) {
                    return array_merge($movement->toArray(), [
                        'description' => $movement->getMovementDescription(),
                        'icon' => $movement->getIconClass(),
                        'color' => $movement->getColorClass(),
                    ]);
                });

            return response()->json([
                'success' => true,
                'data' => $movements,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch movement history');
        }
    }

    /**
     * Get assignment history for a specific asset
     *
     * @param  int  $assetId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAssignmentHistory($assetId)
    {
        try {
            $assignments = AssetMovement::with([
                'fromEmployee.branch',
                'fromEmployee.position',
                'toEmployee.branch',
                'toEmployee.position',
                'performedBy',
            ])
                ->where('asset_id', $assetId)
                ->whereIn('movement_type', ['assigned', 'transferred', 'returned'])
                ->orderBy('movement_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $assignments,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch assignment history');
        }
    }

    /**
     * Get statistics for an asset's movements
     *
     * @param  int  $assetId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAssetStatistics($assetId)
    {
        try {
            $asset = Asset::findOrFail($assetId);

            $stats = [
                'total_movements' => $asset->movements()->count(),
                'assignment_count' => $asset->movements()->whereIn('movement_type', ['assigned', 'transferred'])->count(),
                'transfer_count' => $asset->movements()->where('movement_type', 'transferred')->count(),
                'return_count' => $asset->movements()->where('movement_type', 'returned')->count(),
                'repair_count' => $asset->movements()->where('movement_type', 'repair_initiated')->count(),
                'status_change_count' => $asset->movements()->where('movement_type', 'status_changed')->count(),
                'current_assignment_days' => $asset->getCurrentAssignmentDuration(),
                'first_movement_date' => $asset->movements()->min('movement_date'),
                'last_movement_date' => $asset->movements()->max('movement_date'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch statistics');
        }
    }

    /**
     * Manual transfer with reason (overrides observer)
     *
     * @param  Request  $request
     * @param  int  $assetId
     * @return \Illuminate\Http\JsonResponse
     */
    public function transferAsset(TransferAssetRequest $request, $assetId)
    {
        try {
            DB::beginTransaction();

            $asset = Asset::findOrFail($assetId);
            $fromEmployeeId = $asset->assigned_to_employee_id;
            $fromBranchId = $asset->assignedEmployee?->branch_id;

            // Update asset (observer will be triggered)
            $asset->assigned_to_employee_id = $request->to_employee_id;
            $asset->save();

            // Get the movement created by observer and update it with reason
            $movement = AssetMovement::where('asset_id', $assetId)
                ->latest('created_at')
                ->first();

            if ($movement) {
                $movement->update([
                    'reason' => $request->reason,
                    'remarks' => $request->remarks,
                ]);
            }

            DB::commit();

            $asset->load([
                'category',
                'vendor',
                'status',
                'assignedEmployee.branch',
                'assignedEmployee.position',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Asset transferred successfully',
                'data' => $asset,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return $this->handleException($e, 'Failed to transfer asset');
        }
    }

    /**
     * Return asset from employee with reason
     *
     * @param  int  $assetId
     * @return \Illuminate\Http\JsonResponse
     */
    public function returnAsset(ReturnAssetRequest $request, $assetId)
    {
        try {
            DB::beginTransaction();

            $asset = Asset::findOrFail($assetId);

            if (! $asset->assigned_to_employee_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Asset is not currently assigned',
                ], 400);
            }

            // Unassign asset
            $asset->assigned_to_employee_id = null;
            $asset->save();

            // Update the movement created by observer
            $movement = AssetMovement::where('asset_id', $assetId)
                ->latest('created_at')
                ->first();

            if ($movement) {
                $movement->update([
                    'reason' => $request->reason,
                    'remarks' => $request->remarks,
                ]);
            }

            DB::commit();

            $asset->load(['category', 'vendor', 'status']);

            return response()->json([
                'success' => true,
                'message' => 'Asset returned successfully',
                'data' => $asset,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return $this->handleException($e, 'Failed to return asset');
        }
    }

    /**
     * Update status with reason
     *
     * @param  int  $assetId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(UpdateAssetStatusRequest $request, $assetId)
    {
        try {
            DB::beginTransaction();

            $asset = Asset::findOrFail($assetId);
            $asset->status_id = $request->status_id;
            $asset->save();

            // Update the movement created by observer
            $movement = AssetMovement::where('asset_id', $assetId)
                ->latest('created_at')
                ->first();

            if ($movement) {
                $movement->update([
                    'reason' => $request->reason,
                    'remarks' => $request->remarks,
                ]);
            }

            DB::commit();

            $asset->load(['category', 'vendor', 'status', 'assignedEmployee.branch']);

            return response()->json([
                'success' => true,
                'message' => 'Asset status updated successfully',
                'data' => $asset,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return $this->handleException($e, 'Failed to update status');
        }
    }

    /**
     * Bulk transfer multiple assets to one employee
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkTransfer(BulkTransferAssetsRequest $request)
    {
        try {
            DB::beginTransaction();

            $assetIds = $request->asset_ids;
            $toEmployeeId = $request->to_employee_id;
            $reason = $request->reason;
            $remarks = $request->remarks;

            $transferredAssets = [];
            $failedAssets = [];

            foreach ($assetIds as $assetId) {
                try {
                    $asset = Asset::findOrFail($assetId);

                    // Update asset assignment
                    $asset->assigned_to_employee_id = $toEmployeeId;
                    $asset->save();

                    // Get the movement created by observer and update it with reason
                    $movement = AssetMovement::where('asset_id', $assetId)
                        ->latest('created_at')
                        ->first();

                    if ($movement) {
                        $movement->update([
                            'reason' => $reason,
                            'remarks' => $remarks,
                        ]);
                    }

                    $asset->load([
                        'category',
                        'vendor',
                        'status',
                        'assignedEmployee.branch',
                        'assignedEmployee.position',
                    ]);

                    $transferredAssets[] = $asset;
                } catch (\Exception $e) {
                    $failedAssets[] = [
                        'asset_id' => $assetId,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            DB::commit();

            $responseMessage = count($transferredAssets).' asset(s) transferred successfully';
            if (count($failedAssets) > 0) {
                $responseMessage .= ', '.count($failedAssets).' failed';
            }

            return response()->json([
                'success' => true,
                'message' => $responseMessage,
                'data' => [
                    'transferred' => $transferredAssets,
                    'failed' => $failedAssets,
                    'total_transferred' => count($transferredAssets),
                    'total_failed' => count($failedAssets),
                ],
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return $this->handleException($e, 'Failed to transfer assets');
        }
    }
}
