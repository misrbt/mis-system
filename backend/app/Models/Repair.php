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
        return match($this->status) {
            'Pending' => 'yellow',
            'In Repair' => 'blue',
            'Completed' => 'green',
            'Returned' => 'gray',
            default => 'slate',
        };
    }
}
