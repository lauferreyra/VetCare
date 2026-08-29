"use client";

import Link from "next/link";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/clientFetch";
import { useNotificationStore } from "@/stores/useNotificationStore";

type Appointment = {
  id: number;
};

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
  appointments: Appointment[];
};

async function getPets(): Promise<Pet[]> {
  const response = await clientFetch("/api/pets", {
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

async function deletePet(id: number) {
  const response = await fetch(`/api/pets/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message ?? "No se pudo eliminar la mascota",
    );
  }

  return data;
}

export default function PetsList() {
  const {
    data: pets,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });

  const queryClient = useQueryClient();

const showNotification = useNotificationStore(
  (state) => state.showNotification,
);

const deleteMutation = useMutation({
  mutationFn: deletePet,

  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ["pets"],
    });

    showNotification(
      "Mascota eliminada correctamente",
      "success",
    );
  },

  onError: (error) => {
    showNotification(
      error instanceof Error
        ? error.message
        : "No se pudo eliminar la mascota",
      "error",
    );
  },
});

  if (isPending) {
    return (
      <p className="mt-8 text-slate-600">
        Cargando mascotas...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="mt-8 text-red-600">
        {error instanceof Error
          ? error.message
          : "No se pudieron cargar las mascotas"}
      </p>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-slate-600">
          Todavía no tenés mascotas registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => (
        <article
          key={pet.id}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900">
            {pet.name}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {pet.species}
            {pet.breed ? ` · ${pet.breed}` : ""}
          </p>

          {pet.birthDate && (
            <p className="mt-2 text-sm text-slate-500">
              Nacimiento:{" "}
              {new Date(pet.birthDate).toLocaleDateString(
                "es-AR",
              )}
            </p>
          )}

          <p className="mt-3 text-sm text-slate-500">
            Turnos: {pet.appointments.length}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Link
                href={`/pets/${pet.id}/edit`}
                className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
                Editar
            </Link>
            <Link
                href={`/pets/${pet.id}/clinical-records`}
                className="font-medium text-teal-600 hover:text-teal-700"
              >
                Historia clínica
              </Link>
            <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                const confirmed = window.confirm(
                    `¿Querés eliminar a ${pet.name}?`,
                );

                if (confirmed) {
                    deleteMutation.mutate(pet.id);
                }
                }}
                className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
            >
                Eliminar
            </button>
            </div>
        </article>
      ))}
    </div>
  );
}