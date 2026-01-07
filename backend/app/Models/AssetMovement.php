<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetMovement extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asset_movements';

    protected $fillable = [
        'asset_id',
        'movement_type',
        'from_employee_id',
        'to_employee_id',
        'from_status_id',
        'to_status_id',
        'from_branch_id',
        'to_branch_id',
        'repair_id',
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

    /**
     * Relationships
     */
    public function asset()
    {
        return $this->belongsTo(Asset::class);
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

    public function repair()
    {
        return $this->belongsTo(Repair::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by_user_id');
    }

    /**
     * Scopes
     */
    public function scopeForAsset($query, $assetId)
    {
        return $query->where('asset_id', $assetId);
    }

    public function scopeAssignments($query)
    {
        return $query->whereIn('movement_type', ['assigned', 'transferred', 'returned']);
    }

    public function scopeStatusChanges($query)
    {
        return $query->where('movement_type', 'status_changed');
    }

    public function scopeRepairs($query)
    {
        return $query->whereIn('movement_type', ['repair_initiated', 'repair_completed']);
    }

    /**
     * Helper Methods
     */
    public function getMovementDescription()
    {
        return match($this->movement_type) {
            'created' => 'Asset created',
            'assigned' => 'Assigned to ' . ($this->toEmployee?->fullname ?? 'employee'),
            'transferred' => 'Transferred from ' . ($this->fromEmployee?->fullname ?? 'previous employee') . ' to ' . ($this->toEmployee?->fullname ?? 'new employee'),
            'returned' => 'Returned from ' . ($this->fromEmployee?->fullname ?? 'employee'),
            'status_changed' => 'Status changed from ' . ($this->fromStatus?->name ?? 'previous status') . ' to ' . ($this->toStatus?->name ?? 'new status'),
            'repair_initiated' => 'Sent for repair',
            'repair_in_progress' => 'Repair in progress',
            'repair_completed' => 'Returned from repair',
            'repair_returned' => 'Asset returned from vendor',
            'repair_status_changed' => 'Repair status updated',
            'repair_updated' => 'Repair record updated',
            'repair_remark_added' => 'Repair remark added',
            'repair_deleted' => 'Repair record deleted',
            'updated' => 'Asset details updated',
            'disposed' => 'Asset disposed',
            'code_generated' => 'QR/Barcode generated',
            'inventory_operation' => $this->remarks ?? 'Inventory operation performed',
            default => 'Unknown movement',
        };
    }

    public function getIconClass()
    {
        return match($this->movement_type) {
            'created' => 'Plus',
            'assigned', 'transferred' => 'User',
            'returned' => 'UserX',
            'status_changed' => 'Activity',
            'repair_initiated', 'repair_in_progress', 'repair_completed', 'repair_returned', 'repair_status_changed', 'repair_updated' => 'Wrench',
            'repair_remark_added' => 'MessageSquare',
            'repair_deleted' => 'Trash2',
            'updated' => 'Edit',
            'disposed' => 'Trash2',
            'code_generated' => 'QrCode',
            'inventory_operation' => 'Database',
            default => 'CircleDot',
        };
    }

    public function getColorClass()
    {
        return match($this->movement_type) {
            'created' => 'green',
            'assigned' => 'blue',
            'transferred' => 'purple',
            'returned' => 'orange',
            'status_changed' => 'indigo',
            'repair_initiated' => 'red',
            'repair_in_progress' => 'orange',
            'repair_completed' => 'green',
            'repair_returned' => 'blue',
            'repair_status_changed' => 'indigo',
            'repair_updated' => 'indigo',
            'repair_remark_added' => 'slate',
            'repair_deleted' => 'red',
            'updated' => 'gray',
            'disposed' => 'red',
            'code_generated' => 'cyan',
            'inventory_operation' => 'yellow',
            default => 'slate',
        };
    }
}
