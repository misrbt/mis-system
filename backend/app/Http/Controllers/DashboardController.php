<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Repair;
use App\Services\DashboardService;
use Illuminate\Http\Request;
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
            Log::error('Dashboard statistics error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
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
            $trend = DB::table('assets')
                ->select(
                    DB::raw('DATE_FORMAT(purchase_date, "%Y-%m") as month'),
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
            Log::error('Asset trend error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch asset trend',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get recent activity (OPTIMIZED with joins)
     */
    public function getRecentActivity(Request $request)
    {
        try {
            $limit = min($request->get('limit', 20), 100);

            $activities = DB::table('asset_movements')
                ->join('assets', 'asset_movements.asset_id', '=', 'assets.id')
                ->leftJoin('employees as from_emp', 'asset_movements.from_employee_id', '=', 'from_emp.id')
                ->leftJoin('employees as to_emp', 'asset_movements.to_employee_id', '=', 'to_emp.id')
                ->leftJoin('status as from_status', 'asset_movements.from_status_id', '=', 'from_status.id')
                ->leftJoin('status as to_status', 'asset_movements.to_status_id', '=', 'to_status.id')
                ->select(
                    'asset_movements.id',
                    'asset_movements.movement_type',
                    'asset_movements.movement_date',
                    'asset_movements.reason',
                    'assets.asset_name',
                    'assets.serial_number',
                    DB::raw('CONCAT(COALESCE(from_emp.first_name, ""), " ", COALESCE(from_emp.last_name, "")) as from_employee'),
                    DB::raw('CONCAT(COALESCE(to_emp.first_name, ""), " ", COALESCE(to_emp.last_name, "")) as to_employee'),
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

            return response()->json([
                'success' => true,
                'data' => $activities,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Recent activity error: ' . $e->getMessage());

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
            Log::error('Monthly expenses error: ' . $e->getMessage());

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
            Log::error('Yearly expenses error: ' . $e->getMessage());

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
            Log::error('Expense trends error: ' . $e->getMessage());

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
                ->join('asset_categories', 'assets.asset_category_id', '=', 'asset_categories.id')
                ->select(
                    'asset_categories.category_name',
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
                ->groupBy('asset_categories.id', 'asset_categories.category_name')
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
            Log::error('Expense breakdown error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch expense breakdown',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get assets needing attention (OPTIMIZED with single query)
     */
    public function getAssetsNeedingAttention(Request $request)
    {
        try {
            $limit = min($request->get('limit', 50), 100);

            // Single optimized query with all joins
            $assets = DB::table('assets')
                ->leftJoin('asset_categories', 'assets.asset_category_id', '=', 'asset_categories.id')
                ->leftJoin('status', 'assets.status_id', '=', 'status.id')
                ->leftJoin('employees', 'assets.assigned_to_employee_id', '=', 'employees.id')
                ->leftJoin('branches', 'employees.branch_id', '=', 'branches.id')
                ->select(
                    'assets.id',
                    'assets.asset_name',
                    'assets.serial_number',
                    'assets.waranty_expiration_date as warranty_expiration',
                    'assets.updated_at',
                    'assets.created_at',
                    'asset_categories.category_name',
                    'status.name as status_name',
                    'status.color as status_color',
                    'branches.branch_name',
                    DB::raw('CONCAT(COALESCE(employees.first_name, ""), " ", COALESCE(employees.last_name, "")) as employee_name'),
                    DB::raw('CASE
                        WHEN assets.waranty_expiration_date < NOW() THEN 1
                        WHEN status.name = "Under Repair" THEN 2
                        ELSE 3
                    END as priority_order'),
                    DB::raw('CASE
                        WHEN assets.waranty_expiration_date < NOW() THEN "High"
                        WHEN status.name = "Under Repair" THEN "High"
                        WHEN assets.waranty_expiration_date <= DATE_ADD(NOW(), INTERVAL 1 MONTH) THEN "Medium"
                        ELSE "Low"
                    END as priority')
                )
                ->where(function ($query) {
                    // Warranty expiring within 3 months or already expired
                    $query->where(function ($q) {
                        $q->whereNotNull('assets.waranty_expiration_date')
                          ->where('assets.waranty_expiration_date', '<=', now()->addMonths(3));
                    })
                    // Or under repair
                    ->orWhere('status.name', 'Under Repair');
                })
                ->orderBy('priority_order')
                ->orderBy('assets.waranty_expiration_date')
                ->limit($limit)
                ->get()
                ->map(function ($asset) {
                    // Calculate next maintenance
                    $lastUpdate = $asset->updated_at ?: $asset->created_at;
                    $nextMaintenance = date('Y-m-d', strtotime($lastUpdate . ' +30 days'));

                    // Determine reason
                    $reason = 'Scheduled maintenance';
                    if ($asset->warranty_expiration && $asset->warranty_expiration < now()) {
                        $reason = 'Warranty expired';
                    } elseif ($asset->status_name === 'Under Repair') {
                        $reason = 'Currently under repair';
                    } elseif ($asset->warranty_expiration) {
                        $daysUntilExpiry = now()->diffInDays($asset->warranty_expiration, false);
                        if ($daysUntilExpiry <= 30) {
                            $reason = "Warranty expiring in {$daysUntilExpiry} days";
                        } else {
                            $reason = "Warranty expiring in " . ceil($daysUntilExpiry / 30) . " months";
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

            return response()->json([
                'success' => true,
                'data' => $assets,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Assets needing attention error: ' . $e->getMessage());

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
            Log::error('Branch statistics error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
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
            Log::error('Clear cache error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache',
            ], 500);
        }
    }
}
