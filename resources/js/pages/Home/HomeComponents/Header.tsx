import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { type SharedData } from "@/types";

export default function Header() {
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.post(route('logout'));
    setMenuOpen(false);
  };

  return (
    <header className="py-6 sm:py-8 bg-white shadow">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-2 items-center">
          {/* Kiri: Branding */}
          <div>
            <span className="text-xl sm:text-2xl font-bold text-indigo-700">
              Travel Minibus
            </span>
          </div>
          {/* Kanan: Menu */}
          <div className="flex justify-end items-center relative">
            {/* Desktop menu */}
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              {user ? (
                <>
                  <span className="text-indigo-700 font-semibold mr-2 whitespace-nowrap">👤 {user.name}</span>
                  {user.role === "admin" ? (
                    <Link
                      href={route('dashboard')}
                      className="inline-block rounded-sm border border-indigo-600 px-4 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/my-bookings"
                      className="inline-block rounded-sm border border-indigo-600 px-4 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                    >
                      Booking Saya
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="inline-block rounded-sm border border-red-400 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 ml-0 sm:ml-2 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-block rounded-sm border border-indigo-600 px-4 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                >
                  Login
                </Link>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="flex sm:hidden items-center">
              <button
                className="p-2 rounded-md border border-indigo-200 text-indigo-700 focus:outline-none"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 bg-white border border-indigo-100 rounded-lg shadow-lg min-w-[170px] py-2">
                  {user ? (
                    <div className="flex flex-col">
                      <span className="px-4 py-2 text-indigo-700 font-semibold whitespace-nowrap">👤 {user.name}</span>
                      {user.role === "admin" ? (
                        <Link
                          href={route('dashboard')}
                          className="px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/my-bookings"
                          className="px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          Booking Saya
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
              