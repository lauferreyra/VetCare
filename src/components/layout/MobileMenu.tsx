"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
        aria-label="Abrir menú"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-slate-200 bg-white shadow-lg">
          <nav className="flex flex-col px-4 py-4">
            <Link
              href="#services"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
            >
              Servicios
            </Link>

            <Link
              href="#about"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
            >
              Nosotros
            </Link>

            <Link
              href="#contact"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
            >
              Contacto
            </Link>

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