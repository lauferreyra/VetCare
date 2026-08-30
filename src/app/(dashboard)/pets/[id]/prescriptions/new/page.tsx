"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { clientFetch } from "@/lib/api/clientFetch";
import {
  PrescriptionFormData,
  prescriptionSchema,
} from "@/lib/validations/prescriptionSchema";
import { useNotificationStore } from "@/stores/useNotificationStore";

export default function NewPrescriptionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      date: "",
      medication: "",
      dosage: "",
      instructions: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PrescriptionFormData) => {
      const response = await clientFetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId: Number(params.id),
          date: data.date || undefined,
          medication: data.medication,
          dosage: data.dosage,
          instructions: data.instructions || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "No se pudo crear la receta",
        );
      }

      return result;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["prescriptions", params.id],
      });

      showNotification(
        "Receta creada correctamente",
        "success",
      );

      router.push(`/pets/${params.id}/prescriptions`);
    },

    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/pets/${params.id}/prescriptions`}
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
      >
        <ArrowLeft size={16} />
        Volver a recetas
      </Link>

      <h1 className="mb-8 text-2xl font-bold">
        Nueva receta
      </h1>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Fecha
          </label>

          <input
            type="date"
            {...register("date")}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Medicamento
          </label>

          <input
            {...register("medication")}
            className="w-full rounded-lg border px-3 py-2"
          />

          {errors.medication && (
            <p className="mt-1 text-sm text-red-600">
              {errors.medication.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Dosis
          </label>

          <input
            {...register("dosage")}
            className="w-full rounded-lg border px-3 py-2"
          />

          {errors.dosage && (
            <p className="mt-1 text-sm text-red-600">
              {errors.dosage.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Indicaciones
          </label>

          <textarea
            {...register("instructions")}
            rows={4}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {mutation.isPending
            ? "Guardando..."
            : "Guardar receta"}
        </button>
      </form>
    </div>
  );
}