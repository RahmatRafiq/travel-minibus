import React from "react";
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
  amount: number;
};

type Props = {
  bookings: Booking[];
  isLoggedIn?: boolean;
};

const BookingList: React.FC<Props> = ({ bookings }) => {
  function statusIcon(status: string) {
    if (status.toLowerCase() === "confirmed")
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    if (status.toLowerCase() === "pending")
      return <Clock className="text-yellow-500 w-5 h-5" />;
    return <XCircle className="text-red-500 w-5 h-5" />;
  }

  const statusLabel = (status: string) => {
    if (status.toLowerCase() === "confirmed") return "Terkonfirmasi";
    if (status.toLowerCase() === "pending") return "Menunggu";
    return "Dibatalkan";
  };

  function formatTanggal(dateStr: string) {
    const now = new Date();
    const tgl = new Date(dateStr);
    tgl.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diff = Math.round((tgl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) return "Besok";
    if (diff === 2) return "Lusa";
    if (diff > 2) {
      return tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    }
    return tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h8a2 2 0 002-2v-6"></path>
        </svg>
        Daftar Booking Saya
      </h2>
      <ul className="divide-y divide-indigo-100">
        {bookings.length === 0 && (
          <li className="py-8 text-gray-400 text-center flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-indigo-200 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10" stroke="currentColor" />
            </svg>
            <span>Belum ada booking perjalanan.</span>
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
                <span>
                  <span className="font-bold">{b.origin}</span>
                  <span className="mx-1">→</span>
                  <span className="font-bold">{b.destination}</span>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-1">
                <span className="inline-block text-xs sm:text-sm text-gray-500"><span className="font-medium">Tanggal:</span> {formatTanggal(b.date)}</span>
                <span className="inline-block text-xs sm:text-sm text-gray-500"><span className="font-medium">Armada:</span> {b.vehicle} ({b.brand})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="bg-indigo-100 text-indigo-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                {b.seats} Kursi
              </span>
              <span className="bg-yellow-50 text-yellow-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                Rp {b.amount?.toLocaleString('id-ID')}
              </span>
              <span
                className={
                  "flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-sm " +
                  (b.status.toLowerCase() === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : b.status.toLowerCase() === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700")
                }
              >
                {statusIcon(b.status)}
                {statusLabel(b.status)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingList;
