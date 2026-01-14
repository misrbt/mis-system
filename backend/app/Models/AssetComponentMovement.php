<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetComponentMovement extends Model
{
    use SoftDeletes;

    protected $table = 'asset_component_movements';

    protected $fillable = [
        'asset_component_id',
        'parent_asset_id',
        'movement_type',
        'from_employee_id',
        'to_employee_id',
        'from_status_id',
        'to_status_id',
        'from_branch_id',
        'to_branch_id',
        'performed_by_user_id',
        'reason',
        'remarks',
        'metadata',
        'movement_date',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'movement_date' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function assetComponent()
    {
        return $this->belongsTo(AssetComponent::class);
    }

    public function parentAsset()
    {
        return $this->belongsTo(Asset::class, 'parent_asset_id');
    }

    public function fromEmployee()
    {
        return $this->belongsTo(Employee::class, 'from_employee_id');
    }

    public function toEmployee()
    {
        return $this->belongsTo(Employee::class, 'to_employee_id');
    }

    public function fromStatus()
    {
        return $this->belongsTo(Status::class, 'from_status_id');
    }

    public function toStatus()
    {
        return $this->belongsTo(Status::class, 'to_status_id');
    }

    public function fromBranch()
    {
        return $this->belongsTo(Branch::class, 'from_branch_id');
    }

    public function toBranch()
    {
        return $this->belongsTo(Branch::class, 'to_branch_id');
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by_user_id');
    }

    // Helper methods (mirrors AssetMovement)
    public function getMovementDescription()
    {
        return match($this->movement_type) {
            'created' => 'Component created',
            'assigned' => 'Assigned to ' . ($this->toEmployee?->fullname ?? 'employee'),
            'transferred' => 'Transferred from ' . ($this->fromEmployee?->fullname ?? 'previous employee') . ' to ' . ($this->toEmployee?->fullname ?? 'new employee'),
            'returned' => 'Returned from ' . ($this->fromEmployee?->fullname ?? 'employee'),
            'status_changed' => 'Status changed from ' . ($this->fromStatus?->name ?? 'previous status') . ' to ' . ($this->toStatus?->name ?? 'new status'),
            'attached' => 'Attached to parent asset',
            'detached' => 'Detached from parent asset',
            'updated' => 'Component details updated',
            'disposed' => 'Component disposed',
            default => 'Unknown movement',
        };
    }
}
