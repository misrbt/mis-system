<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoftwareLicense extends Model
{
    use HasFactory;

    protected $table = 'software_licenses';

    protected $fillable = [
        'employee_id',
        'position_id',
        'section_id',
        'branch_id',
        'asset_category_id',
        'operating_system',
        'licensed',
        'office_tool_id',
        'client_access',
        'remarks',
    ];

    /**
     * Relationships
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function assetCategory()
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function officeTool()
    {
        return $this->belongsTo(OfficeTool::class, 'office_tool_id');
    }
}
