<?php

namespace App\Observers;

use App\Models\Workstation;
use App\Services\InventoryAuditLogService;
use Illuminate\Support\Facades\Cache;

class WorkstationObserver
{
    /**
     * Handle the Workstation "created" event.
     */
    public function created(Workstation $workstation): void
    {
        InventoryAuditLogService::log('workstation_created', [
            'workstation_id' => $workstation->id,
            'name' => $workstation->name,
            'branch_id' => $workstation->branch_id,
            'branch_name' => $workstation->branch?->branch_name,
            'position_id' => $workstation->position_id,
            'position_name' => $workstation->position?->title,
        ]);

        $this->clearCaches();
    }

    /**
     * Handle the Workstation "updated" event.
     */
    public function updated(Workstation $workstation): void
    {
        $changes = $workstation->getChanges();
        $original = $workstation->getOriginal();

        InventoryAuditLogService::log('workstation_updated', [
            'workstation_id' => $workstation->id,
            'name' => $workstation->name,
            'changes' => $changes,
            'original' => array_intersect_key($original, $changes),
        ]);

        $this->clearCaches();
    }

    /**
     * Handle the Workstation "deleted" event.
     */
    public function deleted(Workstation $workstation): void
    {
        InventoryAuditLogService::log('workstation_deleted', [
            'workstation_id' => $workstation->id,
            'name' => $workstation->name,
            'branch_id' => $workstation->branch_id,
            'branch_name' => $workstation->branch?->branch_name,
        ]);

        $this->clearCaches();
    }

    /**
     * Clear relevant caches when workstation data changes.
     */
    private function clearCaches(): void
    {
        // Clear workstation-related caches
        Cache::forget('workstations:all');
        Cache::forget('workstations:active');

        // Clear dashboard caches that might include workstation data
        Cache::forget('dashboard:statistics');
        Cache::forget('dashboard:branch_statistics');
    }
}
