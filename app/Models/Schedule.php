<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schedule extends Model
{
    use SoftDeletes;

    protected $fillable = ['route_vehicle_id', 'departure_time', 'status'];

    public function routeVehicle()
    {
        return $this->belongsTo(RouteVehicle::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}

