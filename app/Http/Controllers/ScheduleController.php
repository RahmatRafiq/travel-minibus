<?php

namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Models\Schedule;
use App\Models\RouteVehicle;
use App\Models\Route;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'active');
        $schedules = match ($filter) {
            'trashed' => Schedule::onlyTrashed()->with(['routeVehicle.route', 'routeVehicle.vehicle'])->get(),
            'all' => Schedule::withTrashed()->with(['routeVehicle.route', 'routeVehicle.vehicle'])->get(),
            default => Schedule::with(['routeVehicle.route', 'routeVehicle.vehicle'])->get(),
        };

        return Inertia::render('Schedule/Index', [
            'schedules' => $schedules,
            'filter' => $filter,
            'routes' => Route::all(),
            'vehicles' => Vehicle::all(),
        ]);
    }

    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $filter = $request->input('filter', 'active');

        $query = match ($filter) {
            'trashed' => Schedule::onlyTrashed()->with(['routeVehicle.route', 'routeVehicle.vehicle']),
            'all' => Schedule::withTrashed()->with(['routeVehicle.route', 'routeVehicle.vehicle']),
            default => Schedule::with(['routeVehicle.route', 'routeVehicle.vehicle']),
        };

        $columns = [
            'id',
            'route_vehicle_id',
            'departure_time',
            'status',
            'created_at',
            'updated_at',
        ];

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('status', 'like', "%{$search}%")
                  ->orWhere('departure_time', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order') && isset($request->order[0]['column'])) {
            $query->orderBy($columns[$request->order[0]['column']], $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($schedule) {
            return [
                'id' => $schedule->id,
                'route_vehicle' => $schedule->routeVehicle ? [
                    'id' => $schedule->routeVehicle->id,
                    'route' => $schedule->routeVehicle->route ? [
                        'id' => $schedule->routeVehicle->route->id,
                        'name' => $schedule->routeVehicle->route->name,
                    ] : null,
                    'vehicle' => $schedule->routeVehicle->vehicle ? [
                        'id' => $schedule->routeVehicle->vehicle->id,
                        'plate_number' => $schedule->routeVehicle->vehicle->plate_number,
                    ] : null,
                ] : null,
                'departure_time' => $schedule->departure_time,
                'status' => $schedule->status,
                'trashed' => method_exists($schedule, 'trashed') ? $schedule->trashed() : false,
                'created_at' => $schedule->created_at ? $schedule->created_at->toDateTimeString() : null,
                'updated_at' => $schedule->updated_at ? $schedule->updated_at->toDateTimeString() : null,
                'actions' => '',
            ];
        });

        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('Schedule/Form', [
            'routes' => Route::all(),
            'vehicles' => Vehicle::all(),
        ]);
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            if ($request->has('entries')) {
                $entries = $request->input('entries');
                if (!is_array($entries) || count($entries) === 0) {
                    return back()->withErrors(['entries' => 'At least one schedule entry is required.']);
                }
                foreach ($entries as $i => $entry) {
                    $validator = \Validator::make($entry, [
                        'route_id' => 'required|exists:routes,id',
                        'vehicle_id' => 'required|exists:vehicles,id',
                        'departure_time' => 'required|date',
                        'status' => 'required|string|max:255',
                    ]);
                    if ($validator->fails()) {
                        return back()->withErrors(['entries' => "Entry #" . ($i+1) . ": " . implode(', ', $validator->errors()->all())]);
                    }

                    $routeVehicle = RouteVehicle::firstOrCreate([
                        'route_id' => $entry['route_id'],
                        'vehicle_id' => $entry['vehicle_id'],
                    ]);

                    Schedule::create([
                        'route_vehicle_id' => $routeVehicle->id,
                        'departure_time' => $entry['departure_time'],
                        'status' => $entry['status'],
                    ]);
                }
            } else {
                $request->validate([
                    'route_id' => 'required|exists:routes,id',
                    'vehicle_id' => 'required|exists:vehicles,id',
                    'departure_time' => 'required|date',
                    'status' => 'required|string|max:255',
                ]);

                $routeVehicle = RouteVehicle::firstOrCreate([
                    'route_id' => $request->route_id,
                    'vehicle_id' => $request->vehicle_id,
                ]);

                Schedule::create([
                    'route_vehicle_id' => $routeVehicle->id,
                    'departure_time' => $request->departure_time,
                    'status' => $request->status,
                ]);
            }

            DB::commit();
            return redirect()->route('schedules.index')->with('success', 'Schedule(s) created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Schedule store error: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        $schedule = Schedule::with(['routeVehicle.route', 'routeVehicle.vehicle'])->withTrashed()->findOrFail($id);

        return Inertia::render('Schedule/Form', [
            'schedule' => $schedule,
            'routes' => Route::all(),
            'vehicles' => Vehicle::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $schedule = Schedule::withTrashed()->findOrFail($id);

            $request->validate([
                'route_id' => 'required|exists:routes,id',
                'vehicle_id' => 'required|exists:vehicles,id',
                'departure_time' => 'required|date',
                'status' => 'required|string|max:255',
            ]);

            $routeVehicle = RouteVehicle::firstOrCreate([
                'route_id' => $request->route_id,
                'vehicle_id' => $request->vehicle_id,
            ]);

            $schedule->update([
                'route_vehicle_id' => $routeVehicle->id,
                'departure_time' => $request->departure_time,
                'status' => $request->status,
            ]);

            DB::commit();
            return redirect()->route('schedules.index')->with('success', 'Schedule updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Schedule update error: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $schedule = Schedule::withTrashed()->findOrFail($id);
        $schedule->delete();
        return redirect()->route('schedules.index')->with('success', 'Schedule deleted successfully.');
    }

    public function restore($id)
    {
        Schedule::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('schedules.index')->with('success', 'Schedule restored successfully.');
    }

    public function forceDelete($id)
    {
        Schedule::onlyTrashed()->where('id', $id)->forceDelete();
        return redirect()->route('schedules.index')->with('success', 'Schedule permanently deleted.');
    }
}

