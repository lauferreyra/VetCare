"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { clientFetch } from "@/lib/api/clientFetch";
import {
  PetFormData,
  petSchema,
} from "@/lib/validations/petSchema";
import { useNotificationStore } from "@/stores/useNotificationStore";

async function createPet(data: PetFormData) {
  const response = await clientFetch("/api/pets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      species: data.species,
      breed: data.breed || undefined,
      birthDate: data.birthDate || undefined,
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const message = Array.isArray(responseData.message)
      ? responseData.message.join(", ")
      : responseData.message;

    throw new Error(
      message ?? "No se pudo crear la mascota",
    );
  }

  return responseData;
}

export default function NewPetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification =
    useNotificationStore(
      (state) => state.showNotification,
    );

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      birthDate: "",
    },
  });

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

    onError: (error: Error) => {
      showNotification(
        error.message,
        "error",
      );
    },
  });

  function onSubmit(data: PetFormData) {
    mutation.mutate(data);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Nueva mascota
        </h1>

        <p className="mt-1 text-gray-600">
          Registrá una nueva mascota.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium"
          >
            Nombre
          </label>

          <input
            id="name"
            type="text"
            {...register("name")}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-teal-500"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="species"
            className="mb-1 block text-sm font-medium"
          >
            Especie
          </label>

          <input
            id="species"
            type="text"
            {...register("species")}
            placeholder="Perro, gato..."
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-teal-500"
          />

          {errors.species && (
            <p className="mt-1 text-sm text-red-600">
              {errors.species.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="breed"
            className="mb-1 block text-sm font-medium"
          >
            Raza
          </label>

          <input
            id="breed"
            type="text"
            {...register("breed")}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label
            htmlFor="birthDate"
            className="mb-1 block text-sm font-medium"
          >
            Fecha de nacimiento
          </label>

          <input
            id="birthDate"
            type="date"
            {...register("birthDate")}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              mutation.isPending
            }
            className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending
              ? "Guardando..."
              : "Guardar mascota"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/pets")}
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}