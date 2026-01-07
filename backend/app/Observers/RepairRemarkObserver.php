<?php

namespace App\Observers;

use App\Models\RepairRemark;
use App\Models\AssetMovement;
use Illuminate\Support\Facades\Auth;

class RepairRemarkObserver
{
    /**
     * Handle the RepairRemark "created" event.
     */
    public function created(RepairRemark $repairRemark): void
    {
        $repair = $repairRemark->repair;

        if (!$repair) {
            return;
        }

        $remarkTypeLabel = match($repairRemark->remark_type) {
            'status_change' => 'Status Change',
            'pending_reason' => 'Pending Reason',
            'general' => 'General',
            default => ucfirst(str_replace('_', ' ', $repairRemark->remark_type)),
        };

        AssetMovement::create([
            'asset_id' => $repair->asset_id,
            'movement_type' => 'repair_remark_added',
            'repair_id' => $repair->id,
            'performed_by_user_id' => Auth::id(),
            'movement_date' => now(),
            'reason' => "Repair remark added ({$remarkTypeLabel})",
            'remarks' => $repairRemark->remark,
            'metadata' => [
                'remark_type' => $repairRemark->remark_type,
                'remark_type_label' => $remarkTypeLabel,
                'repair_status' => $repair->status,
                'vendor_name' => $repair->vendor?->company_name,
                'remark_id' => $repairRemark->id,
            ],
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }

    /**
     * Handle the RepairRemark "updated" event.
     */
    public function updated(RepairRemark $repairRemark): void
    {
        //
    }

    /**
     * Handle the RepairRemark "deleted" event.
     */
    public function deleted(RepairRemark $repairRemark): void
    {
        //
    }

    /**
     * Handle the RepairRemark "restored" event.
     */
    public function restored(RepairRemark $repairRemark): void
    {
        //
    }

    /**
     * Handle the RepairRemark "force deleted" event.
     */
    public function forceDeleted(RepairRemark $repairRemark): void
    {
        //
    }
}
