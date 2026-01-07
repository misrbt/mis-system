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
        Cache::forget('dashboard:statistics');
        Cache::forget('dashboard:monthly_expenses:' . now()->year);
        Cache::forget('dashboard:yearly_expenses');
    }
}
