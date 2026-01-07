<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Repair;
use App\Models\Status;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardService
{
    /**
     * Cache duration in seconds (5 minutes)
     */
    private const CACHE_DURATION = 300;

    /**
     * Get comprehensive dashboard statistics with optimized queries
     */
    public function getStatistics(): array
    {
        return Cache::remember('dashboard:statistics', self::CACHE_DURATION, function () {
            // Single query for basic asset statistics
            $assetStats = $this->getAssetStatistics();

            // Parallel execution of independent queries
            $assetsByStatus = $this->getAssetsByStatus();
            $assetsByCategory = $this->getAssetsByCategory();
            $assetsByBranch = $this->getAssetsByBranch($assetStats['total_assets']);
            $recentAssets = $this->getRecentAssets();
            $monthlyAcquisitions = $this->getMonthlyAcquisitions();
            $repairStats = $this->getRepairStatistics();
            $topCategories = $this->getTopCategories();
            $warrantyExpiringSoon = $this->getWarrantyExpiringSoon();

            // Count assigned and available assets based on employee assignment
            $assignmentStats = DB::table('assets')
                ->selectRaw('
                    COUNT(CASE WHEN assigned_to_employee_id IS NOT NULL THEN 1 END) as assigned_count,
                    COUNT(CASE WHEN assigned_to_employee_id IS NULL THEN 1 END) as available_count
                ')
                ->first();

            return [
                'overview' => [
                    'total_assets' => $assetStats['total_assets'],
                    'total_book_value' => $assetStats['total_book_value'],
                    'total_acquisition_cost' => $assetStats['total_acquisition_cost'],
                    'available_assets' => (int) ($assignmentStats->available_count ?? 0),
                    'assigned_assets' => (int) ($assignmentStats->assigned_count ?? 0),
                    'under_repair' => $assetsByStatus->where('status', 'Under Repair')->first()['count'] ?? 0,
                    'warranty_expiring_soon' => $warrantyExpiringSoon,
                ],
                'assets_by_status' => $assetsByStatus->values(),
                'assets_by_category' => $assetsByCategory->values(),
                'assets_by_branch' => $assetsByBranch->values(),
                'recent_assets' => $recentAssets,
                'monthly_acquisitions' => $monthlyAcquisitions,
                'repairs' => $repairStats,
                'top_categories' => $topCategories,
                'depreciation' => [
                    'total_acquisition_cost' => $assetStats['total_acquisition_cost'],
                    'current_book_value' => $assetStats['total_book_value'],
                    'total_depreciation' => $assetStats['total_acquisition_cost'] - $assetStats['total_book_value'],
                    'depreciation_percentage' => $assetStats['total_acquisition_cost'] > 0
                        ? round((($assetStats['total_acquisition_cost'] - $assetStats['total_book_value']) / $assetStats['total_acquisition_cost']) * 100, 2)
                        : 0,
                ],
            ];
        });
    }

    /**
     * Get basic asset statistics in a single query
     */
    private function getAssetStatistics(): array
    {
        $stats = Asset::selectRaw('
            COUNT(*) as total_assets,
            COALESCE(SUM(book_value), 0) as total_book_value,
            COALESCE(SUM(acq_cost), 0) as total_acquisition_cost
        ')->first();

        return [
            'total_assets' => $stats->total_assets ?? 0,
            'total_book_value' => (float) ($stats->total_book_value ?? 0),
            'total_acquisition_cost' => (float) ($stats->total_acquisition_cost ?? 0),
        ];
    }

    /**
     * Get assets grouped by status with optimized join
     */
    private function getAssetsByStatus()
    {
        return DB::table('assets')
            ->join('status', 'assets.status_id', '=', 'status.id')
            ->select(
                'status.name as status',
                'status.color',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('status.id', 'status.name', 'status.color')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => (int) $item->count,
                    'color' => $item->color ?? '#64748b',
                ];
            });
    }

    /**
     * Get assets grouped by category with optimized join
     */
    private function getAssetsByCategory()
    {
        return DB::table('assets')
            ->join('asset_category', 'assets.asset_category_id', '=', 'asset_category.id')
            ->select(
                'asset_category.name as category',
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(assets.book_value), 0) as total_value')
            )
            ->groupBy('asset_category.id', 'asset_category.name')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'count' => (int) $item->count,
                    'total_value' => (float) $item->total_value,
                ];
            });
    }

    /**
     * Get assets grouped by branch with percentages
     */
    private function getAssetsByBranch(int $totalAssets)
    {
        $branches = DB::table('assets')
            ->leftJoin('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->leftJoin('branch', 'employee.branch_id', '=', 'branch.id')
            ->select(
                DB::raw('COALESCE(branch.branch_name, \'Unassigned\') as branch'),
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(assets.book_value), 0) as total_value')
            )
            ->groupBy('branch.id', 'branch.branch_name')
            ->get();

        return $branches->map(function ($item) use ($totalAssets) {
            return [
                'branch' => $item->branch,
                'count' => (int) $item->count,
                'total_value' => (float) $item->total_value,
                'percentage' => $totalAssets > 0 ? round(($item->count / $totalAssets) * 100, 1) : 0,
            ];
        });
    }

    /**
     * Get recent assets with minimal data
     */
    private function getRecentAssets()
    {
        return DB::table('assets')
            ->leftJoin('asset_category', 'assets.asset_category_id', '=', 'asset_category.id')
            ->leftJoin('status', 'assets.status_id', '=', 'status.id')
            ->leftJoin('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->leftJoin('branch', 'employee.branch_id', '=', 'branch.id')
            ->select(
                'assets.id',
                'assets.asset_name',
                'assets.created_at',
                'assets.book_value',
                'asset_category.name as category_name',
                'status.name as status_name',
                'branch.branch_name',
                'employee.fullname as employee_name'
            )
            ->orderBy('assets.created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'asset_name' => $asset->asset_name,
                    'category' => $asset->category_name ?? 'Unknown',
                    'status' => $asset->status_name ?? 'Unknown',
                    'branch' => $asset->branch_name ?? 'Unassigned',
                    'assigned_to' => trim($asset->employee_name) ?: 'Unassigned',
                    'created_at' => $asset->created_at,
                    'book_value' => (float) $asset->book_value,
                ];
            });
    }

    /**
     * Get monthly acquisition trends
     */
    private function getMonthlyAcquisitions()
    {
        return DB::table('assets')
            ->select(
                DB::raw('TO_CHAR(purchase_date, \'YYYY-MM\') as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(acq_cost), 0) as total_cost')
            )
            ->where('purchase_date', '>=', now()->subMonths(12))
            ->whereNotNull('purchase_date')
            ->groupBy(DB::raw('TO_CHAR(purchase_date, \'YYYY-MM\')'))
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'count' => (int) $item->count,
                    'total_cost' => (float) $item->total_cost,
                ];
            });
    }

    /**
     * Get repair statistics in a single query
     */
    private function getRepairStatistics(): array
    {
        $stats = DB::table('repairs')
            ->selectRaw('
                COUNT(*) as total_repairs,
                SUM(CASE WHEN status IN (\'Pending\', \'In Repair\', \'Completed\') THEN 1 ELSE 0 END) as active_repairs,
                SUM(CASE WHEN status = \'Returned\' THEN 1 ELSE 0 END) as completed_repairs,
                COALESCE(SUM(repair_cost), 0) as total_repair_cost
            ')
            ->first();

        $repairsByStatus = DB::table('repairs')
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => (int) $item->count,
                ];
            });

        return [
            'total' => (int) ($stats->total_repairs ?? 0),
            'active' => (int) ($stats->active_repairs ?? 0),
            'completed' => (int) ($stats->completed_repairs ?? 0),
            'total_cost' => (float) ($stats->total_repair_cost ?? 0),
            'by_status' => $repairsByStatus,
        ];
    }

    /**
     * Get top categories by asset count
     */
    private function getTopCategories()
    {
        return DB::table('asset_category')
            ->leftJoin('assets', 'asset_category.id', '=', 'assets.asset_category_id')
            ->select(
                'asset_category.name',
                DB::raw('COUNT(assets.id) as count')
            )
            ->groupBy('asset_category.id', 'asset_category.name')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'count' => (int) $category->count,
                ];
            });
    }

    /**
     * Get count of assets with warranty expiring soon
     */
    private function getWarrantyExpiringSoon(): int
    {
        return Asset::whereNotNull('waranty_expiration_date')
            ->whereBetween('waranty_expiration_date', [now(), now()->addMonths(3)])
            ->count();
    }

    /**
     * Get monthly expenses with caching
     */
    public function getMonthlyExpenses(): array
    {
        $currentYear = now()->year;
        $cacheKey = "dashboard:monthly_expenses:{$currentYear}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($currentYear) {
            // Single query to get both acquisitions and repairs
            $expenses = DB::table(DB::raw('
                (SELECT
                    EXTRACT(MONTH FROM purchase_date) as month_num,
                    SUM(acq_cost) as acquisition_cost,
                    0 as repair_cost
                FROM assets
                WHERE EXTRACT(YEAR FROM purchase_date) = ?
                GROUP BY EXTRACT(MONTH FROM purchase_date)

                UNION ALL

                SELECT
                    EXTRACT(MONTH FROM repair_date) as month_num,
                    0 as acquisition_cost,
                    SUM(repair_cost) as repair_cost
                FROM repairs
                WHERE EXTRACT(YEAR FROM repair_date) = ?
                GROUP BY EXTRACT(MONTH FROM repair_date)) as combined
            '))
            ->select(
                'month_num',
                DB::raw('SUM(acquisition_cost) as acquisition_cost'),
                DB::raw('SUM(repair_cost) as repair_cost')
            )
            ->setBindings([$currentYear, $currentYear])
            ->groupBy('month_num')
            ->get()
            ->keyBy('month_num');

            // Generate all 12 months
            $result = [];
            for ($m = 1; $m <= 12; $m++) {
                $expense = $expenses->get($m);
                $acquisitionCost = (float) ($expense->acquisition_cost ?? 0);
                $repairCost = (float) ($expense->repair_cost ?? 0);

                $result[] = [
                    'month' => date('M Y', mktime(0, 0, 0, $m, 1, $currentYear)),
                    'month_key' => sprintf('%04d-%02d', $currentYear, $m),
                    'acquisition_cost' => $acquisitionCost,
                    'repair_cost' => $repairCost,
                    'total_cost' => $acquisitionCost + $repairCost,
                ];
            }

            return $result;
        });
    }

    /**
     * Get yearly expenses comparison
     */
    public function getYearlyExpenses(): array
    {
        return Cache::remember('dashboard:yearly_expenses', self::CACHE_DURATION, function () {
            $currentYear = now()->year;
            $years = range($currentYear - 2, $currentYear);

            // Single query for all years
            $data = DB::table(DB::raw('
                (SELECT
                    EXTRACT(YEAR FROM purchase_date) as year,
                    SUM(acq_cost) as acquisition_cost,
                    0 as repair_cost,
                    COUNT(*) as asset_count
                FROM assets
                WHERE EXTRACT(YEAR FROM purchase_date) IN (' . implode(',', $years) . ')
                GROUP BY EXTRACT(YEAR FROM purchase_date)

                UNION ALL

                SELECT
                    EXTRACT(YEAR FROM repair_date) as year,
                    0 as acquisition_cost,
                    SUM(repair_cost) as repair_cost,
                    0 as asset_count
                FROM repairs
                WHERE EXTRACT(YEAR FROM repair_date) IN (' . implode(',', $years) . ')
                GROUP BY EXTRACT(YEAR FROM repair_date)) as combined
            '))
            ->select(
                'year',
                DB::raw('SUM(acquisition_cost) as acquisition_cost'),
                DB::raw('SUM(repair_cost) as repair_cost'),
                DB::raw('SUM(asset_count) as asset_count')
            )
            ->groupBy('year')
            ->get()
            ->keyBy('year');

            $result = [];
            foreach ($years as $year) {
                $yearData = $data->get($year);
                $acquisitionCost = (float) ($yearData->acquisition_cost ?? 0);
                $repairCost = (float) ($yearData->repair_cost ?? 0);

                $result[] = [
                    'year' => (string) $year,
                    'acquisition_cost' => $acquisitionCost,
                    'repair_cost' => $repairCost,
                    'total_cost' => $acquisitionCost + $repairCost,
                    'asset_count' => (int) ($yearData->asset_count ?? 0),
                ];
            }

            return $result;
        });
    }

    /**
     * Get comprehensive branch-level statistics
     * Includes assets, book values, acquisitions, and repair costs per branch
     *
     * @param int $months Number of months to include in trends (default 12)
     * @return array
     */
    public function getBranchStatistics(int $months = 12): array
    {
        $cacheKey = "dashboard:branch_statistics:{$months}";

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($months) {
            $summary = $this->getAllBranchStats();
            $monthlyTrends = $this->getBranchMonthlyTrends($months);
            $statusBreakdown = $this->getBranchStatusBreakdown();

            return [
                'summary' => $summary,
                'monthly_trends' => $monthlyTrends,
                'status_breakdown' => $statusBreakdown,
            ];
        });
    }

    /**
     * Get current statistics for all branches
     *
     * @return array
     */
    private function getAllBranchStats(): array
    {
        return DB::table('branch')
            ->leftJoin('employee', 'branch.id', '=', 'employee.branch_id')
            ->leftJoin('assets', 'employee.id', '=', 'assets.assigned_to_employee_id')
            ->select(
                'branch.id as branch_id',
                'branch.branch_name',
                'branch.brcode',
                DB::raw('COUNT(DISTINCT assets.id) as total_assets'),
                DB::raw('COALESCE(SUM(assets.book_value), 0) as total_book_value'),
                DB::raw('COALESCE(SUM(assets.acq_cost), 0) as total_acquisition_cost')
            )
            ->groupBy('branch.id', 'branch.branch_name', 'branch.brcode')
            ->orderBy('branch.branch_name')
            ->get()
            ->map(function ($branch) {
                return [
                    'branch_id' => $branch->branch_id,
                    'branch_name' => $branch->branch_name,
                    'brcode' => $branch->brcode,
                    'total_assets' => (int) $branch->total_assets,
                    'total_book_value' => (float) $branch->total_book_value,
                    'total_acquisition_cost' => (float) $branch->total_acquisition_cost,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get monthly trends for branch acquisitions and repairs
     *
     * @param int $months Number of months to include
     * @return array
     */
    private function getBranchMonthlyTrends(int $months): array
    {
        $startDate = now()->subMonths($months)->startOfMonth();

        // Get acquisitions per branch per month
        $acquisitions = DB::table('assets')
            ->join('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->join('branch', 'employee.branch_id', '=', 'branch.id')
            ->select(
                'branch.id as branch_id',
                'branch.branch_name',
                DB::raw("TO_CHAR(assets.purchase_date, 'YYYY-MM') as month"),
                DB::raw('COUNT(*) as asset_count'),
                DB::raw('COALESCE(SUM(assets.acq_cost), 0) as acquisition_cost')
            )
            ->where('assets.purchase_date', '>=', $startDate)
            ->whereNotNull('assets.purchase_date')
            ->groupBy('branch.id', 'branch.branch_name', DB::raw("TO_CHAR(assets.purchase_date, 'YYYY-MM')"))
            ->get();

        // Get repairs per branch per month
        $repairs = DB::table('repairs')
            ->join('assets', 'repairs.asset_id', '=', 'assets.id')
            ->join('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->join('branch', 'employee.branch_id', '=', 'branch.id')
            ->select(
                'branch.id as branch_id',
                'branch.branch_name',
                DB::raw("TO_CHAR(repairs.repair_date, 'YYYY-MM') as month"),
                DB::raw('COUNT(*) as repair_count'),
                DB::raw('COALESCE(SUM(repairs.repair_cost), 0) as repair_cost')
            )
            ->where('repairs.repair_date', '>=', $startDate)
            ->whereNotNull('repairs.repair_date')
            ->groupBy('branch.id', 'branch.branch_name', DB::raw("TO_CHAR(repairs.repair_date, 'YYYY-MM')"))
            ->get();

        // Combine and format data
        return $this->formatBranchTrends($acquisitions, $repairs, $months);
    }

    /**
     * Format branch trends into monthly time series
     *
     * @param \Illuminate\Support\Collection $acquisitions
     * @param \Illuminate\Support\Collection $repairs
     * @param int $months
     * @return array
     */
    private function formatBranchTrends($acquisitions, $repairs, int $months): array
    {
        $result = [];

        // Generate last N months
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthLabel = $date->format('M Y');

            $result[] = [
                'month' => $monthLabel,
                'month_key' => $monthKey,
                'branches' => [],
            ];
        }

        // Get all branches
        $branches = DB::table('branch')->select('id', 'branch_name')->get();

        // Populate data for each month and branch
        foreach ($result as &$monthData) {
            foreach ($branches as $branch) {
                $acq = $acquisitions->where('branch_id', $branch->id)
                    ->where('month', $monthData['month_key'])
                    ->first();

                $rep = $repairs->where('branch_id', $branch->id)
                    ->where('month', $monthData['month_key'])
                    ->first();

                $acquisitionCost = (float) ($acq->acquisition_cost ?? 0);
                $repairCost = (float) ($rep->repair_cost ?? 0);

                $monthData['branches'][$branch->branch_name] = [
                    'acquisition_cost' => $acquisitionCost,
                    'asset_count' => (int) ($acq->asset_count ?? 0),
                    'repair_cost' => $repairCost,
                    'repair_count' => (int) ($rep->repair_count ?? 0),
                    'total_expense' => $acquisitionCost + $repairCost,
                ];
            }
        }

        return $result;
    }

    /**
     * Get status breakdown per branch
     * Shows all assets grouped by their current or last known branch and status
     *
     * @return array
     */
    private function getBranchStatusBreakdown(): array
    {
        // Get assets with current branch assignment
        $currentlyAssigned = DB::table('assets')
            ->leftJoin('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->leftJoin('branch', 'employee.branch_id', '=', 'branch.id')
            ->join('status', 'assets.status_id', '=', 'status.id')
            ->whereNotNull('branch.id')
            ->select(
                'assets.id as asset_id',
                'branch.id as branch_id',
                'branch.branch_name',
                'status.name as status_name',
                'status.color as status_color'
            );

        // Get assets with last known branch from asset_movements (for unassigned assets)
        $fromMovements = DB::table('assets')
            ->join('status', 'assets.status_id', '=', 'status.id')
            ->leftJoin('employee as current_emp', 'assets.assigned_to_employee_id', '=', 'current_emp.id')
            ->join(
                DB::raw('(
                    SELECT DISTINCT ON (am.asset_id)
                        am.asset_id,
                        am.to_branch_id as branch_id
                    FROM asset_movements am
                    WHERE am.movement_type IN (\'assigned\', \'transferred\', \'returned\')
                        AND am.to_branch_id IS NOT NULL
                    ORDER BY am.asset_id, am.created_at DESC
                ) as last_movement'),
                'assets.id',
                '=',
                'last_movement.asset_id'
            )
            ->join('branch', 'last_movement.branch_id', '=', 'branch.id')
            ->whereNull('current_emp.id') // Only unassigned assets
            ->select(
                'assets.id as asset_id',
                'branch.id as branch_id',
                'branch.branch_name',
                'status.name as status_name',
                'status.color as status_color'
            );

        // Combine both result sets
        $data = $currentlyAssigned
            ->unionAll($fromMovements)
            ->get()
            ->groupBy('branch_name');

        // Count statuses per branch
        $result = [];
        foreach ($data as $branchName => $assets) {
            $statusCounts = $assets->groupBy('status_name')->map(function ($group) {
                $first = $group->first();
                return [
                    'status' => $first->status_name,
                    'color' => $first->status_color,
                    'count' => $group->count(),
                ];
            })->values()->toArray();

            $result[] = [
                'branch_name' => $branchName,
                'statuses' => $statusCounts,
            ];
        }

        return $result;
    }

    /**
     * Clear all dashboard caches
     */
    public function clearCache(): void
    {
        Cache::forget('dashboard:statistics');
        Cache::forget('dashboard:monthly_expenses:' . now()->year);
        Cache::forget('dashboard:yearly_expenses');

        // Clear branch statistics cache for common month values
        for ($months = 1; $months <= 24; $months++) {
            Cache::forget("dashboard:branch_statistics:{$months}");
        }
    }
}
