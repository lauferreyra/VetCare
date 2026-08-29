"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

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
  pet: {
    id: number;
    name: string;
  };
  slot: {
    id: number;
    startTime: string;
  } | null;
};

async function getAppointments(): Promise<Appointment[]> {
  const response = await fetch("/api/appointments");

  if (!response.ok) {
    throw new Error("Error al obtener los turnos");
  }

  return response.json();
}

async function cancelAppointment(id: number) {
  const response = await fetch(
    `/api/appointments/${id}/cancel`,
    {
      method: "PATCH",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "Error al cancelar el turno",
    );
  }

  return data;
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

function getStatusClasses(status: AppointmentStatus) {
  const classes: Record<AppointmentStatus, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-800",
    CONFIRMED:
      "bg-green-100 text-green-800",
    CANCELLED:
      "bg-red-100 text-red-800",
    COMPLETED:
      "bg-gray-100 text-gray-700",
  };

  return classes[status];
}

export default function AppointmentsList() {
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["appointments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pets"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["availability"],
        }),
      ]);

      showNotification(
        "Turno cancelado correctamente",
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

  function handleCancel(id: number) {
    const confirmed = window.confirm(
      "¿Querés cancelar este turno?",
    );

    if (!confirmed) {
      return;
    }

    cancelMutation.mutate(id);
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

  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="mb-4 text-gray-600">
          Todavía no tenés turnos reservados.
        </p>

        <Link
          href="/appointments/new"
          className="font-medium text-teal-600"
        >
          Reservar primer turno
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const canModify =
          appointment.status === "PENDING" ||
          appointment.status === "CONFIRMED";

        const appointmentDate = appointment.slot
          ? new Date(appointment.slot.startTime)
          : null;

        return (
          <article
            key={appointment.id}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {appointment.pet.name}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                      appointment.status,
                    )}`}
                  >
                    {getStatusLabel(
                      appointment.status,
                    )}
                  </span>
                </div>

                <p className="text-gray-700">
                  {appointment.reason}
                </p>

                {appointmentDate && (
                  <p className="mt-2 text-sm text-gray-500">
                    {appointmentDate.toLocaleString(
                      "es-AR",
                      {
                        timeZone:
                          "America/Argentina/Buenos_Aires",
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </p>
                )}
              </div>

              {canModify && (
                <div className="flex gap-3">
                  <Link
                    href={`/appointments/${appointment.id}/edit`}
                    className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Editar
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleCancel(
                        appointment.id,
                      )
                    }
                    disabled={
                      cancelMutation.isPending
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}