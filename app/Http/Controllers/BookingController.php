<?php

namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Models\Route;
use App\Models\RouteVehicle;
use App\Models\Schedule;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $allOrigins = Route::query()->distinct()->pluck('origin')->filter()->values()->all();
        $allDestinations = Route::query()->distinct()->pluck('destination')->filter()->values()->all();

        $routes = [];
        $schedules = [];
        $timezone = config('app.timezone', 'UTC');

        if ($request->filled(['origin', 'destination'])) {
            $routes = Route::where('origin', $request->origin)
                ->where('destination', $request->destination)
                ->get();

            if ($routes->count() === 1 && !$request->filled('route_id')) {
                return redirect()->route('bookings.index', array_merge(
                    $request->all(),
                    ['route_id' => $routes->first()->id]
                ));
            }
        }

        if ($request->filled('route_id')) {
            $timezone = config('app.timezone', 'UTC');
            $routeVehicles = RouteVehicle::with(['vehicle', 'schedules' => function ($q) use ($request, $timezone) {
                $q->where('status', 'ready');
                if ($request->filled('departure_date')) {
                    $q->whereDate('departure_time', $request->departure_date);
                } else {
                    $q->where('departure_time', '>', now($timezone));
                }
            }])->where('route_id', $request->route_id)->get();

            foreach ($routeVehicles as $rv) {
                foreach ($rv->schedules as $schedule) {
                    $vehicle = $rv->vehicle;
                    $booked = Booking::where('schedule_id', $schedule->id)
                        ->whereIn('status', ['pending', 'confirmed'])
                        ->sum('seats_booked');
                    $available_seats = $vehicle->seat_capacity - $booked;

                    $schedules[] = [
                        'id' => $schedule->id,
                        'departure_time' => $schedule->departure_time,
                        'available_seats' => max(0, $available_seats),
                        'vehicle' => [
                            'id' => $vehicle->id,
                            'plate_number' => $vehicle->plate_number,
                            'brand' => $vehicle->brand,
                        ],
                    ];
                }
            }
        }

        return Inertia::render('Bookings/Index', [
            'origin' => $request->origin,
            'destination' => $request->destination,
            'route_id' => $request->route_id,
            'routes' => $routes,
            'schedules' => $schedules,
            'allOrigins' => $allOrigins,
            'allDestinations' => $allDestinations,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);
        $booking = Booking::withTrashed()->findOrFail($id);
        $booking->status = $request->status;
        $booking->save();
        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'status' => $booking->status]);
        }
        return redirect()->route('bookings.index')->with('success', 'Status booking berhasil diupdate.');
    }

    public function updateStatusBulk(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);
        Booking::whereIn('id', $request->ids)->update(['status' => $request->status]);
        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }
        return redirect()->route('bookings.index')->with('success', 'Status booking berhasil diupdate (bulk).');
    }

    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $filter = $request->input('filter', 'active');

        $query = match ($filter) {
            'trashed' => Booking::onlyTrashed()->with([
                'user.profile',
                'schedule.routeVehicle.vehicle',
                'schedule.routeVehicle.route'
            ]),
            'all' => Booking::withTrashed()->with([
                'user.profile',
                'schedule.routeVehicle.vehicle',
                'schedule.routeVehicle.route'
            ]),
            default => Booking::with([
                'user.profile',
                'schedule.routeVehicle.vehicle',
                'schedule.routeVehicle.route'
            ]),
        };

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('schedule.routeVehicle.vehicle', fn($v) => $v->where('plate_number', 'like', "%{$search}%"));
            });
        }

        $columns = [
            'id',
            'user_id',
            'schedule_id',
            'booking_time',
            'seats_booked',
            'status',
            'created_at',
            'updated_at',
        ];

        if ($request->filled('order') && isset($request->order[0]['column'])) {
            $query->orderBy($columns[$request->order[0]['column']], $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($booking) {
            return [
                'id' => $booking->id,
                'user' => $booking->user ? [
                    'id' => $booking->user->id,
                    'name' => $booking->user->name,
                    'profile' => $booking->user->profile ? [
                        'phone_number' => $booking->user->profile->phone_number,
                        'pickup_address' => $booking->user->profile->pickup_address,
                        'address' => $booking->user->profile->address,
                    ] : null,
                ] : null,
                'schedule' => $booking->schedule ? [
                    'id' => $booking->schedule->id,
                    'departure_time' => $booking->schedule->departure_time,
                    'vehicle' => $booking->schedule->routeVehicle && $booking->schedule->routeVehicle->vehicle
                        ? [
                            'id' => $booking->schedule->routeVehicle->vehicle->id,
                            'plate_number' => $booking->schedule->routeVehicle->vehicle->plate_number,
                            'brand' => $booking->schedule->routeVehicle->vehicle->brand,
                        ] : null,
                    'route' => $booking->schedule->routeVehicle && $booking->schedule->routeVehicle->route
                        ? [
                            'id' => $booking->schedule->routeVehicle->route->id,
                            'name' => $booking->schedule->routeVehicle->route->name,
                            'origin' => $booking->schedule->routeVehicle->route->origin,
                            'destination' => $booking->schedule->routeVehicle->route->destination,
                        ] : null,
                ] : null,
                'booking_time' => $booking->booking_time,
                'seats_booked' => $booking->seats_booked,
                'status' => $booking->status,
                'trashed' => method_exists($booking, 'trashed') ? $booking->trashed() : false,
                'created_at' => $booking->created_at ? $booking->created_at->toDateTimeString() : null,
                'updated_at' => $booking->updated_at ? $booking->updated_at->toDateTimeString() : null,
            ];
        });

        return response()->json($data);
    }

    public function create(Request $request)
    {
        $allOrigins = Route::query()->distinct()->pluck('origin')->filter()->values()->all();
        $allDestinations = Route::query()->distinct()->pluck('destination')->filter()->values()->all();

        $routes = [];
        $schedules = [];
        $timezone = config('app.timezone', 'UTC');

        if ($request->filled(['origin', 'destination'])) {
            $routes = Route::where('origin', $request->origin)
                ->where('destination', $request->destination)
                ->get();

            if ($routes->count() === 1 && !$request->filled('route_id')) {
                return redirect()->route('bookings.create', array_merge(
                    $request->all(),
                    ['route_id' => $routes->first()->id]
                ));
            }
        }

        if ($request->filled('route_id') && $request->filled('departure_date')) {
            $timezone = config('app.timezone', 'UTC');
            $routeVehicles = RouteVehicle::with(['vehicle', 'schedules' => function ($q) use ($request, $timezone) {
                $q->where('status', 'ready')
                  ->whereDate('departure_time', $request->departure_date);
            }])->where('route_id', $request->route_id)->get();

            foreach ($routeVehicles as $rv) {
                foreach ($rv->schedules as $schedule) {
                    $vehicle = $rv->vehicle;
                    $booked = Booking::where('schedule_id', $schedule->id)
                        ->whereIn('status', ['pending', 'confirmed'])
                        ->sum('seats_booked');
                    $available_seats = $vehicle->seat_capacity - $booked;

                    $bookedSeats = Booking::where('schedule_id', $schedule->id)
                        ->whereIn('status', ['pending', 'confirmed'])
                        ->pluck('seats_selected')
                        ->flatten()
                        ->toArray();

                    $schedules[] = [
                        'id' => $schedule->id,
                        'departure_time' => $schedule->departure_time,
                        'available_seats' => max(0, $available_seats),
                        'vehicle' => [
                            'id' => $vehicle->id,
                            'plate_number' => $vehicle->plate_number,
                            'brand' => $vehicle->brand,
                            'seat_capacity' => $vehicle->seat_capacity,
                        ],
                        'reservedSeats' => array_values(array_unique($bookedSeats)),
                    ];
                }
            }
        }

        return Inertia::render('Bookings/Form', [
            'origin' => $request->origin,
            'destination' => $request->destination,
            'route_id' => $request->route_id,
            'routes' => $routes,
            'schedules' => $schedules,
            'allOrigins' => $allOrigins,
            'allDestinations' => $allDestinations,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('BookingController@store seats_selected', [
            'seats_selected' => $request->input('seats_selected'),
            'schedule_id' => $request->input('schedule_id'),
            'all' => $request->all(),
        ]);
        DB::beginTransaction();
        try {
            $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'seats_selected' => 'required|array|min:1',
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

            Booking::create([
                'user_id'      => auth()->id(),
                'schedule_id'  => $request->schedule_id,
                'seats_booked' => count($selectedSeats),
                'seats_selected' => $selectedSeats,
                'amount'       => $amount,
                'status'       => 'pending',
            ]);

            DB::commit();
            return redirect()->route('bookings.index')->with('success', 'Booking created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Booking store error: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        $booking = Booking::with([
            'schedule.routeVehicle.vehicle',
            'schedule.routeVehicle.route'
        ])->withTrashed()->findOrFail($id);

        $schedules = Schedule::with([
            'routeVehicle.vehicle',
            'routeVehicle.route'
        ])->where('status', 'ready')->get();

        $scheduleIds = $schedules->pluck('id')->all();

        $bookedSeats = Booking::whereIn('schedule_id', $scheduleIds)
            ->whereIn('status', ['pending', 'confirmed'])
            ->select('schedule_id', DB::raw('SUM(seats_booked) as total_booked'))
            ->groupBy('schedule_id')
            ->pluck('total_booked', 'schedule_id');

        $schedules = $schedules->filter(function ($schedule) use ($bookedSeats) {
            $vehicle = $schedule->routeVehicle->vehicle;
            $booked = $bookedSeats[$schedule->id] ?? 0;
            return $vehicle && ($vehicle->seat_capacity - $booked) > 0;
        })->map(function ($schedule) use ($bookedSeats) {
            $vehicle = $schedule->routeVehicle->vehicle;
            $route = $schedule->routeVehicle->route;
            $booked = $bookedSeats[$schedule->id] ?? 0;
            return [
                'id' => $schedule->id,
                'departure_time' => $schedule->departure_time,
                'available_seats' => max(0, $vehicle->seat_capacity - $booked),
                'vehicle' => [
                    'id' => $vehicle->id,
                    'plate_number' => $vehicle->plate_number,
                    'brand' => $vehicle->brand,
                ],
                'route' => $route ? [
                    'id' => $route->id,
                    'name' => $route->name,
                    'origin' => $route->origin,
                    'destination' => $route->destination,
                ] : null,
            ];
        })->values();

        $currentSchedule = $booking->schedule;
        $origin = $currentSchedule && $currentSchedule->routeVehicle && $currentSchedule->routeVehicle->route
            ? $currentSchedule->routeVehicle->route->origin
            : null;
        $destination = $currentSchedule && $currentSchedule->routeVehicle && $currentSchedule->routeVehicle->route
            ? $currentSchedule->routeVehicle->route->destination
            : null;
        $departure_date = $currentSchedule
            ? \Illuminate\Support\Str::substr($currentSchedule->departure_time, 0, 10)
            : null;

        return Inertia::render('Bookings/Form', [
            'booking' => [
                'id' => $booking->id,
                'schedule_id' => $booking->schedule_id,
                'seats_booked' => $booking->seats_booked,
                'status' => $booking->status,
            ],
            'schedules' => $schedules,
            'origin' => $origin,
            'destination' => $destination,
            'departure_date' => $departure_date,
        ]);
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $booking = Booking::withTrashed()->findOrFail($id);

            $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'seats_selected' => 'required|array|min:1',
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

            $booking->update([
                'schedule_id'  => $request->schedule_id,
                'seats_booked' => count($selectedSeats),
                'seats_selected' => $selectedSeats,
                'amount'       => $amount,
            ]);

            DB::commit();
            return redirect()->route('bookings.index')->with('success', 'Booking updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Booking update error: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $booking = Booking::withTrashed()->findOrFail($id);
        $booking->delete();
        return redirect()->route('bookings.index')->with('success', 'Booking deleted successfully.');
    }

    public function restore($id)
    {
        Booking::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('bookings.index')->with('success', 'Booking restored successfully.');
    }

    public function forceDelete($id)
    {
        Booking::onlyTrashed()->where('id', $id)->forceDelete();
        return redirect()->route('bookings.index')->with('success', 'Booking permanently deleted.');
    }
}

