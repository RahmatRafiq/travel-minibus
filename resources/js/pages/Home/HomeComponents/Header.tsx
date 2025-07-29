import React from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { type SharedData } from "@/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function Header() {
  // Theme-aware classes
  // You can add a custom hook/useAppearance if needed for theme switching
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.post(route('logout'));
  };

  // Custom theme toggle tab
  const [appearance, setAppearance] = React.useState<'light' | 'dark' | 'system'>(typeof window !== 'undefined' && window.localStorage.getItem('appearance') as any || 'system');
  const themeTabs = [
    { value: 'light', label: 'Light', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
    ) },
    { value: 'dark', label: 'Dark', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
    ) },
    { value: 'system', label: 'System', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 2h8" /></svg>
    ) },
  ];

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('appearance', appearance);
    document.documentElement.classList.remove('light', 'dark');
    if (appearance === 'light') document.documentElement.classList.add('light');
    else if (appearance === 'dark') document.documentElement.classList.add('dark');
    // system: biarkan default
  }, [appearance]);

  function ThemeToggleTab() {
    return (
      <div className="inline-flex gap-1 rounded-lg bg-indigo-50 dark:bg-slate-800 p-1">
        {themeTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setAppearance(tab.value as any)}
            className={
              'flex items-center gap-2 rounded-md px-3.5 py-1.5 font-semibold transition-colors duration-150 ' +
              (appearance === tab.value
                ? 'bg-indigo-600 text-white shadow dark:bg-indigo-500'
                : 'text-indigo-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700')
            }
            style={{ boxShadow: appearance === tab.value ? '0 2px 8px rgba(99,102,241,0.12)' : undefined }}
          >
            {tab.icon}
            <span className="ml-1.5 text-sm">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <header className="py-6 sm:py-8 bg-white dark:bg-slate-900 shadow">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-2 items-center">
          <div>
            <Link href="/" className="block text-xl sm:text-2xl font-bold text-indigo-700 dark:text-slate-100 hover:underline">
              Zazy Travel
            </Link>
            <span className="block text-base sm:text-lg text-indigo-500 dark:text-slate-400 font-medium">
              Bone Makassar
            </span>
          </div>
          <div className="flex justify-end items-center relative">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                {user ? (
                  <button
                    className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-bold text-lg border border-indigo-200 dark:border-indigo-800 shadow hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none transition"
                    aria-label="User menu"
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </button>
                ) : (
                  <button
                    className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-bold text-lg border border-indigo-200 dark:border-indigo-800 shadow hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none transition"
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
                className="z-50 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-lg shadow-lg min-w-[210px] py-2"
              >
                {user ? (
                  <>
                    <DropdownMenu.Label className="px-4 py-2 text-indigo-700 dark:text-slate-100 font-semibold whitespace-nowrap">
                      {user.name}
                    </DropdownMenu.Label>
                    <DropdownMenu.Separator className="my-1 h-px bg-indigo-100 dark:bg-slate-700" />
                    <div className="px-4 py-2">
                      <ThemeToggleTab />
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-indigo-100 dark:bg-slate-700" />
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/profile"
                        className="px-4 py-2 text-sm text-indigo-700 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-700 transition block"
                      >
                        Profil Saya
                      </Link>
                    </DropdownMenu.Item>
                    {user.role === "admin" ? (
                      <DropdownMenu.Item asChild>
                        <Link
                          href={route('dashboard')}
                          className="px-4 py-2 text-sm text-indigo-700 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-700 transition block"
                        >
                          Dashboard
                        </Link>
                      </DropdownMenu.Item>
                    ) : (
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/my-bookings"
                          className="px-4 py-2 text-sm text-indigo-700 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-700 transition block"
                        >
                          Booking Saya
                        </Link>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item asChild>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-900 text-left w-full transition"
                      >
                        Logout
                      </button>
                    </DropdownMenu.Item>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2">
                      <ThemeToggleTab />
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-indigo-100 dark:bg-slate-700" />
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-indigo-700 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
                      >
                        Login
                      </Link>
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </header>
  );
}
