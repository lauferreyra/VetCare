"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { clientFetch } from "@/lib/api/clientFetch";
import {
  PetFormData,
  petSchema,
} from "@/lib/validations/petSchema";
import { useNotificationStore } from "@/stores/useNotificationStore";

type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
};

async function getPet(id: string): Promise<Pet> {
  const response = await clientFetch(`/api/pets/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudo obtener la mascota",
    );
  }

  return data;
}

async function updatePet(
  id: string,
  data: PetFormData,
) {
  const response = await clientFetch(
    `/api/pets/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        birthDate: data.birthDate || undefined,
      }),
    },
  );

  const responseData = await response.json();

  if (!response.ok) {
    const message = Array.isArray(
      responseData.message,
    )
      ? responseData.message.join(", ")
      : responseData.message;

    throw new Error(
      message ?? "No se pudo actualizar la mascota",
    );
  }

  return responseData;
}

export default function EditPetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification =
    useNotificationStore(
      (state) => state.showNotification,
    );

  const {
    register,
    handleSubmit,
    reset,
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

  const {
    data: pet,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pet", params.id],
    queryFn: () => getPet(params.id),
  });

  useEffect(() => {
    if (!pet) {
      return;
    }

    reset({
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? "",
      birthDate: pet.birthDate
        ? pet.birthDate.slice(0, 10)
        : "",
    });
  }, [pet, reset]);

  const mutation = useMutation({
    mutationFn: (data: PetFormData) =>
      updatePet(params.id, data),

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

  if (isLoading) {
    return <p>Cargando mascota...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        No se pudo cargar la mascota.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Editar mascota
        </h1>

        <p className="mt-1 text-gray-600">
          Modificá los datos de tu mascota.
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
            {...register("species")}
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
              : "Guardar cambios"}
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