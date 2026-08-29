import { cookies } from "next/headers";
import Link from "next/link";
import CancelAppointmentButton from "@/components/appointments/CancelAppointmentButton";

const API_URL = process.env.API_URL;

type Appointment = {
  id: number;
  date: string;
  reason: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  pet: {
    id: number;
    name: string;
    species: string;
  };
};

async function getAppointments(): Promise<Appointment[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const response = await fetch(`${API_URL}/appointments`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los turnos");
  }

  return response.json();
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <section>
      <div className="flex items-center justify-between">
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
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
        >
          Nuevo turno
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-slate-600">
            Todavía no tenés turnos registrados.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {appointment.pet.name}
                  </h2>

                  <p className="mt-1 text-slate-600">
                    {appointment.reason}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {new Date(appointment.date).toLocaleString("es-AR")}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {appointment.status}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4">
              <Link
                href={`/appointments/${appointment.id}/edit`}
                className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                Editar
              </Link>

              {appointment.status !== "CANCELLED" && (
                <CancelAppointmentButton
                  appointmentId={appointment.id}
                />
              )}
            </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}