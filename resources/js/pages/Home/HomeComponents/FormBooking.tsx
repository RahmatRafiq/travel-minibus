import React, { useMemo } from "react";
import CustomSelect from "@/components/select";
import { DatePicker } from "@/components/DatePicker";

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
  const originOptions = [{ label: "Pilih Origin", value: "" }, ...allOrigins.map(o => ({ label: o, value: o }))];
  const destinationOptions = [{ label: "Pilih Destination", value: "" }, ...allDestinations.map(d => ({ label: d, value: d }))];

  const handleSelectChange = (field: "origin" | "destination") => (selectedOption: any) => {
    const fakeEvent = {
      target: {
        name: field,
        value: selectedOption ? selectedOption.value : "",
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(fakeEvent);
  };

  const dateValue = useMemo(() => {
    if (!form.date) return undefined;
    const parts = form.date.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return undefined;
  }, [form.date]);

  const handleDateChange = (date: Date | null) => {
    const value = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : "";
    const fakeEvent = {
      target: {
        name: "date",
        value,
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(fakeEvent);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
        <CustomSelect
          name="origin"
          value={originOptions.find(option => option.value === form.origin)}
          onChange={handleSelectChange("origin")}
          options={originOptions}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
        <CustomSelect
          name="destination"
          value={destinationOptions.find(option => option.value === form.destination)}
          onChange={handleSelectChange("destination")}
          options={destinationOptions}
          required
        />
      </div>
      <div>
        <DatePicker
          id="booking-date"
          label="Tanggal Berangkat"
          value={dateValue}
          onChange={handleDateChange}
          required
          className="w-full"
          minDate={new Date()}
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
