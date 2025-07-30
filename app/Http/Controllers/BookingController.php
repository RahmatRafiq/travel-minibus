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
                'user',
                'passengers',
                'schedule.routeVehicle.vehicle',
                'schedule.routeVehicle.route'
            ]),
            'all' => Booking::withTrashed()->with([
                'user',
                'passengers',
                'schedule.routeVehicle.vehicle',
                'schedule.routeVehicle.route'
            ]),
            default => Booking::with([
                'user',
                'passengers',
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
            'reference',
            'user_id',
            'schedule_id',
            'booking_time',
            'seats_booked',
            'status',
            'created_at',
        ];

        if ($request->filled('order') && isset($request->order[0]['column'])) {
            $query->orderBy($columns[$request->order[0]['column']], $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($booking) {
            return [
                'id' => $booking->id,
                'reference' => $booking->reference,
                'user' => $booking->user ? [
                    'id' => $booking->user->id,
                    'name' => $booking->user->name,
                ] : null,
                'passengers' => $booking->passengers ? $booking->passengers->map(function($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'phone_number' => $p->phone_number,
                        'pickup_address' => $p->pickup_address,
                        'pickup_latitude' => $p->pickup_latitude,
                        'pickup_longitude' => $p->pickup_longitude,
                    ];
                }) : [],
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

        return Inertia::render('Bookings/Create', [
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
            return redirect()->route('bookings.index')->with('success', 'Booking created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Booking store error: ' . $e->getMessage(), ['exception' => $e]);
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

