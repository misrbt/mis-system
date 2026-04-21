<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BranchObo extends Model
{
    use HasFactory;

    protected $table = 'branch_obos';

    protected $fillable = [
        'branch_id',
        'name',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'obo_id');
    }

    public function workstations(): HasMany
    {
        return $this->hasMany(Workstation::class, 'obo_id');
    }
}
