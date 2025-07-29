import React, { useState, useRef } from "react";
import { Link, router, Head } from "@inertiajs/react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import Footer from "./HomeComponents/Footer";
import FormBooking from "./HomeComponents/FormBooking";
import BookingList from "./HomeComponents/BookingList";
import Header from "./HomeComponents/Header"; // <--- tambahkan ini

type Booking = {
id: number;
origin: string;
destination: string;
date: string;
seats: number;
status: string;
vehicle: string;
brand: string;
amount: number;
reference: string;
};

type Props = {
  bookings: Booking[];
  isLoggedIn: boolean;
  userName?: string;
  allOrigins?: string[];
  allDestinations?: string[];
  totalAmount?: number;
};

export default function Home({ bookings, isLoggedIn, userName, allOrigins = [], allDestinations = [], totalAmount = 0 }: Props) {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    date: "",
  });

  const [showBookings, setShowBookings] = useState(false);
  const bookingRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect ke halaman booking detail dengan parameter pencarian
    router.get(
      "/booking-detail",
      {
        origin: form.origin,
        destination: form.destination,
        date: form.date,
      }
    );
  };

  const handleScrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShowBookings = () => {
    if (!isLoggedIn) {
      router.get("/login");
      return;
    }
    router.get("/my-bookings");
  };

  const statusIcon = (status: string) => {
    if (status.toLowerCase() === "confirmed")
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    if (status.toLowerCase() === "pending")
      return <Clock className="text-yellow-500 w-5 h-5" />;
    return <XCircle className="text-red-500 w-5 h-5" />;
  };

  // Hanya tampilkan bookings jika sudah login
  const visibleBookings = isLoggedIn ? bookings : [];

  function formatRupiah(amount: number | undefined | null) {
    if (typeof amount !== 'number' || isNaN(amount)) return '-';
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      <Head title="Home - Travel Bone Makassar" />
      <Header
      />
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" className="absolute bottom-0 left-0">
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.10" />
              </linearGradient>
            </defs>
            <path
              fill="url(#heroGrad)"
              d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,176C840,181,960,139,1080,133.3C1200,128,1320,160,1380,176L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
        <div className="container mx-auto px-4 sm:px-6 py-14 sm:py-20 flex flex-col md:flex-row items-center relative z-10">
          <div className="flex-1 space-y-7">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-700 drop-shadow-lg tracking-tight">
              <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-700 bg-clip-text text-transparent">
                Travel Minibus Booking
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-gray-700 dark:text-slate-100 max-w-xl font-medium">
              Pesan perjalanan antar kota dengan mudah, cepat, dan nyaman. Temukan jadwal, pilih kursi, dan nikmati perjalanan Anda bersama kami!
            </p>
            {isLoggedIn && (
              <div className="text-indigo-800 font-semibold text-lg flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                Selamat datang, {userName} 👋
              </div>
            )}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
              <Link
                href="#booking"
                onClick={handleScrollToBooking}
                className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Booking Sekarang
              </Link>
              <button
                onClick={handleShowBookings}
                className="bg-white/70 backdrop-blur border border-indigo-200 text-indigo-700 px-8 py-3 rounded-full font-semibold shadow hover:bg-indigo-50 transition-all duration-200"
              >
                Lihat Booking Saya
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center mt-10 md:mt-0">
            <div className="relative">
              <img
              srcSet="/travel.webp 1x, /travel.png 1x"
              src="/travel.png"
              alt="Ilustrasi Minibus Travel Zazy"
              className="w-64 sm:w-80 md:w-[380px] h-auto drop-shadow-2xl animate-float"
              style={{ animation: "float 3s ease-in-out infinite" }}
              loading="lazy"
              width="380"
              height="240"
              />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur rounded-2xl px-6 py-2 shadow-lg flex items-center gap-2 border border-indigo-100">
              <span className="text-indigo-700 font-bold">#1</span>
              <span className="text-gray-700 dark:text-slate-200 text-sm">Pilihan Travel Modern</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Booking Form Section */}
      <section
        id="booking"
        ref={bookingRef}
        className="container mx-auto px-2 sm:px-4 md:px-6 py-10 sm:py-16 flex flex-col md:flex-row gap-8 md:gap-12"
      >
        <div className="flex-1  rounded-3xl shadow-2xl p-4 sm:p-8 md:p-10 max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-6 flex items-center gap-2 justify-center">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01-8 0M12 3v4m0 0a4 4 0 01-4 4H4m8-4a4 4 0 014 4h4"></path>
            </svg>
            Form Booking
          </h2>
          <FormBooking
            form={form}
            allOrigins={allOrigins}
            allDestinations={allDestinations}
            onChange={handleChange}
            onSubmit={handleBooking}
          />
        </div> 
        <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mt-8 md:mt-0">
          <div className=" backdrop-blur-lg rounded-3xl shadow-2xl p-4 sm:p-8 md:p-10">
            {/* Make BookingList scrollable with fixed max height */}
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <BookingList bookings={visibleBookings} isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        .glassmorphism {
          background: rgba(255,255,255,0.85);
          box-shadow: 0 8px 32px 0 rgba(99,102,241,0.12);
          backdrop-filter: blur(8px);
        }
      `}</style>
      {/* Modal booking dihapus, redirect ke /my-bookings */}
    </div>
  );
}
