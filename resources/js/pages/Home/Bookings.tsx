import React, { useEffect } from "react";
import { Link, Head, router } from "@inertiajs/react";
import Header from "./HomeComponents/Header";
import Footer from "./HomeComponents/Footer";
import BookingList from "./HomeComponents/BookingList";

type Booking = {
  id: number;
  origin: string;
  destination: string;
  date: string;
  seats: number;
  status: string;
  vehicle: string;
  brand: string;
  reference: string;
  amount: number;
};

type Props = {
  bookings: Booking[];
  userName?: string;
  isLoggedIn?: boolean;
};

export default function Bookings({ bookings, userName, isLoggedIn }: Props) {
  useEffect(() => {
    if (isLoggedIn === false) {
      router.get("/login");
    }
  }, [isLoggedIn]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-950 flex flex-col">
      <Head title="Daftar Booking - Travel Bone Makassar" />
      <Header />
      <main className="container mx-auto px-2 sm:px-4 md:px-6 py-8 sm:py-12 flex-1 w-full">
        <div className="bg-white dark:bg-indigo-950 rounded-3xl shadow-2xl p-4 sm:p-8 border border-indigo-100 dark:border-indigo-800 max-w-2xl mx-auto w-full">
          <BookingList bookings={bookings} isLoggedIn={isLoggedIn} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
        