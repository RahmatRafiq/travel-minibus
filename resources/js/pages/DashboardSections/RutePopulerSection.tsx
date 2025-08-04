
import React from 'react';
import { FaRoute } from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type RutePopuler = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderRadius: number;
  }>;
};

interface RutePopulerSectionProps {
  rutePopuler: RutePopuler;
}

const RutePopulerSection: React.FC<RutePopulerSectionProps> = ({ rutePopuler }) => (
  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg">
          <FaRoute className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-gray-800 dark:text-white">Rute Populer</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Analisis performa rute</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <MdTrendingUp className="w-4 h-4" />
        Trending
      </div>
    </div>
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4">
      <Bar
        data={rutePopuler}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
            }
          },
          scales: {
            x: { 
              grid: { display: false },
              ticks: {
                color: '#6b7280',
                font: { weight: 'bold' }
              }
            },
            y: { 
              grid: { 
                color: 'rgba(107, 114, 128, 0.1)'
              },
              ticks: {
                color: '#6b7280',
                font: { weight: 'bold' }
              }
            }
          },
          elements: {
            bar: {
              borderRadius: 8,
              borderWidth: 0,
            }
          }
        }}
        style={{ height: '300px' }}
      />
    </div>
  </div>
);

export default RutePopulerSection;
