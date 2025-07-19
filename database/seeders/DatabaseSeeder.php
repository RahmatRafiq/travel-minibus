<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Nonaktifkan event selama seeding
        \App\Models\User::unsetEventDispatcher();

        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            DriverSeeder::class,
            RouteSeeder::class,
            VehicleSeeder::class,
            RouteVehicleSeeder::class, // tambahkan ini
            ScheduleSeeder::class,
            BookingSeeder::class,
        ]);
    }
}
