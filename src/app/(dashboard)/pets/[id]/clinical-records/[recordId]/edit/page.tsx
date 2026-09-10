"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { clientFetch } from "@/lib/api/clientFetch";
import {
  ClinicalRecordFormData,
  clinicalRecordSchema,
} from "@/lib/validations/clinicalRecordSchema";
import { useNotificationStore } from "@/stores/useNotificationStore";

type ClinicalRecord = {
  id: number;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string | null;
  observations: string | null;
  weight: number | null;
  petId: number;
};

async function getClinicalRecord(
  id: string,
): Promise<ClinicalRecord> {
  const response = await clientFetch(
    `/api/clinical-records/${id}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo obtener el registro clínico",
    );
  }

  return data;
}

export default function EditClinicalRecordPage() {
  const params = useParams<{
    id: string;
    recordId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const {
    register,
    handleSubmit,
    reset,
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

  const {
    data: record,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "clinical-record",
      params.recordId,
    ],
    queryFn: () =>
      getClinicalRecord(params.recordId),
  });

  useEffect(() => {
    if (!record) {
      return;
    }

    reset({
      date: record.date
        ? record.date.slice(0, 10)
        : "",
      reason: record.reason,
      diagnosis: record.diagnosis,
      treatment: record.treatment ?? "",
      observations:
        record.observations ?? "",
      weight: record.weight ?? undefined,
    });
  }, [record, reset]);

  const mutation = useMutation({
    mutationFn: async (
      data: ClinicalRecordFormData,
    ) => {
      const response = await clientFetch(
        `/api/clinical-records/${params.recordId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            date: data.date || undefined,
            reason: data.reason,
            diagnosis: data.diagnosis,
            treatment:
              data.treatment || undefined,
            observations:
              data.observations || undefined,
            weight: data.weight,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "No se pudo actualizar el registro clínico",
        );
      }

      return result;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "clinical-records",
          params.id,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "clinical-record",
          params.recordId,
        ],
      });

      showNotification(
        "Registro clínico actualizado correctamente",
        "success",
      );

      router.push(
        `/pets/${params.id}/clinical-records`,
      );
    },

    onError: (error: Error) => {
      showNotification(
        error.message,
        "error",
      );
    },
  });

  const onSubmit = (
    data: ClinicalRecordFormData,
  ) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <p>Cargando registro...</p>;
  }

  if (isError || !record) {
    return (
      <p className="text-red-600">
        No se pudo cargar el registro clínico.
      </p>
    );
  }

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
          Editar registro clínico
        </h1>

        <p className="mt-2 text-gray-600">
          Modificá la información de la consulta.
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
                value === ""
                  ? undefined
                  : Number(value),
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
            : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}