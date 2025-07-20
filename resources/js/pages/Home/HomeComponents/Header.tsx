import React from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { type SharedData } from "@/types";

type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function Header({ title, subtitle, children }: Props) {
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.post(route('logout'));
  };

  return (
    <header className="py-6 sm:py-8 bg-white shadow">
      <div className="container mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-700">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
        <div className="mt-3 sm:mt-0 flex items-center gap-2">
          {user ? (
            <>
              <span className="text-indigo-700 font-semibold mr-2">👤 {user.name}</span>
              {user.role === "admin" ? (
                <Link
                  href={route('dashboard')}
                  className="inline-block rounded-sm border border-indigo-600 px-5 py-1.5 text-sm leading-normal text-indigo-700 hover:bg-indigo-50"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/my-bookings"
                  className="inline-block rounded-sm border border-indigo-600 px-5 py-1.5 text-sm leading-normal text-indigo-700 hover:bg-indigo-50"
                >
                  Booking Saya
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-block rounded-sm border border-red-400 px-5 py-1.5 text-sm leading-normal text-red-600 hover:bg-red-50 ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-block rounded-sm border border-indigo-600 px-5 py-1.5 text-sm leading-normal text-indigo-700 hover:bg-indigo-50"
            >
              Login
            </Link>
          )}
          {children}
        </div>
      </div>
    </header>
  );
}
