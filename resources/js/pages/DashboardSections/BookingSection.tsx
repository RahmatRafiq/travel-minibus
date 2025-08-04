import React from 'react';
import { FaClipboardList, FaChevronRight } from 'react-icons/fa';

interface Booking {
  user: string;
  rute: string;
  kursi: number;
  tanggal: string;
  status: string;
}

interface BookingSectionProps {
  bookingTerbaru: Booking[];
}

const BookingSection: React.FC<BookingSectionProps> = ({ bookingTerbaru }) => (
  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
          <FaClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-gray-800 dark:text-white">Booking Terbaru</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Aktivitas terkini</p>
        </div>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium">
        Lihat Semua
        <FaChevronRight className="w-3 h-3" />
      </button>
    </div>
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rute</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kursi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {bookingTerbaru.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FaClipboardList className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-400 font-medium">Belum ada booking terbaru</p>
                  </div>
                </td>
              </tr>
            ) : (
              bookingTerbaru.map((b, i) => (
                <tr 
                  key={i} 
                  className="hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {b.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{b.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{b.rute}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-sm">
                      {b.kursi}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-gray-600 dark:text-gray-300 text-sm">{b.tanggal}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      b.status === 'Sukses' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : b.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default BookingSection;
