"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type Props = {
  email: string;
};

export function MobileDashboardMenu({ email }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border p-2"
        aria-label="Abrir menú"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b bg-white p-4 shadow-md">
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <Link
              href="/pets"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Mascotas
            </Link>

            <Link
              href="/appointments"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Turnos
            </Link>

            <Link
              href="/appointments/new"
              onClick={() => setOpen(false)}
              className="block rounded-lg bg-teal-600 px-3 py-2 text-center font-medium text-white"
            >
              + Reservar turno
            </Link>
          </nav>

          <div className="mt-4 border-t pt-4">
            <p className="mb-3 truncate text-sm text-gray-600">
              {email}
            </p>

            <form
              action="/api/auth/logout"
              method="post"
            >
              <button
                type="submit"
                className="text-sm font-medium text-red-600"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}