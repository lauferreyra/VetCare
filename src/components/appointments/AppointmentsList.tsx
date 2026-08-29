"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNotificationStore } from "@/stores/useNotificationStore";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Appointment = {
  id: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  pet: {
    id: number;
    name: string;
  };
};

async function getAppointments(): Promise<Appointment[]> {
  const response = await fetch("/api/appointments", {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudieron cargar los turnos",
    );
  }

  return data;
}

async function cancelAppointment(id: number) {
  const response = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "CANCELLED",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudo cancelar el turno",
    );
  }

  return data;
}

export default function AppointmentsList() {
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const {
    data: appointments,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["appointments"],
      });

      showNotification(
        "Turno cancelado correctamente",
        "success",
      );
    },

    onError: (error) => {
      showNotification(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar el turno",
        "error",
      );
    },
  });

  if (isPending) {
    return (
      <p className="mt-8 text-slate-600">
        Cargando turnos...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="mt-8 text-red-600">
        {error instanceof Error
          ? error.message
          : "No se pudieron cargar los turnos"}
      </p>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-slate-600">
          Todavía no tenés turnos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5">
      {appointments.map((appointment) => (
        <article
          key={appointment.id}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {appointment.pet.name}
              </h2>

              <p className="mt-1 text-slate-600">
                {appointment.reason}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {new Date(appointment.date).toLocaleString(
                  "es-AR",
                )}
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
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  const confirmed = window.confirm(
                    "¿Querés cancelar este turno?",
                  );

                  if (confirmed) {
                    cancelMutation.mutate(appointment.id);
                  }
                }}
                className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}