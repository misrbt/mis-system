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
        'has_obo',
    ];

    protected function casts(): array
    {
        return [
            'has_obo' => 'boolean',
        ];
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function obos()
    {
        return $this->hasMany(BranchObo::class);
    }

    /**
     * Get the workstations at this branch.
     */
    public function workstations()
    {
        return $this->hasMany(Workstation::class);
    }
}
