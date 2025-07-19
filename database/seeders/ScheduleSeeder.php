<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;
use App\Models\Vehicle;
use App\Models\Route;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicle1 = Vehicle::where('plate_number', 'DD 1234 XX')->first();
        $vehicle2 = Vehicle::where('plate_number', 'DD 5678 YY')->first();
        $route1 = Route::where('origin', 'Makassar')->where('destination', 'Bone')->first();
        $route2 = Route::where('origin', 'Bone')->where('destination', 'Makassar')->first();

        Schedule::create([
            'vehicle_id' => $vehicle1->id,
            'route_id' => $route1->id,
            'departure_time' => Carbon::now()->addHours(2),
            'status' => 'open',
        ]);
        Schedule::create([
            'vehicle_id' => $vehicle2->id,
            'route_id' => $route2->id,
            'departure_time' => Carbon::now()->addHours(3),
            'status' => 'open',
        ]);
    }
}
