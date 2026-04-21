<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employee';

    protected $fillable = [
        'fullname',
        'branch_id',
        'obo_id',
        'department_id',
        'position_id',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function obo()
    {
        return $this->belongsTo(BranchObo::class, 'obo_id');
    }

    public function department()
    {
        return $this->belongsTo(Section::class, 'department_id');
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function assignedAssets()
    {
        return $this->hasMany(Asset::class, 'assigned_to_employee_id');
    }

    /**
     * Get the workstations assigned to this employee.
     */
    public function workstations()
    {
        return $this->hasMany(Workstation::class);
    }

    /**
     * Get all assets from all assigned workstations.
     */
    public function workstationAssets()
    {
        $workstationIds = $this->workstations()->pluck('id');

        return Asset::whereIn('workstation_id', $workstationIds);
    }
}
