"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { useNotificationStore } from "@/stores/useNotificationStore";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Pet = {
  id: number;
  name: string;
};

type Appointment = {
  id: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  petId: number;
};

type UpdateAppointmentPayload = {
  petId: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
};

async function getAppointment(id: string): Promise<Appointment> {
  const response = await fetch(`/api/appointments/${id}`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudo cargar el turno",
    );
  }

  return data;
}

async function getPets(): Promise<Pet[]> {
  const response = await fetch("/api/pets", {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudieron cargar las mascotas",
    );
  }

  return data;
}

async function updateAppointment({
  id,
  payload,
}: {
  id: string;
  payload: UpdateAppointmentPayload;
}) {
  const response = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message ?? "No se pudo actualizar el turno",
    );
  }

  return data;
}

export default function EditAppointmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const [petId, setPetId] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] =
    useState<AppointmentStatus>("PENDING");

  const {
    data: appointment,
    isPending: isLoadingAppointment,
    isError: isAppointmentError,
    error: appointmentError,
  } = useQuery({
    queryKey: ["appointment", params.id],
    queryFn: () => getAppointment(params.id),
  });

  const {
    data: pets,
    isPending: isLoadingPets,
    isError: isPetsError,
    error: petsError,
  } = useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });

  useEffect(() => {
    if (!appointment) {
      return;
    }

    setPetId(String(appointment.petId));
    setReason(appointment.reason);
    setStatus(appointment.status);

    const appointmentDate = new Date(appointment.date);

    const localDate = new Date(
      appointmentDate.getTime() -
        appointmentDate.getTimezoneOffset() * 60_000,
    )
      .toISOString()
      .slice(0, 16);

    setDate(localDate);
  }, [appointment]);

  const mutation = useMutation({
    mutationFn: updateAppointment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["appointments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["appointment", params.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pets"],
        }),
      ]);

      showNotification(
        "Turno actualizado correctamente",
        "success",
      );

      router.push("/appointments");
    },

    onError: (error) => {
      showNotification(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el turno",
        "error",
      );
    },
  });

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    mutation.mutate({
      id: params.id,
      payload: {
        petId: Number(petId),
        date: new Date(date).toISOString(),
        reason,
        status,
      },
    });
  }

  if (isLoadingAppointment || isLoadingPets) {
    return <p>Cargando turno...</p>;
  }

  if (isAppointmentError) {
    return (
      <p className="text-red-600">
        {appointmentError instanceof Error
          ? appointmentError.message
          : "No se pudo cargar el turno"}
      </p>
    );
  }

  if (isPetsError) {
    return (
      <p className="text-red-600">
        {petsError instanceof Error
          ? petsError.message
          : "No se pudieron cargar las mascotas"}
      </p>
    );
  }

  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">
        Editar turno
      </h1>

      <p className="mt-2 text-slate-600">
        Modificá los datos del turno.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="petId"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Mascota
          </label>

          <select
            id="petId"
            value={petId}
            onChange={(event) =>
              setPetId(event.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          >
            {pets?.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Fecha y hora
          </label>

          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="reason"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Motivo
          </label>

          <textarea
            id="reason"
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            required
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Estado
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as AppointmentStatus,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          >
            <option value="PENDING">
              Pendiente
            </option>
            <option value="CONFIRMED">
              Confirmado
            </option>
            <option value="CANCELLED">
              Cancelado
            </option>
            <option value="COMPLETED">
              Completado
            </option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {mutation.isPending
              ? "Guardando..."
              : "Guardar cambios"}
          </button>

          <Link
            href="/appointments"
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}