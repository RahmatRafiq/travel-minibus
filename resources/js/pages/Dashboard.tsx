
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeaderSection from './DashboardSections/HeaderSection';
import InsightSection from './DashboardSections/InsightSection';
import StatsSection from './DashboardSections/StatsSection';
import JadwalSection from './DashboardSections/JadwalSection';
import BookingSection from './DashboardSections/BookingSection';
import RutePopulerSection from './DashboardSections/RutePopulerSection';

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
  const topBookingStatus = safeBooking[0]?.status || '';

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        `}</style>
        <div className="flex flex-col gap-6 p-3 sm:p-6 max-w-7xl mx-auto">
          <HeaderSection />
          <InsightSection topRute={topRute} topRuteJumlah={topRuteJumlah} topBooking={topBooking} topBookingStatus={topBookingStatus} />
          <StatsSection stats={safeStats} />
          <JadwalSection jadwalHariIni={safeJadwal} />
          <BookingSection bookingTerbaru={safeBooking} />
          <RutePopulerSection rutePopuler={safeRutePopuler} />
        </div>
      </div>
    </AppLayout>
  );
}