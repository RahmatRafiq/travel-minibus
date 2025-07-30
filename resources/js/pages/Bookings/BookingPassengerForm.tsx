
import React from 'react';
import type { BookingPassenger } from '@/types/BookingPassenger';
import InputError from '@/components/input-error';

type Props = {
  passengers: BookingPassenger[];
  setPassengers: (passengers: BookingPassenger[]) => void;
  errors?: Record<string, string | undefined>;
  seatsCount: number;
};


export default function BookingPassengerForm({ passengers, setPassengers, errors, seatsCount }: Props) {
  // Sync passengers array length with seatsCount
  React.useEffect(() => {
    if (passengers.length !== seatsCount) {
      const newPassengers = Array.from({ length: seatsCount }).map((_, i) => passengers[i] || {
        booking_id: 0,
        name: '',
        phone_number: '',
        pickup_address: '',
        pickup_latitude: 0,
        pickup_longitude: 0,
      });
      setPassengers(newPassengers);
    }
  }, [seatsCount, passengers, setPassengers]);

  const handleChange = (idx: number, field: keyof BookingPassenger, value: string | number) => {
    const updated = passengers.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setPassengers(updated);
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Data Penumpang</h2>
      <div className="space-y-6">
        {passengers.map((p, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="border rounded px-2 py-1"
                placeholder={`Nama Penumpang #${idx + 1}`}
                value={p.name}
                onChange={e => handleChange(idx, 'name', e.target.value)}
                required
              />
              <input
                type="text"
                className="border rounded px-2 py-1"
                placeholder="No. WA"
                value={p.phone_number}
                onChange={e => handleChange(idx, 'phone_number', e.target.value)}
              />
              <input
                type="text"
                className="border rounded px-2 py-1"
                placeholder="Alamat Jemput"
                value={p.pickup_address}
                onChange={e => handleChange(idx, 'pickup_address', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                className="border rounded px-2 py-1"
                placeholder="Latitude Jemput"
                value={p.pickup_latitude ?? ''}
                onChange={e => handleChange(idx, 'pickup_latitude', Number(e.target.value))}
              />
              <input
                type="number"
                className="border rounded px-2 py-1"
                placeholder="Longitude Jemput"
                value={p.pickup_longitude ?? ''}
                onChange={e => handleChange(idx, 'pickup_longitude', Number(e.target.value))}
              />
              <InputError message={errors?.[`passengers.${idx}.name`]} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
