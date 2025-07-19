import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function Header({ title, subtitle, children }: Props) {
  return (
    <header className="py-6 sm:py-8 bg-white shadow">
      <div className="container mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-700">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
        {children && <div className="mt-3 sm:mt-0">{children}</div>}
      </div>
    </header>
  );
}
