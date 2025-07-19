<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $user1 = \App\Models\User::where('email', 'admin@example.com')->first();
        $user2 = \App\Models\User::where('email', 'user@example.com')->first();
        $schedule1 = \App\Models\Schedule::orderBy('departure_time')->first();
        $schedule2 = \App\Models\Schedule::orderBy('departure_time', 'desc')->first();

        Booking::create([
            'user_id' => $user1->id,
            'schedule_id' => $schedule1->id,
            'booking_time' => Carbon::now()->subMinutes(10),
            'seats_booked' => 2,
            'status' => 'confirmed',
        ]);

        Booking::create([
            'user_id' => $user2->id,
            'schedule_id' => $schedule2->id,
            'booking_time' => Carbon::now()->subMinutes(5),
            'seats_booked' => 1,
            'status' => 'pending',
        ]);
    }
}
