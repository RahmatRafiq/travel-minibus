<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Route;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Ambil 5 booking terbaru, jika login maka booking user, jika tidak booking umum
        $bookings = Booking::with([
            'schedule.routeVehicle.vehicle',
            'schedule.routeVehicle.route'
        ])
        ->when(auth()->check(), function ($q) {
            $q->where('user_id', auth()->id());
        })
        ->latest()
        ->take(5)
        ->get()
        ->map(function ($b) {
            return [
                'id' => $b->id,
                'origin' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->route
                    ? $b->schedule->routeVehicle->route->origin : '-',
                'destination' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->route
                    ? $b->schedule->routeVehicle->route->destination : '-',
                'date' => $b->schedule ? substr($b->schedule->departure_time, 0, 10) : '-',
                'seats' => $b->seats_booked,
                'status' => ucfirst($b->status),
                'vehicle' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->vehicle
                    ? $b->schedule->routeVehicle->vehicle->plate_number : '-',
                'brand' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->vehicle
                    ? $b->schedule->routeVehicle->vehicle->brand : '-',
            ];
        })
        ->toArray();

        $allOrigins = Route::query()->distinct()->pluck('origin')->filter()->values()->all();
        $allDestinations = Route::query()->distinct()->pluck('destination')->filter()->values()->all();

        return Inertia::render('Home/Home', [
            'bookings' => $bookings,
            'isLoggedIn' => auth()->check(),
            'userName' => auth()->user()?->name,
            'allOrigins' => $allOrigins,
            'allDestinations' => $allDestinations,
        ]);
    }

    public function userBookings()
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $bookings = Booking::with([
            'schedule.routeVehicle.vehicle',
            'schedule.routeVehicle.route'
        ])
        ->where('user_id', auth()->id())
        ->latest()
        ->get()
        ->map(function ($b) {
            return [
                'id' => $b->id,
                'origin' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->route
                    ? $b->schedule->routeVehicle->route->origin : '-',
                'destination' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->route
                    ? $b->schedule->routeVehicle->route->destination : '-',
                'date' => $b->schedule ? substr($b->schedule->departure_time, 0, 10) : '-',
                'seats' => $b->seats_booked,
                'status' => ucfirst($b->status),
                'vehicle' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->vehicle
                    ? $b->schedule->routeVehicle->vehicle->plate_number : '-',
                'brand' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->vehicle
                    ? $b->schedule->routeVehicle->vehicle->brand : '-',
            ];
        })
        ->toArray();

        return Inertia::render('Home/Bookings', [
            'bookings' => $bookings,
            'userName' => auth()->user()?->name,
            'isLoggedIn' => true,
        ]);
    }

    public function bookingDetail(Request $request)
    {
        $allOrigins = Route::query()->distinct()->pluck('origin')->filter()->values()->all();
        $allDestinations = Route::query()->distinct()->pluck('destination')->filter()->values()->all();

        $schedules = [];
        $origin = $request->origin;
        $destination = $request->destination;
        $date = $request->date;

        if ($origin && $destination && $date) {
            $request->validate([
                'origin' => 'required|string',
                'destination' => 'required|string',
                'date' => 'required|date',
            ]);

            $routes = Route::where('origin', $origin)
                ->where('destination', $destination)
                ->get();

            foreach ($routes as $route) {
                foreach ($route->routeVehicles as $rv) {
                    $rv->load('vehicle');
                    $availableSchedules = $rv->schedules()
                        ->where('status', 'ready')
                        ->whereDate('departure_time', $date)
                        ->get();

                    foreach ($availableSchedules as $schedule) {
                        $booked = Booking::where('schedule_id', $schedule->id)
                            ->whereIn('status', ['pending', 'confirmed'])
                            ->sum('seats_booked');
                        $available_seats = $rv->vehicle->seat_capacity - $booked;

                        $schedules[] = [
                            'id' => $schedule->id,
                            'departure_time' => $schedule->departure_time,
                            'available_seats' => max(0, $available_seats),
                            'vehicle' => [
                                'id' => $rv->vehicle->id,
                                'plate_number' => $rv->vehicle->plate_number,
                                'brand' => $rv->vehicle->brand,
                            ],
                            'route' => [
                                'id' => $route->id,
                                'origin' => $route->origin,
                                'destination' => $route->destination,
                            ],
                        ];
                    }
                }
            }
        }

        return Inertia::render('Home/BookingPage', [
            'origin' => $origin,
            'destination' => $destination,
            'date' => $date,
            'schedules' => $schedules,
            'isLoggedIn' => auth()->check(),
            'userName' => auth()->user()?->name,
            'allOrigins' => $allOrigins,
            'allDestinations' => $allDestinations,
        ]);
    }

    public function storeBooking(Request $request)
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        DB::beginTransaction();
        try {
            $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'seats_booked' => 'required|integer|min:1',
            ]);

            $schedule = Schedule::with('routeVehicle.vehicle')->findOrFail($request->schedule_id);
            $vehicle = $schedule->routeVehicle->vehicle;

            $booked = Booking::where('schedule_id', $schedule->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->sum('seats_booked');
            $available_seats = $vehicle->seat_capacity - $booked;

            if ($request->seats_booked > $available_seats) {
                return back()->withErrors(['seats_booked' => 'Not enough available seats.']);
            }

            Booking::create([
                'user_id'      => auth()->id(),
                'schedule_id'  => $request->schedule_id,
                'seats_booked' => $request->seats_booked,
                'status'       => 'pending',
            ]);

            DB::commit();
            return redirect()->route('home.my-bookings')->with('success', 'Booking created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Booking store error: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}

