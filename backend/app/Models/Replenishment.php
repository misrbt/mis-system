<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Replenishment extends Model
{
    use HasFactory;

    protected $table = 'replenishments';

    protected $fillable = [
        'asset_name',
        'serial_number',
        'asset_category_id',
        'subcategory_id',
        'brand',
        'model',
        'acq_cost',
        'purchase_date',
        'vendor_id',
        'status_id',
        'assigned_to_employee_id',
        'assigned_to_branch_id',
        'remarks',
        'specifications',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'acq_cost' => 'float',
        'specifications' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(AssetSubcategory::class, 'subcategory_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function assignedEmployee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to_employee_id');
    }

    public function assignedBranch()
    {
        return $this->belongsTo(Branch::class, 'assigned_to_branch_id');
    }
}
