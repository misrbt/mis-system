<?php

namespace App\Http\Controllers;

use App\Models\AssetMovement;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditLogController extends Controller
{
    /**
     * Get audit logs with comprehensive filtering
     */
    public function index(Request $request)
    {
        try {
            $query = AssetMovement::with([
                'asset.category',
                'asset.vendor',
                'asset.status',
                'asset.assignedEmployee.position',
                'asset.assignedEmployee.branch',
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
            ]);

            // Filter by asset ID(s)
            if ($request->has('asset_id') && $request->asset_id) {
                $assetIds = is_array($request->asset_id) ? $request->asset_id : [$request->asset_id];
                $query->whereIn('asset_id', $assetIds);
            }

            // Filter by movement type(s)
            if ($request->has('movement_type') && $request->movement_type) {
                $types = is_array($request->movement_type) ? $request->movement_type : [$request->movement_type];
                $query->whereIn('movement_type', $types);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('movement_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('movement_date', '<=', $request->date_to);
            }

            // Filter by user who performed the action
            if ($request->has('performed_by') && $request->performed_by) {
                $query->where('performed_by_user_id', $request->performed_by);
            }

            // Search by asset name or serial number
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->whereHas('asset', function ($q) use ($search) {
                    $q->where('asset_name', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%");
                });
            }

            // Filter by field changed (from metadata)
            if ($request->has('field_changed') && $request->field_changed) {
                $query->where('metadata->changed_fields', 'like', "%{$request->field_changed}%");
            }

            // Sorting - newest first by default
            $sortBy = $request->get('sort_by', 'movement_date');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Add secondary sort by created_at to ensure newest entries appear first
            if ($sortBy !== 'created_at') {
                $query->orderBy('created_at', 'desc');
            }

            // Pagination
            $perPage = $request->get('per_page', 50);
            $movements = $query->paginate($perPage);

            // Enhance each movement with description, icon, and color
            $movements->getCollection()->transform(function ($movement) {
                return array_merge($movement->toArray(), [
                    'description' => $movement->getMovementDescription(),
                    'icon' => $movement->getIconClass(),
                    'color' => $movement->getColorClass(),
                ]);
            });

            return response()->json([
                'success' => true,
                'data' => $movements->items(),
                'meta' => [
                    'total' => $movements->total(),
                    'per_page' => $movements->perPage(),
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch audit logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get complete audit log for a specific asset
     */
    public function getAssetAuditLog($assetId)
    {
        try {
            $asset = Asset::findOrFail($assetId);

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
                'data' => [
                    'asset' => $asset->load(['category', 'vendor', 'status', 'assignedEmployee']),
                    'movements' => $movements,
                    'total_changes' => $movements->count(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch asset audit log',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get audit logs for actions performed by a specific user
     */
    public function getUserAuditLog($userId)
    {
        try {
            $movements = AssetMovement::with([
                'asset.category',
                'fromEmployee',
                'toEmployee',
                'fromStatus',
                'toStatus',
                'repair.vendor',
            ])
            ->where('performed_by_user_id', $userId)
            ->orderBy('movement_date', 'desc')
            ->paginate(50);

            $movements->getCollection()->transform(function ($movement) {
                return array_merge($movement->toArray(), [
                    'description' => $movement->getMovementDescription(),
                    'icon' => $movement->getIconClass(),
                    'color' => $movement->getColorClass(),
                ]);
            });

            return response()->json([
                'success' => true,
                'data' => $movements->items(),
                'meta' => [
                    'total' => $movements->total(),
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user audit log',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get audit log statistics
     */
    public function statistics(Request $request)
    {
        try {
            $query = AssetMovement::query();

            // Apply same filters as index for consistent stats
            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('movement_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('movement_date', '<=', $request->date_to);
            }

            $stats = [
                'total_movements' => $query->count(),
                'by_type' => $query->select('movement_type', DB::raw('count(*) as count'))
                    ->groupBy('movement_type')
                    ->pluck('count', 'movement_type'),
                'recent_activity' => $query->orderBy('movement_date', 'desc')
                    ->limit(10)
                    ->with(['asset', 'performedBy'])
                    ->get()
                    ->map(function ($movement) {
                        return [
                            'id' => $movement->id,
                            'asset_name' => $movement->asset?->asset_name,
                            'movement_type' => $movement->movement_type,
                            'performed_by' => $movement->performedBy?->name,
                            'movement_date' => $movement->movement_date,
                        ];
                    }),
                'top_users' => AssetMovement::select('performed_by_user_id', DB::raw('count(*) as action_count'))
                    ->whereNotNull('performed_by_user_id')
                    ->groupBy('performed_by_user_id')
                    ->orderByDesc('action_count')
                    ->limit(5)
                    ->with('performedBy:id,name')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'user_id' => $item->performed_by_user_id,
                            'user_name' => $item->performedBy?->name,
                            'action_count' => $item->action_count,
                        ];
                    }),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export audit logs (Excel/PDF)
     */
    public function export(Request $request)
    {
        try {
            $format = $request->input('format', 'xlsx');

            // Get filtered data (reuse index query logic)
            $query = AssetMovement::with([
                'asset.category',
                'asset.vendor',
                'fromEmployee',
                'toEmployee',
                'fromStatus',
                'toStatus',
                'repair.vendor',
                'performedBy',
            ]);

            // Apply all filters
            if ($request->has('asset_id') && $request->asset_id) {
                $assetIds = is_array($request->asset_id) ? $request->asset_id : [$request->asset_id];
                $query->whereIn('asset_id', $assetIds);
            }

            if ($request->has('movement_type') && $request->movement_type) {
                $types = is_array($request->movement_type) ? $request->movement_type : [$request->movement_type];
                $query->whereIn('movement_type', $types);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('movement_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('movement_date', '<=', $request->date_to);
            }

            if ($request->has('performed_by') && $request->performed_by) {
                $query->where('performed_by_user_id', $request->performed_by);
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->whereHas('asset', function ($q) use ($search) {
                    $q->where('asset_name', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%");
                });
            }

            // Sort by movement_date and created_at to ensure newest first
            $query->orderBy('movement_date', 'desc')
                  ->orderBy('created_at', 'desc');

            $movements = $query->get();

            // For now, return JSON data (you can implement Excel/PDF export later with libraries)
            return response()->json([
                'success' => true,
                'data' => $movements->map(function ($movement) {
                    return [
                        'date' => $movement->movement_date->format('Y-m-d H:i:s'),
                        'asset' => $movement->asset?->asset_name,
                        'serial_number' => $movement->asset?->serial_number,
                        'movement_type' => $movement->movement_type,
                        'from' => $this->getFromValue($movement),
                        'to' => $this->getToValue($movement),
                        'performed_by' => $movement->performedBy?->name,
                        'reason' => $movement->reason,
                        'remarks' => $movement->remarks,
                        'metadata' => $movement->metadata,
                    ];
                }),
                'format' => $format,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export audit logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper to get "from" value based on movement type
     */
    private function getFromValue($movement)
    {
        return match($movement->movement_type) {
            'assigned', 'transferred', 'returned' => $movement->fromEmployee?->fullname,
            'status_changed' => $movement->fromStatus?->name,
            default => null,
        };
    }

    /**
     * Helper to get "to" value based on movement type
     */
    private function getToValue($movement)
    {
        return match($movement->movement_type) {
            'assigned', 'transferred' => $movement->toEmployee?->fullname,
            'status_changed' => $movement->toStatus?->name,
            'returned' => 'Unassigned',
            default => null,
        };
    }
}
