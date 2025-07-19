<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;
use App\Models\Vehicle;
use App\Models\Route;
use App\Models\RouteVehicle;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicle1 = Vehicle::where('plate_number', 'DD 1234 XX')->first();
        $vehicle2 = Vehicle::where('plate_number', 'DD 5678 YY')->first();
        $route1 = Route::where('origin', 'Makassar')->where('destination', 'Bone')->first();
        $route2 = Route::where('origin', 'Bone')->where('destination', 'Makassar')->first();

        $rv1 = RouteVehicle::where('route_id', $route1->id)->where('vehicle_id', $vehicle1->id)->first();
        $rv2 = RouteVehicle::where('route_id', $route2->id)->where('vehicle_id', $vehicle2->id)->first();

        Schedule::create([
            'route_vehicle_id' => $rv1->id,
            'departure_time' => Carbon::now()->addHours(2),
            'status' => 'ready',
        ]);
        Schedule::create([
            'route_vehicle_id' => $rv2->id,
            'departure_time' => Carbon::now()->addHours(3),
            'status' => 'ready',
        ]);
    }
}
