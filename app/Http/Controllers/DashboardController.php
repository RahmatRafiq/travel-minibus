<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\Route;
use App\Models\Schedule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Hanya menghitung data yang tidak di-soft delete
        $totalBooking = Booking::count();
        $totalUser = User::count();
        $totalDriver = Driver::count();
        $totalArmada = Vehicle::count();
        $ruteAktif = Route::count();
        $jadwalHariIni = Schedule::whereDate('departure_time', now()->toDateString())->count();

        // Menggunakan with untuk eager loading dan memastikan tidak termasuk soft deleted
        $jadwalList = Schedule::with(['routeVehicle.route', 'routeVehicle.vehicle.driver', 'bookings'])
            ->whereDate('departure_time', now()->toDateString())
            ->whereHas('routeVehicle.route') // Pastikan route tidak soft deleted
            ->whereHas('routeVehicle.vehicle') // Pastikan vehicle tidak soft deleted
            ->get()
            ->map(function ($s) {
                $route = $s->routeVehicle ? $s->routeVehicle->route : null;
                $vehicle = $s->routeVehicle ? $s->routeVehicle->vehicle : null;
                $driver = $vehicle ? $vehicle->driver : null;
                return [
                    'jam' => date('H:i', strtotime($s->departure_time)),
                    'rute' => $route ? $route->name : '-',
                    'armada' => $vehicle ? $vehicle->plate_number : '-',
                    'driver' => $driver ? $driver->name : '-',
                    'kursi' => $s->bookings->sum('seats_booked') . '/' . ($vehicle ? $vehicle->seat_capacity : '-'),
                    'status' => $s->status,
                ];
            });

        // Untuk booking terbaru, pastikan hanya data yang tidak soft deleted
        $bookingTerbaru = Booking::with(['user', 'schedule.routeVehicle.route'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($b) {
                $route = $b->schedule && $b->schedule->routeVehicle ? $b->schedule->routeVehicle->route : null;
                return [
                    'user' => $b->user ? $b->user->name : '-',
                    'rute' => $route ? $route->name : '-',
                    'kursi' => $b->seats_booked,
                    'tanggal' => $b->booking_time ? date('d/m/y', strtotime($b->booking_time)) : '-',
                    'status' => $b->status,
                ];
            });

        // Untuk rute populer, pastikan hanya data yang tidak soft deleted
        $rutePopuler = Booking::with(['schedule.routeVehicle.route'])
            ->whereHas('schedule.routeVehicle.route') // Pastikan route tidak soft deleted
            ->get()
            ->groupBy(function ($b) {
                $route = $b->schedule && $b->schedule->routeVehicle ? $b->schedule->routeVehicle->route : null;
                return $route ? $route->id : null;
            })
            ->filter(function ($group, $routeId) {
                return $routeId !== null;
            })
            ->map(function ($group, $routeId) {
                $route = $group->first()->schedule->routeVehicle->route ?? null;
                return [
                    'rute' => $route ? $route->name : '-',
                    'total' => $group->count(),
                ];
            })
            ->sortByDesc('total')
            ->take(5)
            ->values();
       
                return Inertia::render('Dashboard', [
            'stats' => [
                ['label' => 'Total Booking', 'value' => $totalBooking],
                ['label' => 'Total User', 'value' => $totalUser],
                ['label' => 'Total Driver', 'value' => $totalDriver],
                ['label' => 'Total Armada', 'value' => $totalArmada],
                ['label' => 'Rute Aktif', 'value' => $ruteAktif],
                ['label' => 'Jadwal Hari Ini', 'value' => $jadwalHariIni],
            ],
            'jadwalHariIni' => $jadwalList,
            'bookingTerbaru' => $bookingTerbaru,
            'rutePopuler' => [
                'labels' => $rutePopuler->pluck('rute'),
                'datasets' => [[
                    'label' => 'Jumlah Booking',
                    'data' => $rutePopuler->pluck('total'),
                    'backgroundColor' => [
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(251, 191, 36, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(34, 197, 94, 0.7)',
                    ],
                    'borderRadius' => 8,
                ]],
            ],
        ]);
    }
}
