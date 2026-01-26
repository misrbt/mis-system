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
        'asset_category_id',
        'subcategory_id',
    ];

    /**
     * Get all assets using this equipment
     */
    public function assets()
    {
        return $this->hasMany(Asset::class, 'equipment_id');
    }

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(AssetSubcategory::class, 'subcategory_id');
    }
}
