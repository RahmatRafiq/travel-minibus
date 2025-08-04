import React from 'react';
import { MdEventSeat, MdAccessTime } from 'react-icons/md';
import { Schedule } from '@/types/Schedule';

interface JadwalSectionProps {
  jadwalHariIni: Schedule[];
}

const JadwalSection: React.FC<JadwalSectionProps> = ({ jadwalHariIni }) => (
  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <MdEventSeat className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-gray-800 dark:text-white">Jadwal Keberangkatan</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Hari ini</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <MdAccessTime className="w-4 h-4" />
        Live Update
      </div>
    </div>
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Jam</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rute</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Armada</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kursi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {jadwalHariIni.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <MdEventSeat className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-400 font-medium">Tidak ada jadwal hari ini</p>
                  </div>
                </td>
              </tr>
            ) : (
              jadwalHariIni.map((j, i) => (
                <tr 
                  key={i} 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-mono font-semibold text-sm">
                      {new Date(j.departure_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{j.route?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{j.vehicle?.plate_number || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{j.vehicle?.driver?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{j.available_seats || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      j.status === 'active' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : j.status === 'full' 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {j.status}
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

export default JadwalSection;
