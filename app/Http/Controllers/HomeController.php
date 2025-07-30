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
                'seats_selected' => $b->seats_selected ?? [],
                'status' => ucfirst($b->status),
                'vehicle' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->vehicle
                    ? $b->schedule->routeVehicle->vehicle->plate_number : '-',
                'brand' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->vehicle
                    ? $b->schedule->routeVehicle->vehicle->brand : '-',
                'amount' => $b->amount,
                'reference' => $b->reference,
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
                'seats_selected' => $b->seats_selected ?? [],
                'status' => ucfirst($b->status),
                'vehicle' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->vehicle
                    ? $b->schedule->routeVehicle->vehicle->plate_number : '-',
                'brand' => $b->schedule && $b->schedule->routeVehicle && $b->schedule->routeVehicle->vehicle
                    ? $b->schedule->routeVehicle->vehicle->brand : '-',
                'amount' => $b->amount,
                'reference' => $b->reference,
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

        $origin = $request->origin;
        $destination = $request->destination;
        $date = $request->date;
        $schedules = [];
        $reservedSeats = [];

        if ($origin && $destination && $date) {
            $request->validate([
                'origin' => 'required|string',
                'destination' => 'required|string',
                'date' => 'required|date',
            ]);

            $routes = Route::where('origin', $origin)
                ->where('destination', $destination)
                ->get();
            $now = now(config('app.timezone', 'UTC'));

            foreach ($routes as $route) {
                foreach ($route->routeVehicles as $rv) {
                    $rv->load('vehicle');
                    $availableSchedules = $rv->schedules()
                        ->where('status', 'ready')
                        ->whereDate('departure_time', $date)
                        ->where('departure_time', '>', $now)
                        ->get();

                    foreach ($availableSchedules as $schedule) {
                        $booked = Booking::where('schedule_id', $schedule->id)
                            ->whereIn('status', ['pending', 'confirmed'])
                            ->sum('seats_booked');
                        $available_seats = $rv->vehicle->seat_capacity - $booked;
                        $bookedSeats = Booking::where('schedule_id', $schedule->id)
                            ->whereIn('status', ['pending', 'confirmed'])
                            ->pluck('seats_selected')
                            ->flatten()
                            ->toArray();
                        $reservedSeats = array_merge($reservedSeats, $bookedSeats);
                        $schedules[] = [
                            'id' => $schedule->id,
                            'departure_time' => $schedule->departure_time,
                            'available_seats' => max(0, $available_seats),
                            'vehicle' => [
                                'id' => $rv->vehicle->id,
                                'plate_number' => $rv->vehicle->plate_number,
                                'brand' => $rv->vehicle->brand,
                                'seat_capacity' => $rv->vehicle->seat_capacity,
                            ],
                            'route' => [
                                'id' => $route->id,
                                'origin' => $route->origin,
                                'destination' => $route->destination,
                                'price' => $route->price ?? 0,
                            ],
                        ];
                    }
                }
            }
        }

        $reservedSeats = array_values(array_unique($reservedSeats));

        $profile = null;
        if (auth()->check() && auth()->user()->profile) {
            $profileModel = auth()->user()->profile;
            $profile = [
                'phone_number' => $profileModel->phone_number,
                'pickup_address' => $profileModel->pickup_address,
                'address' => $profileModel->address,
                'pickup_latitude' => $profileModel->pickup_latitude,
                'pickup_longitude' => $profileModel->pickup_longitude,
            ];
        }

        return Inertia::render('Home/BookingPage', [
            'origin' => $origin,
            'destination' => $destination,
            'date' => $date,
            'schedules' => $schedules,
            'reservedSeats' => $reservedSeats,
            'isLoggedIn' => auth()->check(),
            'userName' => auth()->user()?->name,
            'allOrigins' => $allOrigins,
            'allDestinations' => $allDestinations,
            'profile' => $profile,
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
                'seats_selected' => 'required|array|min:1',
                'passengers' => 'required|array|min:1',
                'passengers.*.name' => 'required|string',
                'passengers.*.phone_number' => 'nullable|string',
                'passengers.*.pickup_address' => 'nullable|string',
            ]);

            $schedule = Schedule::with(['routeVehicle.vehicle', 'routeVehicle.route'])->findOrFail($request->schedule_id);
            $vehicle = $schedule->routeVehicle->vehicle;
            $route = $schedule->routeVehicle->route;

            $bookedSeats = Booking::where('schedule_id', $schedule->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->pluck('seats_selected')
                ->flatten()
                ->toArray();

            $selectedSeats = $request->input('seats_selected', []);
            $selectedSeats = array_filter($selectedSeats, function($seat) {
                return $seat !== "D" && $seat !== "Sopir";
            });
            $conflict = array_intersect($selectedSeats, $bookedSeats);
            if (count($conflict) > 0) {
                return back()->withErrors(['seats_selected' => 'Kursi sudah dipesan: ' . implode(', ', $conflict)]);
            }

            if (count($selectedSeats) > $vehicle->seat_capacity) {
                return back()->withErrors(['seats_selected' => 'Jumlah kursi melebihi kapasitas penumpang.']);
            }

            $amount = 0;
            if ($route && isset($route->price)) {
                $amount = count($selectedSeats) * $route->price;
            }

            $booking = Booking::create([
                'user_id'      => auth()->id(),
                'schedule_id'  => $request->schedule_id,
                'seats_booked' => count($selectedSeats),
                'seats_selected' => $selectedSeats,
                'amount'       => $amount,
                'status'       => 'pending',
            ]);

            foreach ($request->input('passengers', []) as $passenger) {
                $booking->passengers()->create([
                    'name' => $passenger['name'],
                    'phone_number' => $passenger['phone_number'] ?? null,
                    'pickup_address' => $passenger['pickup_address'] ?? null,
                ]);
            }

            DB::commit();
            return redirect()->route('home.my-bookings')->with('success', 'Booking created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Booking store error: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
