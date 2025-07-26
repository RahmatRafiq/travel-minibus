<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'schedule_id',
        'booking_time',
        'seats_booked',
        'status',
        'seats_selected',
        'amount',
        'reference'
    ];

    protected $casts = [
        'seats_selected' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->reference)) {
                do {
                    $reference = 'TRV-' . str_pad(random_int(0, 9999999), 7, '0', STR_PAD_LEFT);
                } while (self::where('reference', $reference)->exists());
                $booking->reference = $reference;
            }
        });
    }
}

