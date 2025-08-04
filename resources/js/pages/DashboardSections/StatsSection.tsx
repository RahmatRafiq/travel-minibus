import React from 'react';
import { FaClipboardList, FaUsers, FaCar, FaRoute, FaUserTie } from 'react-icons/fa';
import { MdEventSeat } from 'react-icons/md';

type Stat = { label: string; value: number };

const iconMap = {
  'Total Booking': <FaClipboardList className="text-white w-7 h-7" />,
  'Total User': <FaUsers className="text-white w-7 h-7" />,
  'Total Driver': <FaUserTie className="text-white w-7 h-7" />,
  'Total Armada': <FaCar className="text-white w-7 h-7" />,
  'Rute Aktif': <FaRoute className="text-white w-7 h-7" />,
  'Jadwal Hari Ini': <MdEventSeat className="text-white w-7 h-7" />,
};

interface StatsSectionProps {
  stats: Stat[];
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
    {stats.map((stat, index) => {
      const gradientMap: Record<string, string> = {
        'Total Booking': 'bg-gradient-to-br from-indigo-400 to-purple-600',
        'Total User': 'bg-gradient-to-br from-blue-400 to-cyan-600',
        'Total Driver': 'bg-gradient-to-br from-green-400 to-emerald-600',
        'Total Armada': 'bg-gradient-to-br from-yellow-400 to-orange-600',
        'Rute Aktif': 'bg-gradient-to-br from-pink-400 to-rose-600',
        'Jadwal Hari Ini': 'bg-gradient-to-br from-purple-400 to-violet-600',
      };
      const cardGradient = gradientMap[stat.label] || 'bg-gradient-to-br from-gray-400 to-gray-600';
      return (
        <div
          key={stat.label}
          className={`group relative overflow-hidden ${cardGradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 cursor-pointer`}
          style={{
            animationDelay: `${index * 100}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards',
          }}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="p-2 sm:p-3 bg-white/20 rounded-full mb-2 sm:mb-3 group-hover:rotate-12 transition-transform duration-300">
              {iconMap[stat.label as keyof typeof iconMap] ?? <FaClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
              {stat.value}
            </div>
            <div className="text-xs text-white/80 font-medium uppercase tracking-wider text-center">
              {stat.label}
            </div>
          </div>
          <div className="absolute -right-3 sm:-right-4 -bottom-3 sm:-bottom-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            {iconMap[stat.label as keyof typeof iconMap] && (
              <div className="w-12 h-12 sm:w-16 sm:h-16 text-white">
                {iconMap[stat.label as keyof typeof iconMap]}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default StatsSection;
