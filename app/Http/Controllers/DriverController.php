<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\Request;
use App\Helpers\DataTable;
use Inertia\Inertia;

class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Driver/Index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Driver $driver)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Driver $driver)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Driver $driver)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Driver $driver)
    {
        //
    }

    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $query = Driver::query();

        $columns = ['id', 'name', 'phone', 'created_at', 'updated_at'];

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
        }

        if ($request->filled('order') && isset($request->order[0]['column'])) {
            $query->orderBy($columns[$request->order[0]['column']], $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($driver) {
            return [
                'id'         => $driver->id,
                'name'       => $driver->name,
                'phone'      => $driver->phone,
                'created_at' => $driver->created_at ? $driver->created_at->toDateTimeString() : null,
                'updated_at' => $driver->updated_at ? $driver->updated_at->toDateTimeString() : null,
            ];
        });

        return response()->json($data);
    }
}
