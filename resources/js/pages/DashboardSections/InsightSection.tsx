import React from 'react';
import { MdStar, MdTrendingUp } from 'react-icons/md';
import { FaClipboardList } from 'react-icons/fa';

interface InsightSectionProps {
  topRute: string;
  topRuteJumlah: number;
  topBooking: string;
  topBookingStatus: string;
}

const InsightSection: React.FC<InsightSectionProps> = ({ topRute, topRuteJumlah, topBooking, topBookingStatus }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
    <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-rotate-1">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative z-10 flex items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm">
          <MdStar className="text-yellow-300 w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <div className="text-xs sm:text-sm text-white/80 font-medium">🔥 Rute Terpopuler</div>
          <div className="font-bold text-lg sm:text-2xl text-white mb-1 truncate">{topRute}</div>
          <div className="text-xs sm:text-sm text-white/70 flex items-center gap-1">
            <MdTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            {topRuteJumlah} Booking
          </div>
        </div>
      </div>
      <div className="absolute -right-4 sm:-right-6 -bottom-4 sm:-bottom-6 opacity-20">
        <MdStar className="w-16 h-16 sm:w-24 sm:h-24 text-white" />
      </div>
    </div>

    <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:rotate-1">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative z-10 flex items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm">
          <FaClipboardList className="text-white w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs sm:text-sm text-white/80 font-medium">📋 Booking Terbaru</div>
          <div className="font-bold text-sm sm:text-xl text-white mb-1 truncate">{topBooking}</div>
          {topBookingStatus && (
            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
              topBookingStatus === 'Sukses' 
                ? 'bg-green-100 text-green-700' 
                : topBookingStatus === 'Pending' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {topBookingStatus}
            </span>
          )}
        </div>
      </div>
      <div className="absolute -right-4 sm:-right-6 -bottom-4 sm:-bottom-6 opacity-20">
        <FaClipboardList className="w-16 h-16 sm:w-24 sm:h-24 text-white" />
      </div>
    </div>
  </div>
);

export default InsightSection;
