"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  createdAt: string;
};

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Appointment = {
  id: number;
  reason: string;
  status: AppointmentStatus;
  pet: {
    id: number;
    name: string;
  };
  slot: {
    id: number;
    startTime: string;
  } | null;
};

async function getPets(): Promise<Pet[]> {
  const response = await fetch("/api/pets");

  if (!response.ok) {
    throw new Error("Error al obtener mascotas");
  }

  return response.json();
}

async function getAppointments(): Promise<Appointment[]> {
  const response = await fetch("/api/appointments");

  if (!response.ok) {
    throw new Error("Error al obtener turnos");
  }

  return response.json();
}

function getStatusLabel(status: AppointmentStatus) {
  const labels: Record<AppointmentStatus, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
    COMPLETED: "Completado",
  };

  return labels[status];
}

export default function DashboardPage() {
  const {
    data: pets = [],
    isLoading: isLoadingPets,
    isError: isPetsError,
  } = useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });

  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
    isError: isAppointmentsError,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });

  if (isLoadingPets || isLoadingAppointments) {
    return <p>Cargando dashboard...</p>;
  }

  if (isPetsError || isAppointmentsError) {
    return (
      <p className="text-red-600">
        No se pudo cargar el dashboard.
      </p>
    );
  }

  const now = new Date();

  const recentPets = [...pets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  const activeAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "PENDING" ||
        appointment.status === "CONFIRMED",
    );

  const upcomingAppointments =
    activeAppointments
      .filter((appointment) => {
        if (!appointment.slot) {
          return false;
        }

        return (
          new Date(
            appointment.slot.startTime,
          ) > now
        );
      })
      .sort((a, b) => {
        return (
          new Date(
            a.slot!.startTime,
          ).getTime() -
          new Date(
            b.slot!.startTime,
          ).getTime()
        );
      })
      .slice(0, 3);

  const pendingCount =
    activeAppointments.filter(
      (appointment) =>
        appointment.status === "PENDING",
    ).length;

  const confirmedCount =
    activeAppointments.filter(
      (appointment) =>
        appointment.status === "CONFIRMED",
    ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-600">
          Resumen de tus mascotas y turnos
        </p>
      </div>

      {/* MÉTRICAS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Mascotas
          </p>

          <p className="mt-2 text-3xl font-bold">
            {pets.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Próximos turnos
          </p>

          <p className="mt-2 text-3xl font-bold">
            {upcomingAppointments.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pendientes
          </p>

          <p className="mt-2 text-3xl font-bold">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Confirmados
          </p>

          <p className="mt-2 text-3xl font-bold">
            {confirmedCount}
          </p>
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Acciones rápidas
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/pets/new"
            className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
          >
            + Nueva mascota
          </Link>

          <Link
            href="/appointments/new"
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            + Reservar turno
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ÚLTIMAS MASCOTAS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Últimas mascotas
            </h2>

            <Link
              href="/pets"
              className="text-sm font-medium text-teal-600"
            >
              Ver todas
            </Link>
          </div>

          {recentPets.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-gray-600">
              Todavía no registraste mascotas.
            </div>
          ) : (
            <div className="space-y-3">
              {recentPets.map((pet) => (
                <div
                  key={pet.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {pet.name}
                      </p>

                      <p className="text-sm text-gray-600">
                        {pet.species}
                        {pet.breed
                          ? ` · ${pet.breed}`
                          : ""}
                      </p>
                    </div>

                    <Link
                      href={`/pets/${pet.id}/edit`}
                      className="text-sm font-medium text-teal-600"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PRÓXIMOS TURNOS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Próximos turnos
            </h2>

            <Link
              href="/appointments"
              className="text-sm font-medium text-teal-600"
            >
              Ver todos
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-gray-600">
              No tenés próximos turnos.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map(
                (appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {
                            appointment.pet
                              .name
                          }
                        </p>

                        <p className="text-sm text-gray-600">
                          {
                            appointment.reason
                          }
                        </p>

                        {appointment.slot && (
                          <p className="mt-2 text-sm text-gray-500">
                            {new Date(
                              appointment.slot.startTime,
                            ).toLocaleString(
                              "es-AR",
                              {
                                timeZone:
                                  "America/Argentina/Buenos_Aires",
                                dateStyle:
                                  "medium",
                                timeStyle:
                                  "short",
                              },
                            )}
                          </p>
                        )}
                      </div>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                        {getStatusLabel(
                          appointment.status,
                        )}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}