import React, { useState, useRef } from "react";
import { router, Link, Head } from "@inertiajs/react";
import Header from "./HomeComponents/Header";
import Footer from "./HomeComponents/Footer";
import FormBooking from "./HomeComponents/FormBooking";
import CustomSelect from "@/components/select";

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

  // Handler untuk FormBooking
  const handleFormBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };
  const handleFormBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('booking.detail'), {
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
    router.post(route('home.booking.store'), {
      schedule_id: selectedSchedule,
      seats_booked: seats,
    });
  };

  // Jika belum ada pencarian, tampilkan form pencarian
  if (!origin || !destination || !date) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <Head title="Cari Jadwal - Travel Bone Makassar" />
        <Header />
        <main className="container mx-auto px-6 py-12 flex-1">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-indigo-100 max-w-lg mx-auto">
            <FormBooking
              form={search}
              allOrigins={allOrigins}
              allDestinations={allDestinations}
              onChange={handleFormBookingChange}
              onSubmit={handleFormBookingSubmit}
            />
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
      <Header />
      <main className="container mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-10 md:py-12 flex-1 w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-indigo-100 max-w-xl mx-auto w-full">
          <h2 className="text-lg sm:text-xl font-bold text-indigo-700 mb-4">
            Jadwal Tersedia Untuk Rute {origin && destination ? `${origin} → ${destination}` : ''}
          </h2>
          {schedules.length === 0 && (
            <>
              <div className="text-gray-500 text-center mb-6">Tidak ada jadwal tersedia untuk pilihan Anda.</div>
              <FormBooking
                form={search}
                allOrigins={allOrigins}
                allDestinations={allDestinations}
                onChange={handleFormBookingChange}
                onSubmit={handleFormBookingSubmit}
              />
            </>
          )}
          {schedules.length > 0 && (
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
              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}
              <div ref={seatsRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Kursi</label>
                <CustomSelect
                  value={
                    selectedSchedule
                      ? { value: seats, label: seats.toString() }
                      : null
                  }
                  onChange={option => {
                    if (Array.isArray(option)) {
                      setSeats(1);
                    } else if (option && typeof option === "object" && "value" in option) {
                      setSeats(option.value);
                    } else {
                      setSeats(1);
                    }
                  }}
                  options={
                    (() => {
                      const maxSeats = selectedSchedule
                        ? schedules.find(s => s.id === selectedSchedule)?.available_seats || 1
                        : 1;
                      return Array.from({ length: maxSeats }).map((_, i) => ({
                        value: i + 1,
                        label: (i + 1).toString(),
                      }));
                    })()
                  }
                  className="w-full sm:w-32 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 bg-white"
                  isDisabled={!selectedSchedule}
                  placeholder="Pilih jumlah kursi"
                />
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
            