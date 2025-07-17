<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicle1 = \App\Models\Vehicle::where('plate_number', 'DD 1234 XX')->first();
        $vehicle2 = \App\Models\Vehicle::where('plate_number', 'DD 5678 YY')->first();

        Schedule::create([
            'vehicle_id' => $vehicle1->id,
            'departure_time' => \Carbon\Carbon::now()->addHours(2),
            'status' => 'open',
        ]);
        Schedule::create([
            'vehicle_id' => $vehicle2->id,
            'departure_time' => \Carbon\Carbon::now()->addHours(3),
            'status' => 'open',
        ]);
    }
}
