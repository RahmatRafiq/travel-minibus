import React from "react";

type Props = {
  form: {
    origin: string;
    destination: string;
    date: string;
  };
  allOrigins: string[];
  allDestinations: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function FormBooking({ form, allOrigins, allDestinations, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
        <select
          name="origin"
          value={form.origin}
          onChange={onChange}
          className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white/80"
          required
        >
          <option value="">Pilih Origin</option>
          {allOrigins.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
        <select
          name="destination"
          value={form.destination}
          onChange={onChange}
          className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white/80"
          required
        >
          <option value="">Pilih Destination</option>
          {allDestinations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berangkat</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={onChange}
          className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-white/80"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-2 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        Pesan Sekarang
      </button>
    </form>
  );
}
