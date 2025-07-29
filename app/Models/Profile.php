<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    //
    protected $fillable = [
        'user_id',
        'phone_number',
        'pickup_address',
        'address',
        'pickup_latitude',
        'pickup_longitude',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
