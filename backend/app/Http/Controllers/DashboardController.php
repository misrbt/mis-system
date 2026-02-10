<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Repair;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    private DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get comprehensive dashboard statistics (OPTIMIZED)
     */
    public function getStatistics()
    {
        try {
            $statistics = $this->dashboardService->getStatistics();

            return response()->json([
                'success' => true,
                'data' => $statistics,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Dashboard statistics error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get unified initial dashboard data (OPTIMIZED - Single endpoint for faster loading)
     * Combines statistics, expenses, and activity data to reduce HTTP requests from 8 to 2
     * This endpoint returns all critical data needed for initial dashboard render
     */
    public function getInitialData(Request $request)
    {
        try {
            $year = $request->get('year', now()->year);
            $month = $request->get('month', now()->month);
            $cacheKey = "dashboard:initial_data:{$year}:{$month}";

            $data = Cache::remember($cacheKey, 300, function () use ($year, $month) {
                // Fetch all data in parallel (already cached individually)
                $statistics = $this->dashboardService->getStatistics();
                $monthlyExpenses = $this->dashboardService->getMonthlyExpenses();
                $yearlyExpenses = $this->dashboardService->getYearlyExpenses();

                // Get current month expenses
                $currentMonthData = collect($monthlyExpenses)->firstWhere('month_key', sprintf('%04d-%02d', $year, $month));
                $currentMonthExpenses = $currentMonthData ? [
                    'total_expenses' => $currentMonthData['total_cost'],
                    'acquisition_cost' => $currentMonthData['acquisition_cost'],
                    'repair_cost' => $currentMonthData['repair_cost'],
                    'month' => $currentMonthData['month'],
                ] : [
                    'total_expenses' => 0,
                    'acquisition_cost' => 0,
                    'repair_cost' => 0,
                    'month' => date('M Y', mktime(0, 0, 0, $month, 1, $year)),
                ];

                // Get recent activity (cached separately)
                $recentActivity = Cache::remember('dashboard:recent_activity:10', 300, function () {
                    return DB::table('asset_movements')
                        ->join('assets', 'asset_movements.asset_id', '=', 'assets.id')
                        ->leftJoin('employee as from_emp', 'asset_movements.from_employee_id', '=', 'from_emp.id')
                        ->leftJoin('employee as to_emp', 'asset_movements.to_employee_id', '=', 'to_emp.id')
                        ->leftJoin('status as from_status', 'asset_movements.from_status_id', '=', 'from_status.id')
                        ->leftJoin('status as to_status', 'asset_movements.to_status_id', '=', 'to_status.id')
                        ->select(
                            'asset_movements.id',
                            'asset_movements.movement_type',
                            'asset_movements.movement_date',
                            'asset_movements.reason',
                            'assets.asset_name',
                            'assets.serial_number',
                            DB::raw("COALESCE(from_emp.fullname, '') as from_employee"),
                            DB::raw("COALESCE(to_emp.fullname, '') as to_employee"),
                            'from_status.name as from_status',
                            'to_status.name as to_status'
                        )
                        ->orderBy('asset_movements.movement_date', 'desc')
                        ->limit(10)
                        ->get()
                        ->map(function ($activity) {
                            return [
                                'id' => $activity->id,
                                'type' => $activity->movement_type,
                                'asset' => [
                                    'name' => $activity->asset_name,
                                    'serial' => $activity->serial_number,
                                ],
                                'from_employee' => trim($activity->from_employee) ?: null,
                                'to_employee' => trim($activity->to_employee) ?: null,
                                'from_status' => $activity->from_status,
                                'to_status' => $activity->to_status,
                                'reason' => $activity->reason,
                                'date' => $activity->movement_date,
                            ];
                        });
                });

                // Get assets needing attention (cached separately)
                $assetsNeedingAttention = Cache::remember('dashboard:assets_needing_attention:50', 300, function () {
                    $now = now();
                    $oneMonthFromNow = $now->copy()->addMonth();
                    $threeMonthsFromNow = $now->copy()->addMonths(3);
                    $priorityOrderCase = 'CASE
                        WHEN assets.waranty_expiration_date < ? THEN 1
                        WHEN status.name = ? THEN 2
                        ELSE 3
                    END';
                    $priorityCase = "CASE
                        WHEN assets.waranty_expiration_date < ? THEN 'High'
                        WHEN status.name = ? THEN 'High'
                        WHEN assets.waranty_expiration_date <= ? THEN 'Medium'
                        ELSE 'Low'
                    END";

                    return DB::table('assets')
                        ->leftJoin('asset_category', 'assets.asset_category_id', '=', 'asset_category.id')
                        ->leftJoin('status', 'assets.status_id', '=', 'status.id')
                        ->leftJoin('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
                        ->leftJoin('branch', 'employee.branch_id', '=', 'branch.id')
                        ->select(
                            'assets.id',
                            'assets.asset_name',
                            'assets.serial_number',
                            'assets.waranty_expiration_date as warranty_expiration',
                            'assets.updated_at',
                            'assets.created_at',
                            'asset_category.name as category_name',
                            'status.name as status_name',
                            'status.color as status_color',
                            'branch.branch_name',
                            'employee.fullname as employee_name'
                        )
                        ->selectRaw($priorityOrderCase.' as priority_order', [$now, 'Under Repair'])
                        ->selectRaw($priorityCase.' as priority', [$now, 'Under Repair', $oneMonthFromNow])
                        ->where(function ($query) use ($threeMonthsFromNow) {
                            $query->where(function ($q) use ($threeMonthsFromNow) {
                                $q->whereNotNull('assets.waranty_expiration_date')
                                    ->where('assets.waranty_expiration_date', '<=', $threeMonthsFromNow);
                            })
                                ->orWhere('status.name', 'Under Repair');
                        })
                        ->orderBy('priority_order')
                        ->orderBy('assets.waranty_expiration_date')
                        ->limit(50)
                        ->get()
                        ->map(function ($asset) use ($now) {
                            $lastUpdate = $asset->updated_at ?: $asset->created_at;
                            $nextMaintenance = date('Y-m-d', strtotime($lastUpdate.' +30 days'));

                            $reason = 'Scheduled maintenance';
                            $warrantyExpiration = $asset->warranty_expiration
                                ? \Carbon\Carbon::parse($asset->warranty_expiration)
                                : null;
                            if ($warrantyExpiration && $warrantyExpiration->lt($now)) {
                                $reason = 'Warranty expired';
                            } elseif ($asset->status_name === 'Under Repair') {
                                $reason = 'Currently under repair';
                            } elseif ($warrantyExpiration) {
                                $daysUntilExpiry = $now->diffInDays($warrantyExpiration, false);
                                if ($daysUntilExpiry <= 30) {
                                    $reason = "Warranty expiring in {$daysUntilExpiry} days";
                                } else {
                                    $reason = 'Warranty expiring in '.ceil($daysUntilExpiry / 30).' months';
                                }
                            }

                            return [
                                'id' => $asset->id,
                                'asset_name' => $asset->asset_name,
                                'serial_number' => $asset->serial_number,
                                'category' => $asset->category_name ?? 'Unknown',
                                'status' => $asset->status_name ?? 'Unknown',
                                'status_color' => $asset->status_color ?? '#64748b',
                                'branch' => $asset->branch_name ?? 'Unassigned',
                                'assigned_to' => trim($asset->employee_name) ?: 'Unassigned',
                                'warranty_expiration' => $asset->warranty_expiration,
                                'next_maintenance' => $nextMaintenance,
                                'priority' => $asset->priority,
                                'reason' => $reason,
                            ];
                        });
                });

                return [
                    'statistics' => $statistics,
                    'current_month_expenses' => $currentMonthExpenses,
                    'monthly_expenses' => $monthlyExpenses,
                    'yearly_expenses' => $yearlyExpenses,
                    'recent_activity' => $recentActivity,
                    'assets_needing_attention' => $assetsNeedingAttention,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'cached_until' => now()->addSeconds(300)->toIso8601String(),
                    'endpoints_combined' => 6,
                    'note' => 'Branch statistics available at /dashboard/branch-statistics for progressive loading',
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Dashboard initial data error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard initial data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get asset trend over time (OPTIMIZED)
     */
    public function getAssetTrend()
    {
        try {
            $driver = DB::getDriverName();
            $monthExpression = $driver === 'pgsql'
                ? "TO_CHAR(purchase_date, 'YYYY-MM')"
                : "DATE_FORMAT(purchase_date, '%Y-%m')";

            $trend = DB::table('assets')
                ->select(
                    DB::raw($monthExpression.' as month'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('purchase_date', '>=', now()->subMonths(12))
                ->whereNotNull('purchase_date')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $trend,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Asset trend error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch asset trend',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get recent activity (OPTIMIZED with joins and caching)
     */
    public function getRecentActivity(Request $request)
    {
        try {
            $limit = min($request->get('limit', 20), 100);
            $cacheKey = "dashboard:recent_activity:{$limit}";

            $activities = Cache::remember($cacheKey, 300, function () use ($limit) {
                return DB::table('asset_movements')
                    ->join('assets', 'asset_movements.asset_id', '=', 'assets.id')
                    ->leftJoin('employee as from_emp', 'asset_movements.from_employee_id', '=', 'from_emp.id')
                    ->leftJoin('employee as to_emp', 'asset_movements.to_employee_id', '=', 'to_emp.id')
                    ->leftJoin('status as from_status', 'asset_movements.from_status_id', '=', 'from_status.id')
                    ->leftJoin('status as to_status', 'asset_movements.to_status_id', '=', 'to_status.id')
                    ->select(
                        'asset_movements.id',
                        'asset_movements.movement_type',
                        'asset_movements.movement_date',
                        'asset_movements.reason',
                        'assets.asset_name',
                        'assets.serial_number',
                        DB::raw("COALESCE(from_emp.fullname, '') as from_employee"),
                        DB::raw("COALESCE(to_emp.fullname, '') as to_employee"),
                        'from_status.name as from_status',
                        'to_status.name as to_status'
                    )
                    ->orderBy('asset_movements.movement_date', 'desc')
                    ->limit($limit)
                    ->get()
                    ->map(function ($activity) {
                        return [
                            'id' => $activity->id,
                            'type' => $activity->movement_type,
                            'asset' => [
                                'name' => $activity->asset_name,
                                'serial' => $activity->serial_number,
                            ],
                            'from_employee' => trim($activity->from_employee) ?: null,
                            'to_employee' => trim($activity->to_employee) ?: null,
                            'from_status' => $activity->from_status,
                            'to_status' => $activity->to_status,
                            'reason' => $activity->reason,
                            'date' => $activity->movement_date,
                        ];
                    });
            });

            return response()->json([
                'success' => true,
                'data' => $activities,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Recent activity error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent activity',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get monthly expenses (OPTIMIZED)
     */
    public function getMonthlyExpenses()
    {
        try {
            $expenses = $this->dashboardService->getMonthlyExpenses();

            return response()->json([
                'success' => true,
                'data' => $expenses,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Monthly expenses error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly expenses',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get yearly expenses comparison (OPTIMIZED)
     */
    public function getYearlyExpenses()
    {
        try {
            $expenses = $this->dashboardService->getYearlyExpenses();

            return response()->json([
                'success' => true,
                'data' => $expenses,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Yearly expenses error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch yearly expenses',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get expense trends (OPTIMIZED)
     */
    public function getExpenseTrends(Request $request)
    {
        try {
            $year = $request->get('year', now()->year);
            $month = $request->get('month');

            if ($month) {
                // Daily expenses for a specific month
                $expenses = $this->getDailyExpenses($year, $month);
            } else {
                // Monthly expenses for a year
                $expenses = $this->getMonthlyExpensesByYear($year);
            }

            return response()->json([
                'success' => true,
                'data' => $expenses,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Expense trends error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch expense trends',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get daily expenses for a specific month
     */
    private function getDailyExpenses(int $year, int $month): array
    {
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        $assetExpenses = DB::table('assets')
            ->select(
                DB::raw('EXTRACT(DAY FROM purchase_date)::integer as day'),
                DB::raw('COALESCE(SUM(acq_cost), 0) as total')
            )
            ->whereYear('purchase_date', $year)
            ->whereMonth('purchase_date', $month)
            ->groupBy('day')
            ->pluck('total', 'day');

        $repairExpenses = DB::table('repairs')
            ->select(
                DB::raw('EXTRACT(DAY FROM repair_date)::integer as day'),
                DB::raw('COALESCE(SUM(repair_cost), 0) as total')
            )
            ->whereYear('repair_date', $year)
            ->whereMonth('repair_date', $month)
            ->groupBy('day')
            ->pluck('total', 'day');

        $dailyData = [];
        $totalAssetExpenses = 0;
        $totalRepairExpenses = 0;

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $assetCost = (float) ($assetExpenses[$day] ?? 0);
            $repairCost = (float) ($repairExpenses[$day] ?? 0);

            $totalAssetExpenses += $assetCost;
            $totalRepairExpenses += $repairCost;

            $dailyData[] = [
                'day' => $day,
                'date' => sprintf('%04d-%02d-%02d', $year, $month, $day),
                'asset_expenses' => $assetCost,
                'repair_expenses' => $repairCost,
                'total_expenses' => $assetCost + $repairCost,
            ];
        }

        return [
            'daily' => $dailyData,
            'total_expenses' => $totalAssetExpenses + $totalRepairExpenses,
            'total_asset_expenses' => $totalAssetExpenses,
            'total_repair_expenses' => $totalRepairExpenses,
            'year' => $year,
            'month' => $month,
            'month_name' => date('F', mktime(0, 0, 0, $month, 1)),
        ];
    }

    /**
     * Get monthly expenses for a year
     */
    private function getMonthlyExpensesByYear(int $year): array
    {
        $assetExpenses = DB::table('assets')
            ->select(
                DB::raw('EXTRACT(MONTH FROM purchase_date)::integer as month'),
                DB::raw('COALESCE(SUM(acq_cost), 0) as total')
            )
            ->whereYear('purchase_date', $year)
            ->groupBy('month')
            ->pluck('total', 'month');

        $repairExpenses = DB::table('repairs')
            ->select(
                DB::raw('EXTRACT(MONTH FROM repair_date)::integer as month'),
                DB::raw('COALESCE(SUM(repair_cost), 0) as total')
            )
            ->whereYear('repair_date', $year)
            ->groupBy('month')
            ->pluck('total', 'month');

        $result = [];
        for ($month = 1; $month <= 12; $month++) {
            $assetCost = (float) ($assetExpenses[$month] ?? 0);
            $repairCost = (float) ($repairExpenses[$month] ?? 0);

            $result[] = [
                'month' => date('F', mktime(0, 0, 0, $month, 1)),
                'month_num' => $month,
                'asset_expenses' => $assetCost,
                'repair_expenses' => $repairCost,
                'total_expenses' => $assetCost + $repairCost,
            ];
        }

        return $result;
    }

    /**
     * Get expense breakdown by category (OPTIMIZED)
     */
    public function getExpenseBreakdown(Request $request)
    {
        try {
            $year = $request->get('year', now()->year);
            $month = $request->get('month');

            $query = DB::table('assets')
                ->join('asset_category', 'assets.asset_category_id', '=', 'asset_category.id')
                ->select(
                    'asset_category.name as category_name',
                    DB::raw('COUNT(assets.id) as asset_count'),
                    DB::raw('COALESCE(SUM(assets.acq_cost), 0) as total_acquisition'),
                    DB::raw('COALESCE(SUM(assets.book_value), 0) as total_book_value')
                )
                ->whereYear('assets.purchase_date', $year);

            // Add month filter if provided
            if ($month) {
                $query->whereMonth('assets.purchase_date', $month);
            }

            $breakdown = $query
                ->groupBy('asset_category.id', 'asset_category.name')
                ->orderByDesc('total_acquisition')
                ->get()
                ->map(function ($item) {
                    return [
                        'category' => $item->category_name,
                        'asset_count' => (int) $item->asset_count,
                        'total_acquisition' => (float) $item->total_acquisition,
                        'total_book_value' => (float) $item->total_book_value,
                        'depreciation' => (float) ($item->total_acquisition - $item->total_book_value),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $breakdown,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Expense breakdown error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch expense breakdown',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get assets needing attention (OPTIMIZED with single query and caching)
     */
    public function getAssetsNeedingAttention(Request $request)
    {
        try {
            $limit = min($request->get('limit', 50), 100);
            $cacheKey = "dashboard:assets_needing_attention:{$limit}";

            $assets = Cache::remember($cacheKey, 300, function () use ($limit) {
                $now = now();
                $oneMonthFromNow = $now->copy()->addMonth();
                $threeMonthsFromNow = $now->copy()->addMonths(3);
                $priorityOrderCase = 'CASE
                    WHEN assets.waranty_expiration_date < ? THEN 1
                    WHEN status.name = ? THEN 2
                    ELSE 3
                END';
                $priorityCase = "CASE
                    WHEN assets.waranty_expiration_date < ? THEN 'High'
                    WHEN status.name = ? THEN 'High'
                    WHEN assets.waranty_expiration_date <= ? THEN 'Medium'
                    ELSE 'Low'
                END";

                // Single optimized query with all joins
                return DB::table('assets')
                    ->leftJoin('asset_category', 'assets.asset_category_id', '=', 'asset_category.id')
                    ->leftJoin('status', 'assets.status_id', '=', 'status.id')
                    ->leftJoin('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
                    ->leftJoin('branch', 'employee.branch_id', '=', 'branch.id')
                    ->select(
                        'assets.id',
                        'assets.asset_name',
                        'assets.serial_number',
                        'assets.waranty_expiration_date as warranty_expiration',
                        'assets.updated_at',
                        'assets.created_at',
                        'asset_category.name as category_name',
                        'status.name as status_name',
                        'status.color as status_color',
                        'branch.branch_name',
                        'employee.fullname as employee_name'
                    )
                    ->selectRaw($priorityOrderCase.' as priority_order', [$now, 'Under Repair'])
                    ->selectRaw($priorityCase.' as priority', [$now, 'Under Repair', $oneMonthFromNow])
                    ->where(function ($query) use ($threeMonthsFromNow) {
                        // Warranty expiring within 3 months or already expired
                        $query->where(function ($q) use ($threeMonthsFromNow) {
                            $q->whereNotNull('assets.waranty_expiration_date')
                                ->where('assets.waranty_expiration_date', '<=', $threeMonthsFromNow);
                        })
                        // Or under repair
                            ->orWhere('status.name', 'Under Repair');
                    })
                    ->orderBy('priority_order')
                    ->orderBy('assets.waranty_expiration_date')
                    ->limit($limit)
                    ->get()
                    ->map(function ($asset) use ($now) {
                        // Calculate next maintenance
                        $lastUpdate = $asset->updated_at ?: $asset->created_at;
                        $nextMaintenance = date('Y-m-d', strtotime($lastUpdate.' +30 days'));

                        // Determine reason
                        $reason = 'Scheduled maintenance';
                        $warrantyExpiration = $asset->warranty_expiration
                            ? \Carbon\Carbon::parse($asset->warranty_expiration)
                            : null;
                        if ($warrantyExpiration && $warrantyExpiration->lt($now)) {
                            $reason = 'Warranty expired';
                        } elseif ($asset->status_name === 'Under Repair') {
                            $reason = 'Currently under repair';
                        } elseif ($warrantyExpiration) {
                            $daysUntilExpiry = $now->diffInDays($warrantyExpiration, false);
                            if ($daysUntilExpiry <= 30) {
                                $reason = "Warranty expiring in {$daysUntilExpiry} days";
                            } else {
                                $reason = 'Warranty expiring in '.ceil($daysUntilExpiry / 30).' months';
                            }
                        }

                        return [
                            'id' => $asset->id,
                            'asset_name' => $asset->asset_name,
                            'serial_number' => $asset->serial_number,
                            'category' => $asset->category_name ?? 'Unknown',
                            'status' => $asset->status_name ?? 'Unknown',
                            'status_color' => $asset->status_color ?? '#64748b',
                            'branch' => $asset->branch_name ?? 'Unassigned',
                            'assigned_to' => trim($asset->employee_name) ?: 'Unassigned',
                            'warranty_expiration' => $asset->warranty_expiration,
                            'next_maintenance' => $nextMaintenance,
                            'priority' => $asset->priority,
                            'reason' => $reason,
                        ];
                    });
            }); // End Cache::remember

            return response()->json([
                'success' => true,
                'data' => $assets,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Assets needing attention error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assets needing attention',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get comprehensive branch-level statistics
     * Includes assets, acquisitions, repairs, and status breakdown per branch
     */
    public function getBranchStatistics(Request $request)
    {
        try {
            $months = min($request->get('months', 12), 24); // Max 24 months
            $statistics = $this->dashboardService->getBranchStatistics($months);

            return response()->json([
                'success' => true,
                'data' => $statistics,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Branch statistics error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch branch statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Clear dashboard cache (for manual refresh)
     */
    public function clearCache()
    {
        try {
            $this->dashboardService->clearCache();

            return response()->json([
                'success' => true,
                'message' => 'Dashboard cache cleared successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Clear cache error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache',
            ], 500);
        }
    }
}
