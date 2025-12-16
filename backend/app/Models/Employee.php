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
        'department_id',
        'position_id',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
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
}
