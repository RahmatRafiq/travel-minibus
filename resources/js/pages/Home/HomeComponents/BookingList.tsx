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
    <div className="py-6 px-2 sm:px-0">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2 justify-center">
        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h8a2 2 0 002-2v-6"></path>
        </svg>
        Daftar Booking Saya
      </h2>
      <div className="flex flex-col gap-6 items-center">
        {bookings.length === 0 && (
          <div className="py-12 text-gray-400 text-center flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-indigo-200 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10" stroke="currentColor" />
            </svg>
            <span>Belum ada booking perjalanan.</span>
          </div>
        )}
        {bookings.map((b) => (
          <div
            key={b.id}
            className="relative w-full max-w-xl mx-auto bg-white rounded-3xl shadow-lg border border-indigo-100 overflow-hidden"
          >
            {/* Ticket top section */}
            <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {statusIcon(b.status)}
                <span className="font-bold text-indigo-800 text-lg">
                  {b.origin}
                </span>
                <span className="mx-1 text-indigo-400">→</span>
                <span className="font-bold text-indigo-800 text-lg">
                  {b.destination}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  {b.seats} Kursi
                </span>
                <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  Rp {b.amount?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            {/* Dashed border divider */}
            <div className="border-b border-dashed border-indigo-200 mx-6 my-4"></div>
            {/* Ticket middle section */}
            <div className="px-6 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500"><span className="font-medium">Tanggal:</span> {formatTanggal(b.date)}</span>
                <span className="text-xs text-gray-500"><span className="font-medium">Armada:</span> {b.vehicle} ({b.brand})</span>
              </div>
              <span
                className={
                  "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm " +
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
            {/* Dashed border divider */}
            <div className="border-b border-dashed border-indigo-200 mx-6 my-4 relative">
              <div className="absolute rounded-full w-5 h-5 bg-indigo-100 -top-3 -left-5"></div>
              <div className="absolute rounded-full w-5 h-5 bg-indigo-100 -top-3 -right-5"></div>
            </div>
            {/* Ticket bottom section */}
            <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">ID Booking</span>
                <span className="font-bold text-indigo-700 text-sm">{b.id}</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs text-gray-500">Kode Tiket</span>
                <span className="font-bold text-indigo-700 text-sm">TRV-{b.id.toString().padStart(6, '0')}</span>
              </div>
            </div>
            {/* Barcode dummy */}
            <div className="flex justify-center pb-4">
              <div className="h-8 w-40 bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-300 rounded-sm" style={{maskImage: 'linear-gradient(90deg, #000 10%, transparent 90%)'}}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingList;
