import React from "react";
import { Link } from "@inertiajs/react";
import { CheckCircle, Clock, XCircle } from "lucide-react";

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
  isLoggedIn?: boolean;
};

function statusIcon(status: string) {
  if (status.toLowerCase() === "confirmed")
    return <CheckCircle className="text-green-500 w-5 h-5" />;
  if (status.toLowerCase() === "pending")
    return <Clock className="text-yellow-500 w-5 h-5" />;
  return <XCircle className="text-red-500 w-5 h-5" />;
}

export default function BookingList({ bookings, isLoggedIn }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h8a2 2 0 002-2v-6"></path>
        </svg>
        Bookingan Saya
      </h2>
      <ul className="divide-y divide-indigo-100">
        {bookings.length === 0 && (
          <li className="py-8 text-gray-400 text-center flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-indigo-200 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10" stroke="currentColor" />
            </svg>
            <span>Belum ada booking.</span>
          </li>
        )}
        {bookings.map((b) => (
          <li
            key={b.id}
            className="py-4 sm:py-5 px-2 sm:px-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl hover:bg-indigo-50/60 transition group"
          >
            <div>
              <div className="font-semibold text-indigo-800 text-base sm:text-lg flex items-center gap-2">
                {statusIcon(b.status)}
                {b.origin} <span className="mx-1">→</span> {b.destination}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {b.date} &middot; {b.vehicle} ({b.brand})
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="bg-indigo-100 text-indigo-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                {b.seats} Kursi
              </span>
              <span
                className={
                  "flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-sm " +
                  (b.status === "Confirmed"
                    ? "bg-green-100 text-green-700"
                    : b.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700")
                }
              >
                {statusIcon(b.status)}
                {b.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 sm:mt-8 text-center">
        {isLoggedIn && (
          <Link
            href="/my-bookings"
            className="inline-block bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-6 sm:px-8 py-2 rounded-full font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Lihat Semua Booking
          </Link>
        )}
      </div>
    </div>
  );
}
