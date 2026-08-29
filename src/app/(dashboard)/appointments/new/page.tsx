"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useNotificationStore } from "@/stores/useNotificationStore";

type Pet = {
  id: number;
  name: string;
};

type CreateAppointmentPayload = {
  petId: number;
  date: string;
  reason: string;
};

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

async function createAppointment(
  payload: CreateAppointmentPayload,
) {
  const response = await fetch("/api/appointments", {
    method: "POST",
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
        : data.message ?? "No se pudo crear el turno",
    );
  }

  return data;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const [petId, setPetId] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const {
    data: pets,
    isPending: isLoadingPets,
    isError: isPetsError,
    error: petsError,
  } = useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });

  const mutation = useMutation({
    mutationFn: createAppointment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["appointments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pets"],
        }),
      ]);

      showNotification(
        "Turno reservado correctamente",
        "success",
      );

      router.push("/appointments");
    },

    onError: (error) => {
      showNotification(
        error instanceof Error
          ? error.message
          : "No se pudo crear el turno",
        "error",
      );
    },
  });

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    mutation.mutate({
      petId: Number(petId),
      date: new Date(date).toISOString(),
      reason,
    });
  }

  if (isLoadingPets) {
    return <p>Cargando mascotas...</p>;
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

  if (!pets || pets.length === 0) {
    return (
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Nuevo turno
        </h1>

        <p className="mt-4 text-slate-600">
          Primero necesitás registrar una mascota.
        </p>

        <Link
          href="/pets/new"
          className="mt-5 inline-block rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800"
        >
          Registrar mascota
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">
        Nuevo turno
      </h1>

      <p className="mt-2 text-slate-600">
        Reservá un turno para una de tus mascotas.
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
            onChange={(event) => setPetId(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          >
            <option value="">Seleccionar mascota</option>

            {pets.map((pet) => (
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
            onChange={(event) => setDate(event.target.value)}
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
            onChange={(event) => setReason(event.target.value)}
            required
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {mutation.isPending
              ? "Reservando..."
              : "Reservar turno"}
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