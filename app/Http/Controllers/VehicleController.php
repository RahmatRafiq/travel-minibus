<?php

namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VehicleController extends Controller
{
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
                    'phone'=> $vehicle->driver->phone ?? '',
                ] : null,
                'route'         => $vehicle->route ? [
                    'id'         => $vehicle->route->id,
                    'name'       => $vehicle->route->name,
                    'origin'     => $vehicle->route->origin ?? '',
                    'destination'=> $vehicle->route->destination ?? '',
                    'duration'   => $vehicle->route->duration ?? '',
                ] : null,
                'trashed'       => method_exists($vehicle, 'trashed') ? $vehicle->trashed() : false,
                'created_at'    => $vehicle->created_at ? $vehicle->created_at->toDateTimeString() : null,
                'updated_at'    => $vehicle->updated_at ? $vehicle->updated_at->toDateTimeString() : null,
                'actions'       => '',
            ];
        });

        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('Vehicle/Form', [
            'drivers' => Driver::all(),
            'routes'  => Route::all(),
        ]);
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $request->validate([
                'plate_number'  => 'required|unique:vehicles,plate_number',
                'brand'         => 'required|string|max:255',
                'seat_capacity' => 'required|integer|min:1',
                'driver_id'     => 'nullable|exists:drivers,id',
                'driver_name'   => 'nullable|string|max:255',
                'driver_phone'  => 'nullable|string|max:255',
                'route_ids'     => 'required|array|min:1',
                'route_ids.*'   => 'exists:routes,id',
            ]);

            $driverId = $request->driver_id;
            if (!$driverId && $request->driver_name) {
                $driver = Driver::create([
                    'name'  => $request->driver_name,
                    'phone' => $request->driver_phone,
                ]);
                $driverId = $driver->id;
            }

            $vehicle = Vehicle::create([
                'plate_number'  => $request->plate_number,
                'brand'         => $request->brand,
                'seat_capacity' => $request->seat_capacity,
                'driver_id'     => $driverId,
            ]);

            $vehicle->routes()->sync($request->route_ids);


            DB::commit();
            return redirect()->route('vehicles.index')->with('success', 'Vehicle created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Vehicle store error: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        $vehicle = Vehicle::with(['driver', 'routes'])->withTrashed()->findOrFail($id);

        return Inertia::render('Vehicle/Form', [
            'vehicle' => $vehicle,
            'drivers' => Driver::all(),
            'routes'  => Route::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $vehicle = Vehicle::withTrashed()->findOrFail($id);

            $request->validate([
                'plate_number'  => 'required|string|max:255|unique:vehicles,plate_number,' . $vehicle->id,
                'brand'         => 'required|string|max:255',
                'seat_capacity' => 'required|integer|min:1',
                'driver_id'     => 'nullable|exists:drivers,id',
                'driver_name'   => 'nullable|string|max:255',
                'driver_phone'  => 'nullable|string|max:255',
                'route_ids'     => 'required|array|min:1',
                'route_ids.*'   => 'exists:routes,id',
            ]);

            $driverId = $request->driver_id;
            if ($driverId && ($request->driver_name || $request->driver_phone)) {
                $driver = Driver::find($driverId);
                if ($driver) {
                    $driver->update([
                        'name'  => $request->driver_name ?? $driver->name,
                        'phone' => $request->driver_phone ?? $driver->phone,
                    ]);
                }
            } elseif (!$driverId && $request->driver_name) {
                $driver = Driver::create([
                    'name'  => $request->driver_name,
                    'phone' => $request->driver_phone,
                ]);
                $driverId = $driver->id;
            }

            $vehicle->update([
                'plate_number'  => $request->plate_number,
                'brand'         => $request->brand,
                'seat_capacity' => $request->seat_capacity,
                'driver_id'     => $driverId,
            ]);

            // Update relasi pivot
            $vehicle->routes()->sync($request->route_ids);

            // (Opsional) Sinkronisasi jadwal jika perlu

            DB::commit();
            return redirect()->route('vehicles.index')->with('success', 'Vehicle updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Vehicle update error: ' . $e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::withTrashed()->findOrFail($id);
        $vehicle->delete();
        return redirect()->route('vehicles.index')->with('success', 'Vehicle deleted successfully.');
    }

    public function restore($id)
    {
        Vehicle::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('vehicles.index')->with('success', 'Vehicle restored successfully.');
    }

    public function forceDelete($id)
    {
        Vehicle::onlyTrashed()->where('id', $id)->forceDelete();
        return redirect()->route('vehicles.index')->with('success', 'Vehicle permanently deleted.');
    }
}
