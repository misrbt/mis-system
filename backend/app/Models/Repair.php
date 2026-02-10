<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Repair extends Model
{
    use HasFactory;

    protected $table = 'repairs';

    protected $fillable = [
        'asset_id',
        'vendor_id',
        'description',
        'repair_date',
        'expected_return_date',
        'actual_return_date',
        'repair_cost',
        'status',
        'remarks',
        'invoice_no',
        'completion_description',
        'job_order_path',
        'delivered_by_type',
        'delivered_by_employee_name',
        'delivered_by_employee_id',
        'delivered_by_branch_id',
    ];

    protected $casts = [
        'repair_date' => 'date',
        'expected_return_date' => 'date',
        'actual_return_date' => 'date',
        'repair_cost' => 'decimal:2',
    ];

    // Relationships
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function deliveredByEmployee()
    {
        return $this->belongsTo(Employee::class, 'delivered_by_employee_id');
    }

    public function deliveredByBranch()
    {
        return $this->belongsTo(Branch::class, 'delivered_by_branch_id');
    }

    public function remarks()
    {
        return $this->hasMany(RepairRemark::class)->orderBy('created_at', 'desc');
    }

    // Scopes for common queries
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeInRepair($query)
    {
        return $query->where('status', 'In Repair');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completed');
    }

    public function scopeReturned($query)
    {
        return $query->where('status', 'Returned');
    }

    // Helper to check if repair is overdue
    public function isOverdue()
    {
        if ($this->status === 'Returned') {
            return false;
        }

        return now()->gt($this->expected_return_date);
    }

    // Helper to get status badge color
    public function getStatusColor()
    {
        return match ($this->status) {
            'Pending' => 'yellow',
            'In Repair' => 'blue',
            'Completed' => 'green',
            'Returned' => 'gray',
            default => 'slate',
        };
    }

    /**
     * Check if repair is due soon (within specified days)
     */
    public function isDueSoon($days = 4)
    {
        if ($this->status === 'Returned' || ! $this->expected_return_date) {
            return false;
        }

        $daysUntilDue = $this->getDaysUntilDue();

        return $daysUntilDue >= 0 && $daysUntilDue <= $days;
    }

    /**
     * Get number of days until due (negative if overdue)
     */
    public function getDaysUntilDue()
    {
        if (! $this->expected_return_date) {
            return null;
        }

        return now()->startOfDay()->diffInDays($this->expected_return_date, false);
    }

    /**
     * Get due status: 'overdue', 'due_soon', 'on_track', or null
     */
    public function getDueStatus($dueSoonDays = 4)
    {
        if ($this->status === 'Returned' || ! $this->expected_return_date) {
            return null;
        }

        $daysUntilDue = $this->getDaysUntilDue();

        if ($daysUntilDue < 0) {
            return 'overdue';
        } elseif ($daysUntilDue <= $dueSoonDays) {
            return 'due_soon';
        }

        return 'on_track';
    }

    /**
     * Scope for repairs due within specified days
     */
    public function scopeDueSoon($query, $days = 4)
    {
        return $query->whereNotIn('status', ['Returned'])
            ->whereNotNull('expected_return_date')
            ->where('expected_return_date', '>=', now()->startOfDay())
            ->where('expected_return_date', '<=', now()->addDays($days)->endOfDay());
    }

    /**
     * Scope for overdue repairs (not returned, past due date)
     */
    public function scopeOverdue($query)
    {
        return $query->whereNotIn('status', ['Returned'])
            ->whereNotNull('expected_return_date')
            ->where('expected_return_date', '<', now()->startOfDay());
    }

    /**
     * Scope for active repairs (not returned)
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['Returned']);
    }
}
