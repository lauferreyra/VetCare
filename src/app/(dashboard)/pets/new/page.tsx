"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useNotificationStore } from "@/stores/useNotificationStore";

type CreatePetPayload = {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
};

async function createPet(payload: CreatePetPayload) {
  const response = await fetch("/api/pets", {
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
        : data.message ?? "No se pudo crear la mascota",
    );
  }

  return data;
}

export default function NewPetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const mutation = useMutation({
    mutationFn: createPet,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["pets"],
      });

      showNotification(
        "Mascota creada correctamente",
        "success",
      );

      router.push("/pets");
    },

    onError: (error) => {
      showNotification(
        error instanceof Error
          ? error.message
          : "No se pudo crear la mascota",
        "error",
      );
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    mutation.mutate({
      name,
      species,
      breed: breed || undefined,
      birthDate: birthDate || undefined,
    });
  }

  return (
    <section className="max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Nueva mascota
        </h1>

        <p className="mt-2 text-slate-600">
          Completá los datos de tu mascota.
        </p>
      </div>

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
            onChange={(event) => setName(event.target.value)}
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
            onChange={(event) => setSpecies(event.target.value)}
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
            onChange={(event) => setBreed(event.target.value)}
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
            onChange={(event) => setBirthDate(event.target.value)}
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
              : "Guardar mascota"}
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