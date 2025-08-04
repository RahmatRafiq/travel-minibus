<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Route;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RecapitulationController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['dateFrom', 'dateTo', 'status', 'route']);
        $dateFrom = $filters['dateFrom'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['dateTo'] ?? Carbon::now()->format('Y-m-d');
        $bookingsQuery = Booking::with(['user', 'schedule.routeVehicle.route', 'schedule.routeVehicle.vehicle.driver'])
            ->whereBetween('booking_time', [$dateFrom, $dateTo]);
        if (!empty($filters['status'])) {
            $bookingsQuery->where('status', $filters['status']);
        }
        if (!empty($filters['route'])) {
            $bookingsQuery->whereHas('schedule.routeVehicle.route', function ($query) use ($filters) {
                $query->where('id', $filters['route']);
            });
        }
        $bookings = $bookingsQuery->orderBy('booking_time', 'desc')->get();
        $stats = $this->calculateStats($dateFrom, $dateTo, $filters);
        $bookingTrend = $this->getBookingTrend($dateFrom, $dateTo);
        $rutePerforma = $this->getRutePerforma($dateFrom, $dateTo);
        $statusDistribution = $this->getStatusDistribution($dateFrom, $dateTo);
        $routes = Route::all();
        $vehicles = Vehicle::with('driver')->get();
        return Inertia::render('Recapitulation', [
            'stats' => $stats,
            'bookings' => $bookings,
            'routes' => $routes,
            'vehicles' => $vehicles,
            'bookingTrend' => $bookingTrend,
            'rutePerforma' => $rutePerforma,
            'statusDistribution' => $statusDistribution,
            'filters' => array_merge($filters, [
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
            ]),
        ]);
    }
    
    private function calculateStats(string $dateFrom, string $dateTo, array $filters): array
    {
        $today = Carbon::today();
        $totalBooking = Booking::count();
        $totalPendapatan = Booking::where('status', 'confirmed')->sum('amount');
        $totalUser = User::role('user')->count();
        $totalArmada = Vehicle::count();
        $totalRute = Route::count();
        $bookingHariIni = Booking::whereDate('booking_time', $today)->count();
        $pendapatanHariIni = Booking::whereDate('booking_time', $today)
            ->where('status', 'confirmed')
            ->sum('amount');
        $totalKapasitas = Vehicle::sum('seat_capacity');
        $totalBookedSeats = Booking::whereBetween('booking_time', [$dateFrom, $dateTo])
            ->where('status', 'confirmed')
            ->sum('seats_booked');
        $okupansiRate = $totalKapasitas > 0 ? round(($totalBookedSeats / $totalKapasitas) * 100, 2) : 0;
        return [
            'totalBooking' => $totalBooking,
            'totalPendapatan' => $totalPendapatan,
            'totalUser' => $totalUser,
            'totalArmada' => $totalArmada,
            'totalRute' => $totalRute,
            'bookingHariIni' => $bookingHariIni,
            'pendapatanHariIni' => $pendapatanHariIni,
            'okupansiRate' => $okupansiRate,
        ];
    }
    
    private function getBookingTrend(string $dateFrom, string $dateTo): array
    {
        $bookingData = Booking::selectRaw('DATE(booking_time) as date, COUNT(*) as count')
            ->whereBetween('booking_time', [$dateFrom, $dateTo])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        $labels = [];
        $data = [];
        $currentDate = Carbon::parse($dateFrom);
        $endDate = Carbon::parse($dateTo);
        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $labels[] = $currentDate->format('d M');
            $booking = $bookingData->firstWhere('date', $dateStr);
            $data[] = $booking ? $booking->count : 0;
            $currentDate->addDay();
        }
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Booking',
                    'data' => $data,
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                    'borderColor' => 'rgb(59, 130, 246)',
                    'tension' => 0.4,
                ]
            ]
        ];
    }
    
    private function getRutePerforma(string $dateFrom, string $dateTo): array
    {
        $ruteData = DB::table('bookings')
            ->join('schedules', 'bookings.schedule_id', '=', 'schedules.id')
            ->join('route_vehicle', 'schedules.route_vehicle_id', '=', 'route_vehicle.id')
            ->join('routes', 'route_vehicle.route_id', '=', 'routes.id')
            ->selectRaw('routes.name, COUNT(bookings.id) as booking_count')
            ->whereBetween('bookings.booking_time', [$dateFrom, $dateTo])
            ->groupBy('routes.id', 'routes.name')
            ->orderByDesc('booking_count')
            ->limit(10)
            ->get();
        $labels = $ruteData->pluck('name')->toArray();
        $data = $ruteData->pluck('booking_count')->toArray();
        $colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
        ];
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Booking',
                    'data' => $data,
                    'backgroundColor' => array_slice($colors, 0, count($data)),
                ]
            ]
        ];
    }
    
    private function getStatusDistribution(string $dateFrom, string $dateTo): array
    {
        $statusData = Booking::selectRaw('status, COUNT(*) as count')
            ->whereBetween('booking_time', [$dateFrom, $dateTo])
            ->groupBy('status')
            ->get();
        $labels = [];
        $data = [];
        $colors = [];
        $statusColors = [
            'pending' => '#F59E0B',
            'confirmed' => '#10B981',
            'cancelled' => '#EF4444',
        ];
        foreach ($statusData as $status) {
            $labels[] = ucfirst($status->status);
            $data[] = $status->count;
            $colors[] = $statusColors[$status->status] ?? '#6B7280';
        }
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'data' => $data,
                    'backgroundColor' => $colors,
                ]
            ]
        ];
    }
    
    public function export(Request $request)
    {
        $filters = $request->only(['dateFrom', 'dateTo', 'status', 'route']);
        $dateFrom = $filters['dateFrom'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $filters['dateTo'] ?? Carbon::now()->format('Y-m-d');
        $bookingsQuery = Booking::with(['user', 'schedule.routeVehicle.route', 'schedule.routeVehicle.vehicle.driver'])
            ->whereBetween('booking_time', [$dateFrom, $dateTo]);
        if (!empty($filters['status'])) {
            $bookingsQuery->where('status', $filters['status']);
        }
        if (!empty($filters['route'])) {
            $bookingsQuery->whereHas('schedule.routeVehicle.route', function ($query) use ($filters) {
                $query->where('id', $filters['route']);
            });
        }
        $bookings = $bookingsQuery->orderBy('booking_time', 'desc')->get();
        $filename = 'rekapitulasi_' . $dateFrom . '_to_' . $dateTo . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        $callback = function () use ($bookings) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'Reference',
                'User',
                'Email',
                'Booking Time',
                'Rute',
                'Vehicle',
                'Driver',
                'Seats Booked',
                'Amount',
                'Status'
            ]);
            foreach ($bookings as $booking) {
                fputcsv($file, [
                    $booking->reference,
                    $booking->user->name ?? '',
                    $booking->user->email ?? '',
                    $booking->booking_time,
                    $booking->schedule->routeVehicle->route->name ?? '',
                    $booking->schedule->routeVehicle->vehicle->plate_number ?? '',
                    $booking->schedule->routeVehicle->vehicle->driver->name ?? '',
                    $booking->seats_booked,
                    $booking->amount,
                    $booking->status,
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }
}

