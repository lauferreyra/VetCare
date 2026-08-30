"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";

import { clientFetch } from "@/lib/api/clientFetch";
import { useNotificationStore } from "@/stores/useNotificationStore";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Appointment = {
  id: number;
  reason: string;
  status: AppointmentStatus;

  slot: {
    id: number;
    startTime: string;
  } | null;

  pet: {
    id: number;
    name: string;

    owner: {
      id: number;
      name: string;
      email: string;
    };
  };
};

async function getAppointments(): Promise<
  Appointment[]
> {
  const response = await clientFetch(
    "/api/admin/appointments",
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudieron obtener los turnos",
    );
  }

  return data;
}

async function confirmAppointment(id: number) {
  const response = await clientFetch(
    `/api/appointments/${id}/confirm`,
    {
      method: "PATCH",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo confirmar el turno",
    );
  }

  return data;
}

async function completeAppointment(id: number) {
  const response = await clientFetch(
    `/api/appointments/${id}/complete`,
    {
      method: "PATCH",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo completar el turno",
    );
  }

  return data;
}

export default function AdminAppointmentsPage() {
  const queryClient = useQueryClient();

  const showNotification =
    useNotificationStore(
      (state) => state.showNotification,
    );

  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: getAppointments,
  });

  async function refreshAppointments() {
    await queryClient.invalidateQueries({
      queryKey: ["admin-appointments"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["appointments"],
    });
  }

  const confirmMutation = useMutation({
    mutationFn: confirmAppointment,

    onSuccess: async () => {
      await refreshAppointments();

      showNotification(
        "Turno confirmado correctamente",
        "success",
      );
    },

    onError: (error: Error) => {
      showNotification(
        error.message,
        "error",
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeAppointment,

    onSuccess: async () => {
      await refreshAppointments();

      showNotification(
        "Turno completado correctamente",
        "success",
      );
    },

    onError: (error: Error) => {
      showNotification(
        error.message,
        "error",
      );
    },
  });

  function handleConfirm(id: number) {
    const confirmed = window.confirm(
      "¿Querés confirmar este turno?",
    );

    if (!confirmed) return;

    confirmMutation.mutate(id);
  }

  function handleComplete(id: number) {
    const confirmed = window.confirm(
      "¿Querés marcar este turno como completado?",
    );

    if (!confirmed) return;

    completeMutation.mutate(id);
  }

  if (isLoading) {
    return <p>Cargando turnos...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        No se pudieron cargar los turnos.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Turnos
        </h1>

        <p className="mt-1 text-gray-600">
          Administrá todos los turnos registrados
          en VetCare.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  Fecha
                </th>

                <th className="px-4 py-3">
                  Cliente
                </th>

                <th className="px-4 py-3">
                  Mascota
                </th>

                <th className="px-4 py-3">
                  Motivo
                </th>

                <th className="px-4 py-3">
                  Estado
                </th>

                <th className="px-4 py-3">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {appointments.map(
                (appointment) => {
                  const date =
                    appointment.slot
                      ? new Date(
                          appointment.slot.startTime,
                        )
                      : null;

                  return (
                    <tr
                      key={appointment.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        {date
                          ? date.toLocaleString(
                              "es-AR",
                              {
                                timeZone:
                                  "America/Argentina/Buenos_Aires",
                                dateStyle:
                                  "short",
                                timeStyle:
                                  "short",
                              },
                            )
                          : "-"}
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${appointment.pet.owner.id}`}
                          className="font-medium text-teal-600 hover:text-teal-700"
                        >
                          {
                            appointment.pet
                              .owner.name
                          }
                        </Link>

                        <p className="text-xs text-gray-500">
                          {
                            appointment.pet
                              .owner.email
                          }
                        </p>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {appointment.pet.name}
                      </td>

                      <td className="px-4 py-3">
                        {appointment.reason}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                          {appointment.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {appointment.status ===
                            "PENDING" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleConfirm(
                                  appointment.id,
                                )
                              }
                              disabled={
                                confirmMutation.isPending
                              }
                              className="font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50"
                            >
                              Confirmar
                            </button>
                          )}

                          {appointment.status ===
                            "CONFIRMED" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleComplete(
                                  appointment.id,
                                )
                              }
                              disabled={
                                completeMutation.isPending
                              }
                              className="font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            >
                              Completar
                            </button>
                          )}

                          {appointment.status ===
                            "CANCELLED" && (
                            <span className="text-gray-400">
                              Sin acciones
                            </span>
                          )}

                          {appointment.status ===
                            "COMPLETED" && (
                            <span className="text-gray-400">
                              Finalizado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>

        {appointments.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay turnos registrados.
          </div>
        )}
      </div>
    </div>
  );
}