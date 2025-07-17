<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = ['name', 'phone'];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}
