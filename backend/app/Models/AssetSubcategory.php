<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssetSubcategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asset_subcategories';

    protected $fillable = [
        'category_id',
        'name',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the category that owns the subcategory
     */
    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    /**
     * Get the assets for this subcategory
     */
    public function assets()
    {
        return $this->hasMany(Asset::class, 'subcategory_id');
    }

    /**
     * Check if subcategory can be deleted (has no assets)
     */
    public function canBeDeleted()
    {
        return $this->assets()->count() === 0;
    }

    /**
     * Get the count of assets using this subcategory
     */
    public function getAssetsCountAttribute()
    {
        return $this->assets()->count();
    }
}
