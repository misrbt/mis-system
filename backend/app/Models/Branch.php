<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $table = 'branch';

    protected $fillable = [
        'branch_name',
        'brak',
        'brcode',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * Get the workstations at this branch.
     */
    public function workstations()
    {
        return $this->hasMany(Workstation::class);
    }
}
