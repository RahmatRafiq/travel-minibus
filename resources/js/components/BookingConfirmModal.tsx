import React, { useState, useEffect } from "react";
import { Armchair, CheckCircle2 } from "lucide-react";
import { FaQuestion } from "react-icons/fa";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    schedule: {
        departure_time: string;
        vehicle: { plate_number: string; brand: string };
        route: { price?: number };
    } | null;
    selectedSeats: (string | number)[];
}

const BookingConfirmModal: React.FC<Props> = ({ open, onClose, onConfirm, schedule, selectedSeats }) => {
    const [success, setSuccess] = useState(false);

    // Reset success state whenever modal is reopened
    useEffect(() => {
        if (open) {
            setSuccess(false);
        }
    }, [open]);

    // Early return if modal is closed
    if (!open) {
        return null;
    }

    // Guard against null schedule
    if (!schedule) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                    <p className="text-center text-gray-500">Jadwal tidak tersedia.</p>
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const price = schedule.route.price || 0;
    const total = selectedSeats.length * price;

    const handleConfirm = () => {
        // Tampilkan success dan biarkan modal terbuka hingga user menutupnya
        setSuccess(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-md w-full border border-indigo-100 animate-scaleIn">
                {!success ? (
                    <>
                        {/* Confirmation Content */}
                        <div className="flex flex-col items-center pt-6 pb-2 px-6">
                            <FaQuestion size={40} className="text-indigo-500 mb-2 animate-pop" />
                            <h3 className="text-2xl font-bold text-indigo-700 mb-1 text-center">Konfirmasi Booking</h3>
                            <p className="text-sm text-gray-500 text-center mb-2">Pastikan detail booking Anda sudah benar sebelum melanjutkan.</p>
                        </div>
                        <div className="bg-indigo-50/40 rounded-xl mx-6 mb-4 px-4 py-4 shadow-sm">
                            <div className="mb-2 text-sm text-gray-700 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Jadwal:</span>
                                    <span className="font-mono">{schedule.departure_time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Armada:</span>
                                    <span>{schedule.vehicle.plate_number} ({schedule.vehicle.brand})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Kursi dipilih:</span>
                                    {selectedSeats.length > 0 ? (
                                        <>
                                            <span className="inline-flex flex-wrap gap-1">
                                                {Array.from(new Set(selectedSeats)).map((seat, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm"
                                                    >
                                                        <Armchair size={14} className="inline-block" />{seat}
                                                    </span>
                                                ))}
                                            </span>
                                            <span className="ml-2 text-xs text-gray-600 font-semibold">({selectedSeats.length} kursi)</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Total harga:</span>
                                    <span className="text-xl font-bold text-green-600">Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mb-6 justify-center">
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-full font-bold shadow transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                            >
                                Konfirmasi
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-7 py-3 rounded-full font-bold shadow border border-gray-300 transition-all focus:outline-none text-base"
                            >
                                Batal
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center py-12 px-6">
                        <CheckCircle2 size={48} className="text-green-500 mb-3 animate-pop" />
                        <h3 className="text-2xl font-bold text-green-700 mb-2 text-center">Booking Berhasil!</h3>
                        <p className="text-base text-gray-600 text-center mb-4">
                            Terima kasih, booking Anda telah berhasil dikirim.<br />Silakan tunggu konfirmasi pesanan Anda oleh admin.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-7 py-3 rounded-full font-bold shadow transition-all focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </div>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s; }
        .animate-scaleIn { animation: scaleIn 0.25s; }
        .animate-pop { animation: pop 0.4s; }
      `}</style>
        </div>
    );
};

export default BookingConfirmModal;
