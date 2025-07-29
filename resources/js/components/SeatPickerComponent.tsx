import React from "react";
import { Armchair as SeatIcon, User as DriverIcon } from "lucide-react";

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
      <div className="flex gap-4 items-center mb-2">
        <div className="flex items-center gap-1">
          <span className="w-6 h-6 rounded bg-red-500 border border-gray-400 flex items-center justify-center">
            <SeatIcon size={16} className="text-white" />
          </span>
          <span className="text-xs text-gray-700">Sudah dipesan</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-6 h-6 rounded bg-green-600 border border-gray-400 flex items-center justify-center">
            <SeatIcon size={16} className="text-white" />
          </span>
          <span className="text-xs text-gray-700">Dipilih</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-6 h-6 rounded bg-gray-100 border border-gray-400 flex items-center justify-center">
            <SeatIcon size={16} className="text-gray-500" />
          </span>
          <span className="text-xs text-gray-700">Tersedia</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-6 h-6 rounded bg-yellow-400 border border-gray-400 flex items-center justify-center">
            <DriverIcon size={16} className="text-white" />
          </span>
          <span className="text-xs text-gray-700">Sopir</span>
        </div>
      </div>
      <h3 className="mb-2 font-bold text-center text-blue-700 text-lg">Pilih Kursi Minibus</h3>
      <div className="flex flex-col gap-4 items-center bg-gray-50 p-6 rounded-xl shadow-lg">
        {seatLayout.map((row, i) => {
          const seatCount = row.filter(seat => seat !== null).length;
          return (
            <div key={`row-${i}`} className="flex justify-center items-center w-full px-0 gap-1 mb-4">
              {row.map((seat, idx) =>
                seat ? (
                  <div key={`row-${i}-seat-${idx}`} className={`relative group${idx !== row.length - 1 ? ' mr-0' : ''}`}>
                    <button
                      type="button"
                      disabled={reservedSeats.includes(seat.id) || seat.isReserved || seat.isDriver}
                      onClick={() => handleSeatClick(seat)}
                      className={`w-12 h-12 rounded-lg border flex items-center justify-center text-base font-bold
                        ${seat.isDriver ? "bg-yellow-400 text-white" : reservedSeats.includes(seat.id) || seat.isReserved ? "bg-red-500 text-white" : selectedSeats.includes(seat.id) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}
                        border-gray-400 shadow-lg hover:scale-110 transition-all duration-150`}
                      title={seat.isDriver ? "Sopir" : reservedSeats.includes(seat.id) || seat.isReserved ? "Sudah dipesan" : "Kursi tersedia"}
                      aria-label={seat.isDriver ? "Sopir" : reservedSeats.includes(seat.id) || seat.isReserved ? "Sudah dipesan" : `Kursi ${seat.number}`}
                    >
                      {seat.isDriver
                        ? <DriverIcon size={28} strokeWidth={2.5} className="mx-auto" />
                        : <SeatIcon size={28} strokeWidth={2.5} className="mx-auto" />
                      }
                    </button>
                    {seat.isDriver && (
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-yellow-700 font-semibold">Sopir</span>
                    )}
                  </div>
                ) : (
                  <div key={`row-${i}-aisle-${idx}`} className="w-0 h-12"></div>
                )
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-center">Kursi dipilih: <span className="font-bold">{selectedSeats.join(", ")}</span></div>
    </div>
  );
};

export default SeatPickerComponent;
export { generateMinibusLayout };
