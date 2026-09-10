import Link from "next/link";

import AppointmentsList from "@/components/appointments/AppointmentsList";

export default function AppointmentsPage() {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Mis turnos
          </h1>

          <p className="mt-2 text-slate-600">
            Consultá y administrá los turnos de tus mascotas.
          </p>
        </div>

        <Link
          href="/appointments/new"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Nuevo turno
        </Link>
      </div>

      <AppointmentsList />
    </section>
  );
}