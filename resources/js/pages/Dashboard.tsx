
import { Head, usePage } from '@inertiajs/react';
import { FaUsers, FaCar, FaRoute, FaUserTie, FaClipboardList } from 'react-icons/fa';
import { MdEventSeat, MdStar } from 'react-icons/md';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import AppLayout from '@/layouts/app-layout';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Stat = { label: string; value: number };
type Jadwal = { jam: string; rute: string; armada: string; driver: string; kursi: string; status: string };
type Booking = { user: string; rute: string; kursi: number; tanggal: string; status: string };
type RutePopuler = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderRadius: number;
  }>;
};
type DashboardPageProps = {
  stats: Stat[];
  jadwalHariIni: Jadwal[];
  bookingTerbaru: Booking[];
  rutePopuler: RutePopuler;
};

const iconMap = {
  'Total Booking': <FaClipboardList className="text-indigo-600 w-7 h-7" />,
  'Total User': <FaUsers className="text-blue-500 w-7 h-7" />,
  'Total Driver': <FaUserTie className="text-green-500 w-7 h-7" />,
  'Total Armada': <FaCar className="text-yellow-500 w-7 h-7" />,
  'Rute Aktif': <FaRoute className="text-pink-500 w-7 h-7" />,
  'Jadwal Hari Ini': <MdEventSeat className="text-purple-500 w-7 h-7" />,
};

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
  const { stats, jadwalHariIni, bookingTerbaru, rutePopuler } = usePage<DashboardPageProps>().props;
  const safeStats = stats ?? [];
  const safeJadwal = jadwalHariIni ?? [];
  const safeBooking = bookingTerbaru ?? [];
  const safeRutePopuler = rutePopuler ?? { labels: [], datasets: [] };

  const topRute = safeRutePopuler.labels?.[0] || '-';
  const topRuteJumlah = safeRutePopuler.datasets?.[0]?.data?.[0] || 0;
  const topBooking = safeBooking[0]?.user ? `${safeBooking[0].user} (${safeBooking[0].rute})` : '-';

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex flex-col gap-8 p-4">
        {/* Insight Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 flex items-center gap-3 shadow border border-indigo-100 dark:border-gray-800">
            <MdStar className="text-yellow-400 w-8 h-8" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Rute Terpopuler</div>
              <div className="font-bold text-lg text-indigo-700 dark:text-indigo-300">{topRute}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{topRuteJumlah} Booking</div>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-r from-green-100 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 flex items-center gap-3 shadow border border-green-100 dark:border-gray-800">
            <FaClipboardList className="text-green-500 w-8 h-8" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Booking Terbaru</div>
              <div className="font-bold text-lg text-green-700 dark:text-green-300">{topBooking}</div>
            </div>
          </div>
        </div>

        {/* Statistik Utama */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {safeStats.map((stat: Stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center rounded-xl bg-white dark:bg-gray-900 shadow p-4 border border-gray-100 dark:border-gray-800 hover:scale-105 transition-transform">
              <div className="mb-2">{iconMap[stat.label as keyof typeof iconMap] ?? <FaClipboardList className="w-7 h-7" />}</div>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight drop-shadow-sm">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300 mt-1 text-center font-medium uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Jadwal Keberangkatan Hari Ini */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800">
          <div className="font-bold text-lg mb-3 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <MdEventSeat className="w-5 h-5" /> Jadwal Keberangkatan Hari Ini
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="p-2 text-left">Jam</th>
                  <th className="p-2 text-left">Rute</th>
                  <th className="p-2 text-left">Armada</th>
                  <th className="p-2 text-left">Driver</th>
                  <th className="p-2 text-left">Kursi</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {safeJadwal.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-4">Tidak ada jadwal hari ini</td></tr>
                )}
                {safeJadwal.map((j: any, i: number) => (
                  <tr key={i} className="border-b last:border-b-0 hover:bg-indigo-50/30 dark:hover:bg-gray-800/40">
                    <td className="p-2 font-mono font-semibold text-indigo-700 dark:text-indigo-300">{j.jam}</td>
                    <td className="p-2">{j.rute}</td>
                    <td className="p-2">{j.armada}</td>
                    <td className="p-2">{j.driver}</td>
                    <td className="p-2 font-semibold">{j.kursi}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide ${j.status === 'Berangkat' ? 'bg-green-100 text-green-700' : j.status === 'Penuh' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{j.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Terbaru */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800">
          <div className="font-bold text-lg mb-3 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <FaClipboardList className="w-5 h-5" /> Booking Terbaru
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Rute</th>
                  <th className="p-2 text-left">Kursi</th>
                  <th className="p-2 text-left">Tanggal</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {safeBooking.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-4">Belum ada booking terbaru</td></tr>
                )}
                {safeBooking.map((b: any, i: number) => (
                  <tr key={i} className="border-b last:border-b-0 hover:bg-green-50/30 dark:hover:bg-gray-800/40">
                    <td className="p-2 font-semibold">{b.user}</td>
                    <td className="p-2">{b.rute}</td>
                    <td className="p-2 font-semibold">{b.kursi}</td>
                    <td className="p-2 font-mono">{b.tanggal}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide ${b.status === 'Sukses' ? 'bg-green-100 text-green-700' : b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rute Populer */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800">
          <div className="font-bold text-lg mb-3 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <FaRoute className="w-5 h-5" /> Rute Populer
          </div>
          <Bar
            data={safeRutePopuler}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false }
              },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#e5e7eb' } }
              }
            }}
            style={{ maxHeight: 180 }}
          />
        </div>
      </div>
    </AppLayout>
  );
}