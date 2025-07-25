<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Route extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'origin',
        'destination',
        'duration',
        'price',
    ];

    public function vehicles()
    {
        return $this->belongsToMany(Vehicle::class, 'route_vehicle');
    }

    public function routeVehicles()
    {
        return $this->hasMany(RouteVehicle::class);
    }

    public function schedules()
    {
        return $this->hasManyThrough(
            Schedule::class,
            RouteVehicle::class,
            'route_id',
            'route_vehicle_id',
            'id',
            'id'
        );
    }
}
