"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  email: string;
  role: "USER" | "ADMIN";
};

export function MobileDashboardMenu({
  email,
  role,
}: Props) {
  const [open, setOpen] = useState(false);

  const isAdmin = role === "ADMIN";

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-lg border px-3 py-2 text-sm font-medium"
      >
        Menú
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border bg-white p-4 shadow-lg">
          <p className="truncate text-sm font-medium text-gray-900">
            {email}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {isAdmin
              ? "Administrador"
              : "Cliente"}
          </p>

          <nav className="mt-4 space-y-1">
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
            >
              Dashboard
            </Link>

            {isAdmin ? (
              <>
                <Link
                  href="/admin/users"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Clientes
                </Link>

                <Link
                  href="/admin/pets"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Mascotas
                </Link>

                <Link
                  href="/admin/appointments"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Turnos
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/pets"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Mis mascotas
                </Link>

                <Link
                  href="/appointments"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Mis turnos
                </Link>

                <Link
                  href="/appointments/new"
                  onClick={closeMenu}
                  className="mt-2 block rounded-lg bg-teal-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-teal-700"
                >
                  + Reservar turno
                </Link>
              </>
            )}
          </nav>

          <div className="mt-4 border-t pt-4">
            <form
              action="/api/auth/logout"
              method="post"
            >
              <button
                type="submit"
                className="text-sm font-medium text-red-600 hover:text-red-700"
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