<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workstation extends Model
{
    use HasFactory;

    protected $table = 'workstations';

    protected $fillable = [
        'branch_id',
        'position_id',
        'employee_id',
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['asset_count', 'employee_count'];

    /**
     * Auto-generate name from branch + position when saving.
     */
    protected static function booted(): void
    {
        static::saving(function (Workstation $workstation) {
            if (empty($workstation->name)) {
                $workstation->name = $workstation->generateName();
            }
        });
    }

    /**
     * Generate a descriptive name from branch and position.
     */
    public function generateName(): string
    {
        $branchName = $this->branch?->branch_name ?? 'Unknown Branch';
        $positionName = $this->position?->title ?? 'General';

        return "{$branchName} - {$positionName}";
    }

    /**
     * Get the branch that owns the workstation.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the position associated with the workstation.
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * Get the assets at this workstation.
     */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    /**
     * Get the employee assigned to this workstation.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get count of assets at this workstation.
     */
    public function getAssetCountAttribute(): int
    {
        return $this->assets()->count();
    }

    /**
     * Get count of employees assigned to this workstation (0 or 1).
     */
    public function getEmployeeCountAttribute(): int
    {
        return $this->employee_id ? 1 : 0;
    }

    /**
     * Scope to filter active workstations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by branch.
     */
    public function scopeForBranch($query, int $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    /**
     * Scope to filter by position.
     */
    public function scopeForPosition($query, int $positionId)
    {
        return $query->where('position_id', $positionId);
    }
}
