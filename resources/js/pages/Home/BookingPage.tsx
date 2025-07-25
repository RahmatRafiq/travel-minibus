import React, { useState, useRef } from "react";
import { router, Link, Head } from "@inertiajs/react";
import Header from "./HomeComponents/Header";
import Footer from "./HomeComponents/Footer";
import FormBooking from "./HomeComponents/FormBooking";
import SeatPickerComponent, { generateMinibusLayout } from "@/components/SeatPickerComponent";
import BookingConfirmModal from "@/components/BookingConfirmModal";

type Schedule = {
  id: number;
  departure_time: string;
  available_seats: number;
  vehicle: {
    id: number;
    plate_number: string;
    brand: string;
    seat_capacity: number;
  };
  route: {
    id: number;
    origin: string;
    destination: string;
    price?: number;
  };
};

type Props = {
  origin?: string;
  destination?: string;
  date?: string;
  schedules: Schedule[];
  reservedSeats?: (string | number)[];
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
  reservedSeats = [],
  isLoggedIn,
  userName,
  allOrigins = [],
  allDestinations = [],
}: Props) {
  const [search, setSearch] = useState({
    origin: origin || "",
    destination: destination || "",
    date: date || "",
  });
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<(string | number)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const seatsRef = useRef<HTMLDivElement>(null);

  const handleFormBookingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleFormBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route("booking.detail"), {
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
    if (selectedSeats.length === 0) {
      setError("Pilih kursi terlebih dahulu.");
      return;
    }
    setError(null);
    setShowConfirm(true);
  };

  const handleConfirmBooking = () => {
    setShowConfirm(false);
    router.post(route("home.booking.store"), {
      schedule_id: selectedSchedule,
      seats_selected: selectedSeats,
    });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Head title="Booking Detail - Travel Bone Makassar" />
      <Header />
      <main className="container mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-10 md:py-12 flex-1 w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-indigo-100 max-w-xl mx-auto w-full">
          <h2 className="text-lg sm:text-xl font-bold text-indigo-700 mb-4">
            Jadwal Tersedia Untuk Rute {origin && destination ? `${origin} → ${destination}` : ""}
          </h2>
          {schedules.length === 0 && (
            <>
              <div className="text-gray-500 text-center mb-6">
                Tidak ada jadwal tersedia untuk pilihan Anda.
              </div>
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
                  <li
                    key={sch.id}
                    className="py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4"
                  >
                    <input
                      type="radio"
                      name="schedule"
                      value={sch.id}
                      checked={selectedSchedule === sch.id}
                      onChange={() => {
                        setSelectedSchedule(sch.id);
                        setSelectedSeats([]);
                        setError(null);
                        setTimeout(() => {
                          seatsRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
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
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              {selectedSchedule && (
                <div ref={seatsRef}>
                  <SeatPickerComponent
                    layout={generateMinibusLayout(
                      schedules.find(s => s.id === selectedSchedule)?.vehicle?.seat_capacity || 8,
                      [2,4,3], 
                      true 
                    )}
                    reservedSeats={reservedSeats}
                    selectedSeats={selectedSeats}
                    onSelect={(seats) => {
                      console.log('Kursi dipilih sekarang:', seats);
                      setSelectedSeats(seats);
                      setError(null);
                    }}
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={!selectedSchedule || selectedSeats.length === 0}
                  className={
                    "bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-2 rounded-full font-semibold shadow transition" +
                    (!selectedSchedule || selectedSeats.length === 0
                      ? " opacity-60 cursor-not-allowed"
                      : "")
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
              {showConfirm && (
                <BookingConfirmModal
                  open={showConfirm}
                  onClose={() => setShowConfirm(false)}
                  onConfirm={handleConfirmBooking}
                  schedule={schedules.find(s => s.id === selectedSchedule) || null}
                  selectedSeats={selectedSeats}
                />
              )}
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}