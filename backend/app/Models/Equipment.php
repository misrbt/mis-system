<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use SoftDeletes;

    protected $table = 'equipment';

    protected $fillable = [
        'brand',
        'model',
        'description',
    ];

    /**
     * Get all assets using this equipment
     */
    public function assets()
    {
        return $this->hasMany(Asset::class, 'equipment_id');
    }
}
