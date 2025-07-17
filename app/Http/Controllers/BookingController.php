<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Route;
use App\Models\Vehicle;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
        ]);

        $userId = Auth::id();

        // Ambil semua kendaraan di rute tersebut
        $vehicles = Vehicle::where('route_id', $validated['route_id'])->pluck('id');

        if ($vehicles->isEmpty()) {
            return response()->json(['error' => 'Tidak ada kendaraan pada rute ini.'], 422);
        }

        $booking = null;
        $chosenSchedule = null;
        $chosenVehicle = null;

        DB::beginTransaction();
        try {
            // Cari schedule yang tersedia
            $schedule = Schedule::whereIn('vehicle_id', $vehicles)
                ->where('departure_time', '>', Carbon::now())
                ->where('status', 'open')
                ->with('vehicle')
                ->withCount('bookings')
                ->orderBy('departure_time', 'asc')
                ->lockForUpdate()
                ->get()
                ->filter(function ($sch) {
                    return $sch->bookings_count < $sch->vehicle->seat_capacity;
                })
                ->first();

            if (!$schedule) {
                DB::rollBack();
                return response()->json(['error' => 'Tidak ada jadwal tersedia.'], 422);
            }

            $booking = Booking::create([
                'user_id'     => $userId,
                'schedule_id' => $schedule->id,
                'booking_time'=> now(),
                'status'      => 'pending',
            ]);

            DB::commit();

            $chosenSchedule = $schedule;
            $chosenVehicle = $schedule->vehicle;

            return response()->json([
                'success'  => true,
                'booking'  => $booking,
                'schedule' => $chosenSchedule,
                'vehicle'  => $chosenVehicle,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Terjadi kesalahan saat booking.'], 500);
        }
    }
}
