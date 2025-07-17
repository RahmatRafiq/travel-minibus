<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $driver1 = \App\Models\Driver::where('name', 'Budi')->first();
        $driver2 = \App\Models\Driver::where('name', 'Andi')->first();
        $route1 = \App\Models\Route::where('origin', 'Makassar')->where('destination', 'Bone')->first();
        $route2 = \App\Models\Route::where('origin', 'Bone')->where('destination', 'Makassar')->first();

        Vehicle::create([
            'plate_number' => 'DD 1234 XX',
            'brand' => 'Toyota',
            'seat_capacity' => 10,
            'driver_id' => $driver1->id,
            'route_id' => $route1->id,
        ]);
        Vehicle::create([
            'plate_number' => 'DD 5678 YY',
            'brand' => 'Suzuki',
            'seat_capacity' => 12,
            'driver_id' => $driver2->id,
            'route_id' => $route2->id,
        ]);
    }
}
