<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use SoftDeletes;

    protected $fillable = ['plate_number', 'brand', 'seat_capacity', 'driver_id'];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    // Relasi many-to-many ke Route via route_vehicle
    public function routes()
    {
        return $this->belongsToMany(Route::class, 'route_vehicle');
    }

    // Add this: single route accessor for compatibility
    public function route()
    {
        return $this->belongsToMany(Route::class, 'route_vehicle')->limit(1);
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
            'vehicle_id', // Foreign key di route_vehicle
            'route_vehicle_id', // Foreign key di schedules
            'id', // Local key di vehicles
            'id' // Local key di route_vehicle
        );
    }
}

