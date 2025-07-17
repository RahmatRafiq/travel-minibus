<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
        use SoftDeletes;

    protected $fillable = ['plate_number', 'brand', 'seat_capacity', 'driver_id', 'route_id'];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
    
    public function bookings()
    {
        return $this->hasManyThrough(Booking::class, Schedule::class, 'vehicle_id', 'schedule_id');
    }
}

