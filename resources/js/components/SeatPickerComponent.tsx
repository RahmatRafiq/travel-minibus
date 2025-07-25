import React, { useState } from "react";

type Seat = {
  id: string | number;
  number: string;
  isReserved: boolean;
  isDriver?: boolean;
};

type SeatPickerProps = {
  layout?: Array<Array<Seat | null>>; // layout dinamis, null untuk lorong
  reservedSeats?: (string|number)[];
  selectedSeats?: (string|number)[];
  onSelect?: (seats: (string|number)[]) => void;
};

// Fungsi untuk generate layout minibus dinamis
function generateMinibusLayout(seatCount: number, rowConfig: number[] = [2,2,2,2], withDriver: boolean = true): Array<Array<Seat|null>> {
  // rowConfig: jumlah kursi per baris (tanpa lorong)
  // misal [2,2,2,2] => 4 baris, masing-masing 2 kursi
  let seatNum = 1;
  const layout: Array<Array<Seat|null>> = [];
  for (let i = 0; i < rowConfig.length; i++) {
    const row: Array<Seat|null> = [];
    if (i === 0 && withDriver) {
      // Baris depan: penumpang kiri, sopir kanan
      row.push({ id: seatNum, number: String(seatNum), isReserved: false });
      seatNum++;
      row.push(null); // lorong
      row.push({ id: "D", number: "Sopir", isReserved: true, isDriver: true });
    } else {
      // Baris lain: kursi kiri, lorong, kursi kanan
      if (rowConfig[i] === 1) {
        row.push({ id: seatNum, number: String(seatNum), isReserved: false });
        seatNum++;
      } else if (rowConfig[i] === 2) {
        row.push({ id: seatNum, number: String(seatNum), isReserved: false });
        seatNum++;
        row.push(null); // lorong
        row.push({ id: seatNum, number: String(seatNum), isReserved: false });
        seatNum++;
      } else {
        // Untuk baris dengan lebih dari 2 kursi, bagi dua dan sisipkan lorong di tengah
        const left = Math.ceil(rowConfig[i]/2);
        const right = rowConfig[i] - left;
        for (let l = 0; l < left; l++) {
          row.push({ id: seatNum, number: String(seatNum), isReserved: false });
          seatNum++;
        }
        row.push(null); // lorong
        for (let r = 0; r < right; r++) {
          row.push({ id: seatNum, number: String(seatNum), isReserved: false });
          seatNum++;
        }
      }
    }
    layout.push(row);
  }
  return layout;
}

const SeatPickerComponent: React.FC<SeatPickerProps> = ({ layout, reservedSeats = [], selectedSeats = [], onSelect }) => {
  // Jika layout tidak diberikan, gunakan default minibus 7 seat + sopir
  const defaultLayout = generateMinibusLayout(8, [2,2,2,2], true);
  const seatLayout = layout || defaultLayout;

  const handleSeatClick = (seat: Seat) => {
    if (seat.isReserved || seat.isDriver) return;
    let newSeats: (string|number)[];
    if (selectedSeats.includes(seat.id)) {
      newSeats = selectedSeats.filter((id) => id !== seat.id);
    } else {
      newSeats = [...selectedSeats, seat.id];
    }
    if (onSelect) onSelect(newSeats);
  };

  return (
    <div>
      <h3 className="mb-2 font-semibold text-center">Pilih Kursi Minibus</h3>
      <div className="flex flex-col gap-4 items-center bg-gray-50 p-6 rounded-xl shadow-lg">
        {seatLayout.map((row, i) => (
          <div key={i} className="flex gap-8 justify-center">
            {row.map((seat, idx) =>
              seat ? (
                <div key={seat.id} className="relative group">
                  <button
                    type="button"
                    disabled={reservedSeats.includes(seat.id) || seat.isReserved || seat.isDriver}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center text-base font-bold
                      ${seat.isDriver ? "bg-yellow-500 text-white" : reservedSeats.includes(seat.id) || seat.isReserved ? "bg-red-400 text-white" : selectedSeats.includes(seat.id) ? "bg-green-500 text-white" : "bg-white"}
                      border-gray-400 shadow-lg hover:scale-110 transition-all duration-150`}
                    title={seat.isDriver ? "Sopir" : reservedSeats.includes(seat.id) || seat.isReserved ? "Sudah dipesan" : "Kursi tersedia"}
                    aria-label={seat.isDriver ? "Sopir" : reservedSeats.includes(seat.id) || seat.isReserved ? "Sudah dipesan" : `Kursi ${seat.number}`}
                  >
                    {seat.isDriver ? <span>🚗</span> : seat.number}
                  </button>
                  {seat.isDriver && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-yellow-700 font-semibold">Sopir</span>
                  )}
                  {reservedSeats.includes(seat.id) || seat.isReserved ? (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-red-700 font-semibold">Reserved</span>
                  ) : null}
                  {selectedSeats.includes(seat.id) && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-green-700 font-semibold">Dipilih</span>
                  )}
                </div>
              ) : (
                // Lorong/tengah
                <div key={idx} className="w-12 h-12"></div>
              )
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-center">Kursi dipilih: <span className="font-bold">{selectedSeats.join(", ")}</span></div>
    </div>
  );
};

export default SeatPickerComponent;
export { generateMinibusLayout };
