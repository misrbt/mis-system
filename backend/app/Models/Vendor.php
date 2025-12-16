<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $table = 'vendors';

    protected $fillable = [
        'company_name',
        'contact_no',
        'address',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}
