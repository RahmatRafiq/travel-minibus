<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingPassenger extends Model
{
    protected $fillable = [
        'booking_id',
        'name',
        'phone_number',
        'pickup_address',
        'pickup_latitude',
        'pickup_longitude',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
