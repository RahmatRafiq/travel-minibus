<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schedule extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'route_id',
        'departure_time',
        'status',
        'is_return',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function getOriginAttribute(): string
    {
        return $this->is_return === 'yes'
            ? $this->route->destination
            : $this->route->origin;
    }

    public function getDestinationAttribute(): string
    {
        return $this->is_return === 'yes'
            ? $this->route->origin
            : $this->route->destination;
    }
}
