import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";

type Booking = {
  id: number;
  reference: string;
  origin: string;
  destination: string;
  date: string;
  seats: number;
  status: string;
  vehicle: string;
  brand: string;
  amount: number;
  seats_selected?: string[];
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
    const tgl = new Date(dateStr);
    return tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div className="py-0 px-0 booking-list-scroll">
      {/* Judul dipindahkan ke Home agar konsisten */}
      <div className="flex flex-col gap-6 items-center">
        {bookings.length === 0 && (
          <div className="py-12 text-gray-400 dark:text-slate-400 text-center flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-indigo-200 dark:text-slate-500 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10" stroke="currentColor" />
            </svg>
            <span>Belum ada booking perjalanan.</span>
          </div>
        )}
        {bookings.map((b) => (
          <div
            key={b.id}
            className="relative w-full max-w-xl mx-auto bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-indigo-200 dark:border-slate-700 overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(80, 80, 180, 0.15)" }}
          >
            <div className="px-8 pt-8 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {statusIcon(b.status)}
                <span className="font-extrabold text-indigo-900 dark:text-slate-100 text-xl tracking-wide">
                  {b.origin}
                </span>
                <span className="mx-2 text-indigo-400 dark:text-slate-400 text-2xl">→</span>
                <span className="font-extrabold text-indigo-900 dark:text-slate-100 text-xl tracking-wide">
                  {b.destination}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-4 py-2 rounded-full text-sm font-bold shadow">
                  Rp {b.amount?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="border-b border-dashed border-indigo-300 dark:border-slate-700 mx-8 my-4"></div>
            <div className="px-8 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-600 dark:text-slate-400"><span className="font-semibold">Tanggal:</span> {formatTanggal(b.date)}</span>
                <span className="text-sm text-gray-600 dark:text-slate-400"><span className="font-semibold">Armada:</span> {b.vehicle} ({b.brand})</span>
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  <span className="font-semibold">Kursi:</span> {b.seats_selected && b.seats_selected.length > 0
                    ? `${b.seats_selected.length} (${b.seats_selected.join(", ")})`
                    : "-"}
                </span>
              </div>
              <span
                className={
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow " +
                  (b.status.toLowerCase() === "confirmed"
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100"
                    : b.status.toLowerCase() === "pending"
                    ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100"
                    : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100")
                }
              >
                {statusIcon(b.status)}
                {statusLabel(b.status)}
              </span>
            </div>
            <div className="border-b border-dashed border-indigo-300 dark:border-slate-700 mx-8 my-4 relative">
              <div className="absolute rounded-full w-7 h-7 bg-indigo-100 dark:bg-slate-800 -top-4 -left-7"></div>
              <div className="absolute rounded-full w-7 h-7 bg-indigo-100 dark:bg-slate-800 -top-4 -right-7"></div>
            </div>
            <div className="px-8 pb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">ID Booking</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-200 text-base tracking-wider">{b.id}</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs text-gray-500 dark:text-slate-400">Kode Tiket</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-200 text-base tracking-wider">{b.reference}</span>
              </div>
            </div>
            <div className="flex justify-center pb-6">
              <img
                src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(`${b.id}-${b.reference}`)}&code=Code128&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=120&imagetype=png&rotation=0&color=%23000000&bgcolor=%23ffffff&quiet=0`}
                alt={`Barcode untuk booking ${b.reference}`}
                className="h-16 w-64 object-contain bg-white dark:bg-slate-900 rounded-md border border-indigo-100 dark:border-slate-700 shadow"
                loading="lazy"
                width="256"
                height="64"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingList;
