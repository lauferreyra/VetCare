"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { navigation } from "@/constants/navigation";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-slate-200 bg-white shadow-lg">
          <nav className="flex flex-col px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="#contact"
              onClick={closeMenu}
              className="mt-2 rounded-lg bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-teal-800"
            >
              Reservar turno
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}