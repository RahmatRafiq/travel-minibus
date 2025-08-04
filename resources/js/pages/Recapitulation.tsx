import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaDownload, 
  FaSearch, 
  FaFilter,
  FaChartBar,
  FaUsers,
  FaCar,
  FaRoute,
  FaMoneyBillWave 
} from 'react-icons/fa';
import { MdDateRange, MdTrendingUp, MdEventSeat } from 'react-icons/md';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import AppLayout from '@/layouts/app-layout';
import { Vehicle } from '@/types/Vehicle';
import { Booking } from '@/types/Booking';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);


type RekapitulasiStats = {
  totalBooking: number;
  totalPendapatan: number;
  totalUser: number;
  totalArmada: number;
  totalRute: number;
  bookingHariIni: number;
  pendapatanHariIni: number;
  okupansiRate: number;
};

type BookingTrend = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    tension: number;
  }>;
};

type RutePerforma = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
  }>;
};

type StatusDistribution = {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
  }>;
};

type RekapitulasiPageProps = {
  stats: RekapitulasiStats;
  bookings: Booking[];
  routes: Route[];
  vehicles: Vehicle[];
  bookingTrend: BookingTrend;
  rutePerforma: RutePerforma;
  statusDistribution: StatusDistribution;
  filters: {
    dateFrom: string;
    dateTo: string;
    status: string;
    route: string;
  };
};

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Rekapitulasi', href: '/rekapitulasi' },
];

export default function Rekapitulasi() {
  const { stats, bookings, routes, vehicles, bookingTrend, rutePerforma, statusDistribution, filters } = usePage<RekapitulasiPageProps>().props;
  
  const [filterState, setFilterState] = useState({
    dateFrom: filters.dateFrom || '',
    dateTo: filters.dateTo || '',
    status: filters.status || '',
    route: filters.route || '',
  });

  const handleFilter = () => {
    router.get('/dashboard/rekapitulasi', filterState, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleExport = () => {
    router.get('/dashboard/rekapitulasi/export', filterState);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rekapitulasi" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col gap-6 p-3 sm:p-6">
          
          {/* Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rekapitulasi Travel
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Analisis lengkap performa bisnis travel Anda
                </p>
              </div>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium"
              >
                <FaDownload className="w-4 h-4" />
                Export Laporan
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <FaFilter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filter Data</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dari Tanggal
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filterState.dateFrom}
                    onChange={(e) => setFilterState(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sampai Tanggal
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filterState.dateTo}
                    onChange={(e) => setFilterState(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filterState.status}
                  onChange={(e) => setFilterState(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rute
                </label>
                <select
                  value={filterState.route}
                  onChange={(e) => setFilterState(prev => ({ ...prev, route: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Semua Rute</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleFilter}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  <FaSearch className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total Booking', value: stats.totalBooking, icon: <FaUsers className="w-6 h-6" />, gradient: 'from-blue-400 to-cyan-600' },
              { label: 'Total Pendapatan', value: formatCurrency(stats.totalPendapatan), icon: <FaMoneyBillWave className="w-6 h-6" />, gradient: 'from-green-400 to-emerald-600' },
              { label: 'Total User', value: stats.totalUser, icon: <FaUsers className="w-6 h-6" />, gradient: 'from-purple-400 to-violet-600' },
              { label: 'Total Armada', value: stats.totalArmada, icon: <FaCar className="w-6 h-6" />, gradient: 'from-yellow-400 to-orange-600' },
              { label: 'Total Rute', value: stats.totalRute, icon: <FaRoute className="w-6 h-6" />, gradient: 'from-pink-400 to-rose-600' },
              { label: 'Booking Hari Ini', value: stats.bookingHariIni, icon: <MdEventSeat className="w-6 h-6" />, gradient: 'from-indigo-400 to-purple-600' },
              { label: 'Pendapatan Hari Ini', value: formatCurrency(stats.pendapatanHariIni), icon: <FaMoneyBillWave className="w-6 h-6" />, gradient: 'from-teal-400 to-cyan-600' },
              { label: 'Okupansi Rate', value: `${stats.okupansiRate}%`, icon: <MdTrendingUp className="w-6 h-6" />, gradient: 'from-red-400 to-pink-600' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer`}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="p-2 bg-white/20 rounded-full mb-2 group-hover:rotate-12 transition-transform duration-300 text-white">
                    {stat.icon}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/80 font-medium uppercase tracking-wider text-center">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Trend */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <FaChartBar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Trend Booking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Perkembangan booking mingguan</p>
                </div>
              </div>
              <div className="h-80">
                <Line
                  data={bookingTrend}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                      }
                    },
                    scales: {
                      x: { 
                        grid: { display: false },
                        ticks: { color: '#6b7280', font: { weight: 'bold' } }
                      },
                      y: { 
                        grid: { color: 'rgba(107, 114, 128, 0.1)' },
                        ticks: { color: '#6b7280', font: { weight: 'bold' } }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <MdEventSeat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Distribusi Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Persentase status booking</p>
                </div>
              </div>
              <div className="h-80 flex items-center justify-center">
                <Doughnut
                  data={statusDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'bottom',
                        labels: { padding: 20, usePointStyle: true }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Route Performance */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg">
                <FaRoute className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Performa Rute</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Jumlah booking per rute</p>
              </div>
            </div>
            <div className="h-80">
              <Bar
                data={rutePerforma}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      cornerRadius: 8,
                    }
                  },
                  scales: {
                    x: { 
                      grid: { display: false },
                      ticks: { color: '#6b7280', font: { weight: 'bold' } }
                    },
                    y: { 
                      grid: { color: 'rgba(107, 114, 128, 0.1)' },
                      ticks: { color: '#6b7280', font: { weight: 'bold' } }
                    }
                  },
                  elements: {
                    bar: { borderRadius: 8, borderWidth: 0 }
                  }
                }}
              />
            </div>
          </div>

          {/* Booking Table */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <FaUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detail Booking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Daftar booking berdasarkan filter</p>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kursi</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FaUsers className="w-12 h-12 text-gray-300" />
                            <p className="text-gray-400 font-medium">Tidak ada data booking</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr 
                          key={booking.id} 
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                              {booking.reference}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {booking.user?.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {booking.user?.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-sm">
                            {formatDate(booking.booking_time)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-sm">
                              {booking.seats_booked}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(booking.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : booking.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
