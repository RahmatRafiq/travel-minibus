<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Route extends Model
{
    protected $fillable = ['name', 'origin', 'destination', 'duration'];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}
