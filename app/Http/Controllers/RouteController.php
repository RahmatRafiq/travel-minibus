<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\Request;
use App\Helpers\DataTable;
use Inertia\Inertia;

class RouteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Route/Index');
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
    public function show(Route $route)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Route $route)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Route $route)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Route $route)
    {
        //
    }

    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $query = Route::query();

        $columns = ['id', 'name', 'origin', 'destination', 'duration', 'created_at', 'updated_at'];

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('origin', 'like', "%{$search}%")
                  ->orWhere('destination', 'like', "%{$search}%");
        }

        if ($request->filled('order') && isset($request->order[0]['column'])) {
            $query->orderBy($columns[$request->order[0]['column']], $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($route) {
            return [
                'id'          => $route->id,
                'name'        => $route->name,
                'origin'      => $route->origin,
                'destination' => $route->destination,
                'duration'    => $route->duration,
                'created_at'  => $route->created_at ? $route->created_at->toDateTimeString() : null,
                'updated_at'  => $route->updated_at ? $route->updated_at->toDateTimeString() : null,
            ];
        });

        return response()->json($data);
    }
}
