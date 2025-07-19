import React, { useState, useRef } from "react";
import { router, Link, Head } from "@inertiajs/react";
import Header from "./HomeComponents/Header";
import Footer from "./HomeComponents/Footer";

type Schedule = {
  id: number;
  departure_time: string;
  available_seats: number;
  vehicle: {
    id: number;
    plate_number: string;
    brand: string;
  };
  route: {
    id: number;
    origin: string;
    destination: string;
  };
};

type Props = {
  origin?: string;
  destination?: string;
  date?: string;
  schedules: Schedule[];
  isLoggedIn: boolean;
  userName?: string;
  allOrigins?: string[];
  allDestinations?: string[];
};

export default function BookingDetail({
  origin,
  destination,
  date,
  schedules,
  isLoggedIn,
  userName,
  allOrigins = [],
  allDestinations = [],
}: Props) {
  // State untuk pencarian jika belum ada origin/destination/date
  const [search, setSearch] = useState({
    origin: origin || "",
    destination: destination || "",
    date: date || "",
  });
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const seatsRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get("/booking-detail", {
      origin: search.origin,
      destination: search.destination,
      date: search.date,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.get("/login");
      return;
    }
    if (!selectedSchedule) {
      setError("Pilih jadwal terlebih dahulu.");
      return;
    }
    setError(null);
    router.post("/home-booking", {
      schedule_id: selectedSchedule,
      seats_booked: seats,
    });
  };

  // Jika belum ada pencarian, tampilkan form pencarian
  if (!origin || !destination || !date) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <Head title="Cari Jadwal - Travel Bone Makassar" />
        <Header
          title="Cari Jadwal Travel"
        >
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow transition"
          >
            Kembali ke Home
          </Link>
        </Header>
        <main className="container mx-auto px-6 py-12 flex-1">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-indigo-100 max-w-lg mx-auto">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white"
                  value={search.origin}
                  onChange={e => setSearch(s => ({ ...s, origin: e.target.value }))}
                  required
                >
                  <option value="">Pilih Origin</option>
                  {allOrigins.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white"
                  value={search.destination}
                  onChange={e => setSearch(s => ({ ...s, destination: e.target.value }))}
                  required
                >
                  <option value="">Pilih Destination</option>
                  {allDestinations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berangkat</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white"
                  value={search.date}
                  onChange={e => setSearch(s => ({ ...s, date: e.target.value }))}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Cari Jadwal
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Jika sudah ada pencarian, tampilkan jadwal
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Head title="Booking Detail - Travel Bone Makassar" />
      <Header
        title="Pilih Jadwal"
        subtitle={`${origin} → ${destination} (${date})`}
      >
        <Link
          href="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow transition"
        >
          Kembali ke Home
        </Link>
      </Header>
      <main className="container mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-10 md:py-12 flex-1 w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-indigo-100 max-w-xl mx-auto w-full">
          <h2 className="text-lg sm:text-xl font-bold text-indigo-700 mb-4">Jadwal Tersedia</h2>
          {schedules.length === 0 && (
            <div className="text-gray-500 text-center">Tidak ada jadwal tersedia untuk pilihan Anda.</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <ul className="divide-y divide-indigo-100 mb-6">
              {schedules.map((sch) => (
                <li key={sch.id} className="py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <input
                    type="radio"
                    name="schedule"
                    value={sch.id}
                    checked={selectedSchedule === sch.id}
                    onChange={() => {
                      setSelectedSchedule(sch.id);
                      setSeats(1); // reset kursi ke 1 setiap ganti jadwal
                      setError(null);
                      setTimeout(() => {
                        seatsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 100);
                    }}
                    className="accent-indigo-600 mt-1 sm:mt-0"
                  />
                  <div>
                    <div className="font-semibold text-indigo-800 text-base sm:text-lg">
                      {sch.departure_time} &middot; {sch.vehicle.plate_number} ({sch.vehicle.brand})
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Sisa kursi: {sch.available_seats}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* Pesan error jika belum memilih jadwal */}
            {error && (
              <div className="text-red-600 text-sm mb-2">{error}</div>
            )}
            <div ref={seatsRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Kursi</label>
              <select
                value={seats}
                onChange={e => setSeats(Number(e.target.value))}
                className="w-full sm:w-32 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white"
                disabled={!selectedSchedule}
              >
                {(() => {
                  const maxSeats = selectedSchedule
                    ? schedules.find(s => s.id === selectedSchedule)?.available_seats || 1
                    : 1;
                  // Jika belum memilih jadwal, hanya tampilkan 1 kursi
                  return Array.from({ length: maxSeats }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ));
                })()}
              </select>
              {!selectedSchedule && (
                <div className="text-indigo-500 text-xs sm:text-sm mt-1">
                  Pilih jadwal terlebih dahulu untuk menentukan jumlah kursi.
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={!selectedSchedule}
                className={
                  "bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-2 rounded-full font-semibold shadow transition" +
                  (!selectedSchedule ? " opacity-60 cursor-not-allowed" : "")
                }
              >
                Booking Sekarang
              </button>
              <Link
                href="/"
                className="bg-muted text-foreground px-6 sm:px-8 py-2 rounded-full border border-input"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
