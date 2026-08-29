"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { clientFetch } from "@/lib/api/clientFetch";
import {
  clinicalRecordSchema,
  ClinicalRecordFormData,
} from "@/lib/validations/clinicalRecordSchema";
import { useNotificationStore } from "@/stores/useNotificationStore";

export default function NewClinicalRecordPage() {
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
  } = useForm<ClinicalRecordFormData>({
    resolver: zodResolver(clinicalRecordSchema),
    defaultValues: {
      date: "",
      reason: "",
      diagnosis: "",
      treatment: "",
      observations: "",
      weight: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ClinicalRecordFormData) => {
      const response = await clientFetch("/api/clinical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId: Number(params.id),
          date: data.date || undefined,
          reason: data.reason,
          diagnosis: data.diagnosis,
          treatment: data.treatment || undefined,
          observations: data.observations || undefined,
          weight: data.weight,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ?? "No se pudo crear el registro clínico",
        );
      }

      return result;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clinical-records", params.id],
      });

      showNotification(
        "Registro clínico creado correctamente",
        "success",
      );

      router.push(`/pets/${params.id}/clinical-records`);
    },

    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  const onSubmit = (data: ClinicalRecordFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/pets/${params.id}/clinical-records`}
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
      >
        <ArrowLeft size={16} />
        Volver a historia clínica
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Nuevo registro clínico
        </h1>

        <p className="mt-2 text-gray-600">
          Registrá la información correspondiente a la consulta veterinaria.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
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
            Motivo
          </label>

          <input
            {...register("reason")}
            className="w-full rounded-lg border px-3 py-2"
          />

          {errors.reason && (
            <p className="mt-1 text-sm text-red-600">
              {errors.reason.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Diagnóstico
          </label>

          <textarea
            {...register("diagnosis")}
            rows={3}
            className="w-full rounded-lg border px-3 py-2"
          />

          {errors.diagnosis && (
            <p className="mt-1 text-sm text-red-600">
              {errors.diagnosis.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Tratamiento
          </label>

          <textarea
            {...register("treatment")}
            rows={3}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Observaciones
          </label>

          <textarea
            {...register("observations")}
            rows={3}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Peso (kg)
          </label>

          <input
            type="number"
            step="0.1"
            {...register("weight", {
              valueAsNumber: true,
              setValueAs: (value) =>
                value === "" ? undefined : Number(value),
            })}
            className="w-full rounded-lg border px-3 py-2"
          />

          {errors.weight && (
            <p className="mt-1 text-sm text-red-600">
              {errors.weight.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {mutation.isPending
            ? "Guardando..."
            : "Guardar registro"}
        </button>
      </form>
    </div>
  );
}