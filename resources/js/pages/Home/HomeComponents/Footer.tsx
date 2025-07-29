import React from "react";

export default function Footer() {
  return (
    <footer className="mt-auto py-6 sm:py-8 bg-white/80 dark:bg-indigo-950/90 backdrop-blur border-t border-indigo-100 dark:border-indigo-800 text-center text-gray-500 dark:text-indigo-200 text-xs sm:text-sm shadow-inner">
      <div>
        <span className="font-bold text-indigo-600 dark:text-indigo-300">Zazy Travel</span> &copy; {new Date().getFullYear()} &mdash; All rights reserved.
      </div>
      <div className="mt-2">
        <span className="text-[10px] sm:text-xs">Made with ❤️ by your $100,000 Frontend Engineer</span>
      </div>
    </footer>
  );
}
