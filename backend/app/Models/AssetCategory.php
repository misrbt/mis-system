<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetCategory extends Model
{
    use HasFactory;

    protected $table = 'asset_category';

    protected $fillable = [
        'name',
        'code',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class, 'asset_category_id');
    }

    public function subcategories()
    {
        return $this->hasMany(AssetSubcategory::class, 'category_id');
    }

    /**
     * Check if category can be deleted (has no subcategories)
     */
    public function canBeDeleted()
    {
        return $this->subcategories()->count() === 0;
    }
}
