"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { clientFetch } from "@/lib/api/clientFetch";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type UserDetail = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";

  pets: {
    id: number;
    name: string;
    species: string;
    breed?: string | null;
  }[];

  appointments: {
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
  }[];
};

async function getUser(
  id: string,
): Promise<UserDetail> {
  const response = await clientFetch(
    `/api/users/${id}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo obtener el cliente",
    );
  }

  return data;
}

export default function AdminUserDetailPage() {
  const params = useParams<{
    id: string;
  }>();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", params.id],
    queryFn: () => getUser(params.id),
  });

  if (isLoading) {
    return <p>Cargando cliente...</p>;
  }

  if (isError || !user) {
    return (
      <p className="text-red-600">
        No se pudo cargar el cliente.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Volver a clientes
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          {user.name}
        </h1>

        <p className="mt-1 text-gray-600">
          {user.email}
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Mascotas
            </h2>

            <p className="text-sm text-gray-500">
              Mascotas registradas por este cliente.
            </p>
          </div>
        </div>

        {user.pets.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-gray-500">
            Este cliente no tiene mascotas registradas.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {user.pets.map((pet) => (
              <article
                key={pet.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold">
                  {pet.name}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {pet.species}
                  {pet.breed
                    ? ` · ${pet.breed}`
                    : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/pets/${pet.id}/clinical-records`}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Historia clínica
                  </Link>

                  <Link
                    href={`/pets/${pet.id}/prescriptions`}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Recetas
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Turnos
          </h2>

          <p className="text-sm text-gray-500">
            Turnos asociados al cliente.
          </p>
        </div>

        {user.appointments.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-gray-500">
            Este cliente no tiene turnos.
          </div>
        ) : (
          <div className="space-y-3">
            {user.appointments.map(
              (appointment) => {
                const date =
                  appointment.slot
                    ? new Date(
                        appointment.slot.startTime,
                      )
                    : null;

                return (
                  <article
                    key={appointment.id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold">
                          {appointment.pet.name}
                        </p>

                        <p className="text-sm text-gray-600">
                          {appointment.reason}
                        </p>

                        {date && (
                          <p className="mt-1 text-sm text-gray-500">
                            {date.toLocaleString(
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

                      <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                        {appointment.status}
                      </span>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}