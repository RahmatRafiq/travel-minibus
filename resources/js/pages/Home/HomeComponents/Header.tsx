import React from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { type SharedData } from "@/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function Header() {
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.post(route('logout'));
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
          {/* Kanan: Avatar Dropdown */}
          <div className="flex justify-end items-center relative">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                {user ? (
                  <button
                    className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-200 shadow hover:bg-indigo-200 focus:outline-none transition"
                    aria-label="User menu"
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </button>
                ) : (
                  <button
                    className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-200 shadow hover:bg-indigo-200 focus:outline-none transition"
                    aria-label="Login"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                align="end"
                className="z-50 bg-white border border-indigo-100 rounded-lg shadow-lg min-w-[170px] py-2"
              >
                {user ? (
                  <>
                    <DropdownMenu.Label className="px-4 py-2 text-indigo-700 font-semibold whitespace-nowrap">
                      {user.name}
                    </DropdownMenu.Label>
                    <DropdownMenu.Separator className="my-1 h-px bg-indigo-100" />
                    {user.role === "admin" ? (
                      <DropdownMenu.Item asChild>
                        <Link
                          href={route('dashboard')}
                          className="px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition block"
                        >
                          Dashboard
                        </Link>
                      </DropdownMenu.Item>
                    ) : (
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/my-bookings"
                          className="px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition block"
                        >
                          Booking Saya
                        </Link>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item asChild>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left w-full transition"
                      >
                        Logout
                      </button>
                    </DropdownMenu.Item>
                  </>
                ) : (
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition"
                    >
                      Login
                    </Link>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </header>
  );
}
