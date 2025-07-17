<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;
use App\Models\Vehicle;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicle1 = Vehicle::where('plate_number', 'DD 1234 XX')->first();
        $vehicle2 = Vehicle::where('plate_number', 'DD 5678 YY')->first();

        // Pastikan data ada sebelum create
        if ($vehicle1) {
            Schedule::create([
                'vehicle_id'     => $vehicle1->id,
                'route_id'       => $vehicle1->route_id,
                'departure_time' => Carbon::now()->addHours(2),
                'status'         => 'open',
            ]);
        }
        if ($vehicle2) {
            Schedule::create([
                'vehicle_id'     => $vehicle2->id,
                'route_id'       => $vehicle2->route_id,
                'departure_time' => Carbon::now()->addHours(3),
                'status'         => 'open',
            ]);
        }
    }
}
