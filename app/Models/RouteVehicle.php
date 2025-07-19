<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RouteVehicle extends Model
{
    protected $table = 'route_vehicle';

    protected $fillable = ['route_id', 'vehicle_id'];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'route_vehicle_id');
    }
}
