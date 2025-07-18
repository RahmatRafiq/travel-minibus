<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Route extends Model
{
        use SoftDeletes;

    protected $fillable = ['name', 'origin', 'destination', 'duration'];

    public function vehicles()
    {
        return $this->belongsToMany(\App\Models\Vehicle::class, 'route_vehicle');
    }
}
