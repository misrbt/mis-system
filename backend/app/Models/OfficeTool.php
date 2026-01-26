<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficeTool extends Model
{
    use HasFactory;

    protected $table = 'office_tools';

    protected $fillable = [
        'name',
        'version',
        'description',
    ];

    /**
     * Relationships
     */
    public function softwareLicenses()
    {
        return $this->hasMany(SoftwareLicense::class, 'office_tool_id');
    }
}
