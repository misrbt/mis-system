<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $table = 'position';

    protected $fillable = [
        'title',
    ];

    protected $appends = ['position_name'];

    public function getPositionNameAttribute()
    {
        return $this->title;
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
