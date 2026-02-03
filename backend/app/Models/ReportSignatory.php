<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportSignatory extends Model
{
    use HasFactory;

    protected $table = 'report_signatories';

    protected $fillable = [
        'user_id',
        'checked_by_id',
        'noted_by_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function checkedBy()
    {
        return $this->belongsTo(Employee::class, 'checked_by_id');
    }

    public function notedBy()
    {
        return $this->belongsTo(Employee::class, 'noted_by_id');
    }
}
