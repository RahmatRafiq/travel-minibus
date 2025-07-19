<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\Route;
use Illuminate\Support\Facades\DB;

class RouteVehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicle1 = Vehicle::where('plate_number', 'DD 1234 XX')->first();
        $vehicle2 = Vehicle::where('plate_number', 'DD 5678 YY')->first();
        $route1 = Route::where('origin', 'Makassar')->where('destination', 'Bone')->first();
        $route2 = Route::where('origin', 'Bone')->where('destination', 'Makassar')->first();

        // Misal: kedua kendaraan bisa melayani kedua rute (bolak-balik)
        $vehicle1->routes()->syncWithoutDetaching([$route1->id, $route2->id]);
        $vehicle2->routes()->syncWithoutDetaching([$route1->id, $route2->id]);
    }
}
