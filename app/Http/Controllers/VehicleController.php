<?php

namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'active');
        $vehicles = match ($filter) {
            'trashed' => Vehicle::onlyTrashed()->with(['driver', 'route'])->get(),
            'all' => Vehicle::withTrashed()->with(['driver', 'route'])->get(),
            default => Vehicle::with(['driver', 'route'])->get(),
        };

        return Inertia::render('Vehicle/Index', [
            'vehicles' => $vehicles,
            'filter' => $filter,
            'drivers' => Driver::all(),
            'routes' => Route::all(),
        ]);
    }

    /**
     * Return vehicles as JSON for DataTable.
     */
    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $filter = $request->input('filter', 'active');

        $query = match ($filter) {
            'trashed' => Vehicle::onlyTrashed()->with(['driver', 'route']),
            'all' => Vehicle::withTrashed()->with(['driver', 'route']),
            default => Vehicle::with(['driver', 'route']),
        };

        $columns = [
            'id',
            'plate_number',
            'brand',
            'seat_capacity',
            'driver_id',
            'route_id',
            'created_at',
            'updated_at',
        ];

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('plate_number', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order') && isset($request->order[0]['column'])) {
            $query->orderBy($columns[$request->order[0]['column']], $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($vehicle) {
            return [
                'id'            => $vehicle->id,
                'plate_number'  => $vehicle->plate_number,
                'brand'         => $vehicle->brand,
                'seat_capacity' => $vehicle->seat_capacity,
                'driver'        => $vehicle->driver ? [
                    'id'   => $vehicle->driver->id,
                    'name' => $vehicle->driver->name,
                ] : null,
                'route'         => $vehicle->route ? [
                    'id'   => $vehicle->route->id,
                    'name' => $vehicle->route->name,
                ] : null,
                'trashed'       => method_exists($vehicle, 'trashed') ? $vehicle->trashed() : false,
                'created_at'    => $vehicle->created_at ? $vehicle->created_at->toDateTimeString() : null,
                'updated_at'    => $vehicle->updated_at ? $vehicle->updated_at->toDateTimeString() : null,
                'actions'       => '',
            ];
        });

        return response()->json($data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Vehicle/Form', [
            'drivers' => Driver::all(),
            'routes'  => Route::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $request->validate([
                'plate_number'  => 'required|unique:vehicles,plate_number',
                'brand'         => 'required|string|max:255',
                'seat_capacity' => 'required|integer|min:1',
                // Driver
                'driver_id'     => 'nullable|exists:drivers,id',
                'driver_name'   => 'nullable|string|max:255',
                'driver_phone'  => 'nullable|string|max:255',
                // Route
                'route_id'      => 'nullable|exists:routes,id',
                'route_name'    => 'nullable|string|max:255',
                'route_origin'  => 'nullable|string|max:255',
                'route_destination' => 'nullable|string|max:255',
                'route_duration'    => 'nullable|string|max:255',
            ]);

            // Handle Driver
            $driverId = $request->driver_id;
            if (!$driverId && $request->driver_name) {
                $driver = Driver::create([
                    'name'  => $request->driver_name,
                    'phone' => $request->driver_phone,
                ]);
                $driverId = $driver->id;
            }

            // Handle Route
            $routeId = $request->route_id;
            if (!$routeId && $request->route_name) {
                $route = Route::create([
                    'name'        => $request->route_name,
                    'origin'      => $request->route_origin,
                    'destination' => $request->route_destination,
                    'duration'    => $request->route_duration,
                ]);
                $routeId = $route->id;
            }

            Vehicle::create([
                'plate_number'  => $request->plate_number,
                'brand'         => $request->brand,
                'seat_capacity' => $request->seat_capacity,
                'driver_id'     => $driverId,
                'route_id'      => $routeId,
            ]);

            DB::commit();
            return redirect()->route('vehicles.index')->with('success', 'Vehicle, Driver, and Route created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $vehicle = Vehicle::withTrashed()->findOrFail($id);

        return Inertia::render('Vehicle/Form', [
            'vehicle' => $vehicle,
            'drivers' => Driver::all(),
            'routes'  => Route::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $vehicle = Vehicle::withTrashed()->findOrFail($id);

            $request->validate([
                'plate_number'  => 'required|string|max:255|unique:vehicles,plate_number,' . $vehicle->id,
                'brand'         => 'required|string|max:255',
                'seat_capacity' => 'required|integer|min:1',
                // Driver
                'driver_id'     => 'nullable|exists:drivers,id',
                'driver_name'   => 'nullable|string|max:255',
                'driver_phone'  => 'nullable|string|max:255',
                // Route
                'route_id'      => 'nullable|exists:routes,id',
                'route_name'    => 'nullable|string|max:255',
                'route_origin'  => 'nullable|string|max:255',
                'route_destination' => 'nullable|string|max:255',
                'route_duration'    => 'nullable|string|max:255',
            ]);

            // Handle Driver
            $driverId = $request->driver_id;
            if (!$driverId && $request->driver_name) {
                $driver = Driver::create([
                    'name'  => $request->driver_name,
                    'phone' => $request->driver_phone,
                ]);
                $driverId = $driver->id;
            }

            // Handle Route
            $routeId = $request->route_id;
            if (!$routeId && $request->route_name) {
                $route = Route::create([
                    'name'        => $request->route_name,
                    'origin'      => $request->route_origin,
                    'destination' => $request->route_destination,
                    'duration'    => $request->route_duration,
                ]);
                $routeId = $route->id;
            }

            $vehicle->update([
                'plate_number'  => $request->plate_number,
                'brand'         => $request->brand,
                'seat_capacity' => $request->seat_capacity,
                'driver_id'     => $driverId,
                'route_id'      => $routeId,
            ]);

            DB::commit();
            return redirect()->route('vehicles.index')->with('success', 'Vehicle, Driver, and Route updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $vehicle = Vehicle::withTrashed()->findOrFail($id);
        $vehicle->delete();
        return redirect()->route('vehicles.index')->with('success', 'Vehicle deleted successfully.');
    }

    /**
     * Restore the specified trashed resource.
     */
    public function restore($id)
    {
        Vehicle::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('vehicles.index')->with('success', 'Vehicle restored successfully.');
    }

    /**
     * Force delete the specified trashed resource.
     */
    public function forceDelete($id)
    {
        Vehicle::onlyTrashed()->where('id', $id)->forceDelete();
        return redirect()->route('vehicles.index')->with('success', 'Vehicle permanently deleted.');
    }
}
