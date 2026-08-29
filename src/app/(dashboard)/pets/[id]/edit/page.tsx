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

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
};

type UpdatePetPayload = {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
};

async function getPet(id: string): Promise<Pet> {
  const response = await fetch(`/api/pets/${id}`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudo cargar la mascota",
    );
  }

  return data;
}

async function updatePet({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePetPayload;
}) {
  const response = await fetch(`/api/pets/${id}`, {
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
        : data.message ?? "No se pudo actualizar la mascota",
    );
  }

  return data;
}

export default function EditPetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const {
    data: pet,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["pet", params.id],
    queryFn: () => getPet(params.id),
  });

  useEffect(() => {
    if (!pet) {
      return;
    }

    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed ?? "");

    if (pet.birthDate) {
      setBirthDate(
        new Date(pet.birthDate)
          .toISOString()
          .slice(0, 10),
      );
    }
  }, [pet]);

  const mutation = useMutation({
    mutationFn: updatePet,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["pets"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pet", params.id],
        }),
      ]);

      showNotification(
        "Mascota actualizada correctamente",
        "success",
      );

      router.push("/pets");
    },

    onError: (error) => {
      showNotification(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la mascota",
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
        name,
        species,
        breed: breed || undefined,
        birthDate: birthDate || undefined,
      },
    });
  }

  if (isPending) {
    return <p>Cargando mascota...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        {error instanceof Error
          ? error.message
          : "No se pudo cargar la mascota"}
      </p>
    );
  }

  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">
        Editar mascota
      </h1>

      <p className="mt-2 text-slate-600">
        Modificá los datos de {pet.name}.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Nombre
          </label>

          <input
            id="name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="species"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Especie
          </label>

          <input
            id="species"
            value={species}
            onChange={(event) =>
              setSpecies(event.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="breed"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Raza
          </label>

          <input
            id="breed"
            value={breed}
            onChange={(event) =>
              setBreed(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="birthDate"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Fecha de nacimiento
          </label>

          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(event) =>
              setBirthDate(event.target.value)
            }
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
              ? "Guardando..."
              : "Guardar cambios"}
          </button>

          <Link
            href="/pets"
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}