<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Route extends Model
{
        use SoftDeletes;

    protected $fillable = ['name', 'origin', 'destination', 'duration'];

    // Relasi many-to-many ke Vehicle via route_vehicle
    public function vehicles()
    {
        return $this->belongsToMany(Vehicle::class, 'route_vehicle');
    }

    // Relasi ke RouteVehicle (pivot)
    public function routeVehicles()
    {
        return $this->hasMany(RouteVehicle::class);
    }

    // Relasi ke Schedule via route_vehicle
    public function schedules()
    {
        return $this->hasManyThrough(
            Schedule::class,
            RouteVehicle::class,
            'route_id', // Foreign key di route_vehicle
            'route_vehicle_id', // Foreign key di schedules
            'id', // Local key di routes
            'id' // Local key di route_vehicle
        );
    }
}
