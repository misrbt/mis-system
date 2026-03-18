<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class DashboardCacheObserver
{
    /**
     * Clear dashboard cache when data changes
     */
    public function created($model): void
    {
        $this->clearDashboardCache();
    }

    /**
     * Clear dashboard cache when data changes
     */
    public function updated($model): void
    {
        $this->clearDashboardCache();
    }

    /**
     * Clear dashboard cache when data changes
     */
    public function deleted($model): void
    {
        $this->clearDashboardCache();
    }

    /**
     * Clear all dashboard-related caches
     */
    private function clearDashboardCache(): void
    {
        // Clear main statistics
        Cache::forget('dashboard:statistics');

        // Clear monthly/yearly expenses (last 3 years to be safe)
        for ($year = now()->year - 2; $year <= now()->year + 1; $year++) {
            Cache::forget("dashboard:monthly_expenses:{$year}");
        }
        Cache::forget('dashboard:yearly_expenses');

        // Clear unified endpoint caches (last 2 years, all months)
        for ($month = 1; $month <= 12; $month++) {
            for ($year = now()->year - 1; $year <= now()->year + 1; $year++) {
                Cache::forget("dashboard:initial_data:{$year}:{$month}");
            }
        }

        // Clear activity and attention caches (common limits: 10, 20, 50, 100)
        foreach ([10, 20, 50, 100] as $limit) {
            Cache::forget("dashboard:recent_activity:{$limit}");
            Cache::forget("dashboard:assets_needing_attention:{$limit}");
        }

        // Clear under-repair cache
        Cache::forget('dashboard:under_repair_assets');

        // Clear branch statistics (common month ranges: 1-24 months)
        for ($months = 1; $months <= 24; $months++) {
            Cache::forget("dashboard:branch_statistics:{$months}");
        }

        // Clear daily expenses cache
        Cache::forget('dashboard:daily_expenses');
    }
}
