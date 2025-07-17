<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Route;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        Route::create([
            'name' => 'Makassar - Bone',
            'origin' => 'Makassar',
            'destination' => 'Bone',
            'duration' => '03:00:00', // contoh durasi
        ]);

        Route::create([
            'name' => 'Bone - Makassar',
            'origin' => 'Bone',
            'destination' => 'Makassar',
            'duration' => '03:00:00', // contoh durasi
        ]);
    }
}
