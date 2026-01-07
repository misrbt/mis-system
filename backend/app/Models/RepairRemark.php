<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairRemark extends Model
{
    use HasFactory;

    protected $table = 'repair_remarks';

    protected $fillable = [
        'repair_id',
        'remark',
        'remark_type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function repair()
    {
        return $this->belongsTo(Repair::class);
    }
}
