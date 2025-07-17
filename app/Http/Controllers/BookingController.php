<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Schedule;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi input
        $data = $request->validate([
            'route_id'  => ['required', 'exists:routes,id'],
            'direction' => ['sometimes', 'in:outbound,return'],
        ]);

        $userId    = Auth::id();
        $routeId   = $data['route_id'];
        // ubah direction ke enum is_return
        $isReturn  = ($data['direction'] ?? 'outbound') === 'return' ? 'yes' : 'no';

        // 2. Core booking logic dalam transaction & lockForUpdate
        $booking = DB::transaction(function () use ($routeId, $isReturn, $userId) {

            // ambil semua vehicle di route
            $vehicleIds = Vehicle::where('route_id', $routeId)->pluck('id');

            // query all eligible schedules
            $schedule = Schedule::whereIn('vehicle_id', $vehicleIds)
                ->where('route_id', $routeId)
                ->where('is_return', $isReturn)
                ->where('status', 'open')
                ->where('departure_time', '>', now())
                ->with('vehicle')               // agar seat_capacity bisa dipakai
                ->withCount('bookings')         // hitung pemesanan
                ->orderBy('departure_time')
                ->lockForUpdate()
                ->get()
                ->first(fn($s) => $s->bookings_count < $s->vehicle->seat_capacity);

            if (! $schedule) {
                abort(422, 'Maaf, tidak ada jadwal tersedia untuk rute ini.');
            }

            // buat booking
            $booking = Booking::create([
                'user_id'      => $userId,
                'schedule_id'  => $schedule->id,
                'booking_time' => now(),
                'status'       => 'pending',
            ]);

            // jika penuh setelah ini, tutup schedule
            if ($schedule->bookings_count + 1 >= $schedule->vehicle->seat_capacity) {
                $schedule->update(['status' => 'closed']);
            }

            return $booking;
        });

        // 3. Load relations & computed attributes
        $booking->load('schedule.vehicle.route');
        $schedule = $booking->schedule;

        return response()->json([
            'message'  => 'Booking berhasil!',
            'booking'  => $booking,
            'schedule' => [
                'id'             => $schedule->id,
                'departure_time' => $schedule->departure_time->toDateTimeString(),
                'origin'         => $schedule->origin,       // computed
                'destination'    => $schedule->destination,  // computed
                'is_return'      => $schedule->is_return,
            ],
            'vehicle'  => [
                'id'            => $schedule->vehicle->id,
                'plate_number'  => $schedule->vehicle->plate_number,
                'brand'         => $schedule->vehicle->brand,
                'seat_capacity' => $schedule->vehicle->seat_capacity,
            ],
        ], 201);
    }
}
