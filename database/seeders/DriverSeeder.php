<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Driver;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        Driver::create([
            'name' => 'Budi',
            'phone' => '081234567890',
        ]);
        Driver::create([
            'name' => 'Andi',
            'phone' => '082345678901',
        ]);
    }
}
