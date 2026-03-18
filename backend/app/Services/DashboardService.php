<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Repair;
use App\Models\Status;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

            // Count assigned and available assets (both direct employee and workstation-based)
            $assignmentStats = DB::table('assets')
                ->leftJoin('workstations', 'assets.workstation_id', '=', 'workstations.id')
                ->selectRaw('
                    COUNT(CASE WHEN assigned_to_employee_id IS NOT NULL OR workstations.employee_id IS NOT NULL THEN 1 END) as assigned_count,
                    COUNT(CASE WHEN assigned_to_employee_id IS NULL AND (workstations.employee_id IS NULL OR assets.workstation_id IS NULL) THEN 1 END) as available_count
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
     * Considers both direct employee assignment and workstation-based assignment
     */
    private function getAssetsByBranch(int $totalAssets)
    {
        $branches = DB::table('assets')
            ->leftJoin('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->leftJoin('workstations', 'assets.workstation_id', '=', 'workstations.id')
            ->leftJoin('branch', DB::raw('COALESCE(workstations.branch_id, employee.branch_id)'), '=', 'branch.id')
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
     * Considers both direct employee assignment and workstation-based assignment
     */
    private function getRecentAssets()
    {
        return DB::table('assets')
            ->leftJoin('asset_category', 'assets.asset_category_id', '=', 'asset_category.id')
            ->leftJoin('status', 'assets.status_id', '=', 'status.id')
            ->leftJoin('employee as direct_emp', 'assets.assigned_to_employee_id', '=', 'direct_emp.id')
            ->leftJoin('workstations', 'assets.workstation_id', '=', 'workstations.id')
            ->leftJoin('employee as ws_emp', 'workstations.employee_id', '=', 'ws_emp.id')
            ->leftJoin('branch', DB::raw('COALESCE(workstations.branch_id, direct_emp.branch_id)'), '=', 'branch.id')
            ->select(
                'assets.id',
                'assets.asset_name',
                'assets.created_at',
                'assets.book_value',
                'asset_category.name as category_name',
                'status.name as status_name',
                'branch.branch_name',
                DB::raw('COALESCE(ws_emp.fullname, direct_emp.fullname) as employee_name')
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
                    'assigned_to' => trim($asset->employee_name ?? '') ?: 'Unassigned',
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
            // Optimized: Separate queries are faster than UNION with EXTRACT
            // DATE_TRUNC enables index usage (purchase_date and repair_date indexes)
            $startDate = "{$currentYear}-01-01";
            $endDate = "{$currentYear}-12-31";

            // Get asset acquisitions - uses purchase_date index
            $acquisitions = DB::table('assets')
                ->select(DB::raw("DATE_PART('month', purchase_date) as month_num"))
                ->selectRaw('SUM(acq_cost) as acquisition_cost')
                ->whereBetween('purchase_date', [$startDate, $endDate])
                ->groupBy(DB::raw("DATE_PART('month', purchase_date)"))
                ->get()
                ->keyBy('month_num');

            // Get repairs - uses repair_date index
            $repairs = DB::table('repairs')
                ->select(DB::raw("DATE_PART('month', repair_date) as month_num"))
                ->selectRaw('SUM(repair_cost) as repair_cost')
                ->whereBetween('repair_date', [$startDate, $endDate])
                ->groupBy(DB::raw("DATE_PART('month', repair_date)"))
                ->get()
                ->keyBy('month_num');

            // Generate all 12 months with merged data
            $result = [];
            for ($m = 1; $m <= 12; $m++) {
                $acquisition = $acquisitions->get($m);
                $repair = $repairs->get($m);

                $acquisitionCost = (float) ($acquisition->acquisition_cost ?? 0);
                $repairCost = (float) ($repair->repair_cost ?? 0);

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

            // Sanitize years array - ensure only integers
            $years = array_map('intval', $years);
            $startYear = $currentYear - 2;
            $endYear = $currentYear;

            // Optimized: Separate queries with date range filters (index-friendly)
            // Get asset acquisitions - uses purchase_date index
            $acquisitions = DB::table('assets')
                ->select(DB::raw("DATE_PART('year', purchase_date) as year"))
                ->selectRaw('SUM(acq_cost) as acquisition_cost')
                ->selectRaw('COUNT(*) as asset_count')
                ->whereBetween('purchase_date', ["{$startYear}-01-01", "{$endYear}-12-31"])
                ->groupBy(DB::raw("DATE_PART('year', purchase_date)"))
                ->get()
                ->keyBy('year');

            // Get repairs - uses repair_date index
            $repairData = DB::table('repairs')
                ->select(DB::raw("DATE_PART('year', repair_date) as year"))
                ->selectRaw('SUM(repair_cost) as repair_cost')
                ->whereBetween('repair_date', ["{$startYear}-01-01", "{$endYear}-12-31"])
                ->groupBy(DB::raw("DATE_PART('year', repair_date)"))
                ->get()
                ->keyBy('year');

            // Merge data from both queries
            $result = [];
            foreach ($years as $year) {
                $acquisition = $acquisitions->get($year);
                $repair = $repairData->get($year);

                $acquisitionCost = (float) ($acquisition->acquisition_cost ?? 0);
                $repairCost = (float) ($repair->repair_cost ?? 0);
                $assetCount = (int) ($acquisition->asset_count ?? 0);

                $result[] = [
                    'year' => (string) $year,
                    'acquisition_cost' => $acquisitionCost,
                    'repair_cost' => $repairCost,
                    'total_cost' => $acquisitionCost + $repairCost,
                    'asset_count' => $assetCount,
                ];
            }

            return $result;
        });
    }

    /**
     * Get comprehensive branch-level statistics
     * Includes assets, book values, acquisitions, and repair costs per branch
     *
     * @param  int  $months  Number of months to include in trends (default 12)
     */
    public function getBranchStatistics(int $months = 12): array
    {
        // Cache branch statistics for 5 minutes (300 seconds)
        $cacheKey = "dashboard:branch_statistics:{$months}";

        return Cache::remember($cacheKey, 300, function () use ($months) {
            try {
                $summary = $this->getAllBranchStats();
            } catch (\Exception $e) {
                Log::error('Branch stats error: '.$e->getMessage());
                $summary = [];
            }

            try {
                $monthlyTrends = $this->getBranchMonthlyTrends($months);
            } catch (\Exception $e) {
                Log::error('Branch monthly trends error: '.$e->getMessage());
                $monthlyTrends = [];
            }

            try {
                $statusBreakdown = $this->getBranchStatusBreakdown();
            } catch (\Exception $e) {
                Log::error('Branch status breakdown error: '.$e->getMessage());
                $statusBreakdown = [];
            }

            return [
                'summary' => $summary,
                'monthly_trends' => $monthlyTrends,
                'status_breakdown' => $statusBreakdown,
            ];
        });
    }

    /**
     * Get current statistics for all branches
     * Considers both direct employee assignment and workstation-based assignment
     */
    private function getAllBranchStats(): array
    {
        // Get assets assigned via direct employee
        $directAssets = DB::table('assets')
            ->join('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->whereNull('assets.workstation_id')
            ->select(
                'employee.branch_id',
                'assets.id as asset_id',
                'assets.book_value',
                'assets.acq_cost'
            );

        // Get assets assigned via workstation
        $workstationAssets = DB::table('assets')
            ->join('workstations', 'assets.workstation_id', '=', 'workstations.id')
            ->select(
                'workstations.branch_id',
                'assets.id as asset_id',
                'assets.book_value',
                'assets.acq_cost'
            );

        // Union both sources and aggregate by branch
        return DB::table('branch')
            ->leftJoinSub(
                $directAssets->unionAll($workstationAssets),
                'branch_assets',
                'branch.id',
                '=',
                'branch_assets.branch_id'
            )
            ->select(
                'branch.id as branch_id',
                'branch.branch_name',
                'branch.brcode',
                DB::raw('COUNT(DISTINCT branch_assets.asset_id) as total_assets'),
                DB::raw('COALESCE(SUM(branch_assets.book_value), 0) as total_book_value'),
                DB::raw('COALESCE(SUM(branch_assets.acq_cost), 0) as total_acquisition_cost')
            )
            ->groupBy('branch.id', 'branch.branch_name', 'branch.brcode')
            ->orderBy('branch.brcode')
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
     * @param  int  $months  Number of months to include
     */
    private function getBranchMonthlyTrends(int $months): array
    {
        $startDate = now()->subMonths($months)->startOfMonth();

        // Get acquisitions per branch per month (both direct employee and workstation-based)
        $acquisitions = DB::table('assets')
            ->leftJoin('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->leftJoin('workstations', 'assets.workstation_id', '=', 'workstations.id')
            ->join('branch', DB::raw('COALESCE(workstations.branch_id, employee.branch_id)'), '=', 'branch.id')
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

        // Get repairs per branch per month (both direct employee and workstation-based)
        $repairs = DB::table('repairs')
            ->join('assets', 'repairs.asset_id', '=', 'assets.id')
            ->leftJoin('employee', 'assets.assigned_to_employee_id', '=', 'employee.id')
            ->leftJoin('workstations', 'assets.workstation_id', '=', 'workstations.id')
            ->join('branch', DB::raw('COALESCE(workstations.branch_id, employee.branch_id)'), '=', 'branch.id')
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
     * Optimized: O(n) instead of O(n²) by using lookup arrays
     *
     * @param  \Illuminate\Support\Collection  $acquisitions
     * @param  \Illuminate\Support\Collection  $repairs
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

        // Create fast lookup arrays (O(1) access instead of O(n) search)
        $acqLookup = [];
        foreach ($acquisitions as $acq) {
            $key = $acq->branch_id.':'.$acq->month;
            $acqLookup[$key] = $acq;
        }

        $repLookup = [];
        foreach ($repairs as $rep) {
            $key = $rep->branch_id.':'.$rep->month;
            $repLookup[$key] = $rep;
        }

        // Populate data for each month and branch - now O(n) instead of O(n²)
        foreach ($result as &$monthData) {
            foreach ($branches as $branch) {
                $lookupKey = $branch->id.':'.$monthData['month_key'];

                $acq = $acqLookup[$lookupKey] ?? null;
                $rep = $repLookup[$lookupKey] ?? null;

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
     * Shows ALL branches with their asset status distribution
     * Includes branches even if they have no assets
     * Optimized for PostgreSQL
     */
    private function getBranchStatusBreakdown(): array
    {
        // Get all branches first
        $allBranches = DB::table('branch')
            ->select('id', 'branch_name', 'brcode')
            ->orderBy('brcode')
            ->get();

        // Get all statuses
        $allStatuses = DB::table('status')
            ->select('id', 'name', 'color')
            ->get()
            ->keyBy('id');

        // Get asset counts per branch and status
        // Using LEFT JOIN to include all combinations (both direct employee and workstation-based)
        $assetCounts = DB::table('branch')
            ->leftJoin('employee', 'branch.id', '=', 'employee.branch_id')
            ->leftJoin('assets as emp_assets', function ($join) {
                $join->on('employee.id', '=', 'emp_assets.assigned_to_employee_id')
                    ->whereNull('emp_assets.workstation_id');
            })
            ->leftJoin('workstations', 'branch.id', '=', 'workstations.branch_id')
            ->leftJoin('assets as ws_assets', 'workstations.id', '=', 'ws_assets.workstation_id')
            ->leftJoin('status', DB::raw('COALESCE(ws_assets.status_id, emp_assets.status_id)'), '=', 'status.id')
            ->select(
                'branch.id as branch_id',
                'branch.branch_name',
                'branch.brcode',
                'status.id as status_id',
                'status.name as status_name',
                'status.color as status_color',
                DB::raw('COUNT(DISTINCT COALESCE(ws_assets.id, emp_assets.id)) as count')
            )
            ->groupBy('branch.id', 'branch.branch_name', 'branch.brcode', 'status.id', 'status.name', 'status.color')
            ->orderBy('branch.brcode')
            ->get();

        // Group the results by branch
        $branchData = [];

        // Initialize all branches with empty statuses
        foreach ($allBranches as $branch) {
            $branchData[$branch->branch_name] = [
                'branch_name' => $branch->branch_name,
                'brcode' => $branch->brcode,
                'statuses' => [],
            ];
        }

        // Populate with actual counts
        foreach ($assetCounts as $row) {
            $branchName = $row->branch_name;
            if ($row->status_name && $row->count > 0) {
                $branchData[$branchName]['statuses'][] = [
                    'status' => $row->status_name,
                    'color' => $row->status_color ?? '#64748b',
                    'count' => (int) $row->count,
                ];
            }
        }

        // Convert to array and sort by brcode
        $result = array_values($branchData);
        usort($result, function ($a, $b) {
            return ($a['brcode'] ?? '') <=> ($b['brcode'] ?? '');
        });

        return $result;
    }

    /**
     * Clear all dashboard caches
     */
    public function clearCache(): void
    {
        Cache::forget('dashboard:statistics');
        Cache::forget('dashboard:monthly_expenses:'.now()->year);
        Cache::forget('dashboard:yearly_expenses');

        // Clear new unified endpoint caches
        $year = now()->year;
        for ($month = 1; $month <= 12; $month++) {
            Cache::forget("dashboard:initial_data:{$year}:{$month}");
        }

        // Clear activity and attention caches
        Cache::forget('dashboard:recent_activity:10');
        Cache::forget('dashboard:recent_activity:20');
        Cache::forget('dashboard:assets_needing_attention:50');
        Cache::forget('dashboard:assets_needing_attention:100');

        // Clear branch statistics cache for common month values
        for ($months = 1; $months <= 24; $months++) {
            Cache::forget("dashboard:branch_statistics:{$months}");
        }
    }
}
