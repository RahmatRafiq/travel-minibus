import React from "react";
import { Link, Head } from "@inertiajs/react";
import Header from "./HomeComponents/Header";
import Footer from "./HomeComponents/Footer";

type Booking = {
  id: number;
  origin: string;
  destination: string;
  date: string;
  seats: number;
  status: string;
  vehicle: string;
  brand: string;
};

type Props = {
  bookings: Booking[];
  userName?: string;
};

export default function Bookings({ bookings, userName }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Head title="Daftar Booking - Travel Bone Makassar" />
      <Header
        title="Bookingan Saya"
        subtitle={`Semua riwayat booking Anda${
          userName ? `, ${userName}` : ""
        }.`}
      >
        <Link
          href="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow transition"
        >
          Kembali ke Home
        </Link>
      </Header>
      <main className="container mx-auto px-2 sm:px-4 md:px-6 py-8 sm:py-12 flex-1 w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 border border-indigo-100 max-w-2xl mx-auto w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-6">
            Daftar Booking
          </h2>
          <ul className="divide-y divide-indigo-100">
            {bookings.length === 0 && (
              <li className="py-6 text-gray-400 text-center">
                Belum ada booking.
              </li>
            )}
            {bookings.map((b) => (
              <li
                key={b.id}
                className="py-4 sm:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-indigo-800 text-base sm:text-lg">
                    {b.origin} <span className="mx-1">→</span> {b.destination}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {b.date} &middot; {b.vehicle} ({b.brand})
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="bg-indigo-100 text-indigo-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                    {b.seats} Kursi
                  </span>
                  <span
                    className={
                      "px-2 sm:px-3 py-1 rounded-full text-xs font-bold " +
                      (b.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : b.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700")
                    }
                  >
                    {b.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

