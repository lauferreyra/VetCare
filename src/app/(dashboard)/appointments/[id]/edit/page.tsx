"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { clientFetch } from "@/lib/api/clientFetch";
import {
  AppointmentFormData,
  appointmentSchema,
} from "@/lib/validations/appointmentSchema";
import { useNotificationStore } from "@/stores/useNotificationStore";

type Pet = {
  id: number;
  name: string;
};

type Appointment = {
  id: number;
  reason: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED";
  petId: number;
  slotId: number | null;
  slot: {
    id: number;
    startTime: string;
  } | null;
};

type AvailabilitySlot = {
  id: number;
  startTime: string;
  time: string;
  available: boolean;
};

type AvailabilityResponse = {
  date: string;
  slots: AvailabilitySlot[];
};

async function getAppointment(
  id: string,
): Promise<Appointment> {
  const response = await clientFetch(
    `/api/appointments/${id}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudo obtener el turno",
    );
  }

  return data;
}

async function getPets(): Promise<Pet[]> {
  const response = await clientFetch("/api/pets");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudieron obtener las mascotas",
    );
  }

  return data;
}

async function getAvailability(
  date: string,
): Promise<AvailabilityResponse> {
  const response = await clientFetch(
    `/api/appointments/availability?date=${encodeURIComponent(date)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudo consultar disponibilidad",
    );
  }

  return data;
}

async function updateAppointment(
  id: string,
  data: AppointmentFormData,
) {
  const response = await clientFetch(
    `/api/appointments/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.message ??
        "No se pudo actualizar el turno",
    );
  }

  return responseData;
}

export default function EditAppointmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] =
    useState("");

  const showNotification =
    useNotificationStore(
      (state) => state.showNotification,
    );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      petId: 0,
      slotId: 0,
      reason: "",
    },
  });

  const selectedSlotId = watch("slotId");

  const {
    data: appointment,
    isLoading: isLoadingAppointment,
    isError,
  } = useQuery({
    queryKey: ["appointment", params.id],
    queryFn: () =>
      getAppointment(params.id),
  });

  const {
    data: pets = [],
    isLoading: isLoadingPets,
  } = useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });

  const {
    data: availability,
    isLoading: isLoadingAvailability,
  } = useQuery({
    queryKey: [
      "availability",
      selectedDate,
    ],
    queryFn: () =>
      getAvailability(selectedDate),
    enabled: Boolean(selectedDate),
  });

  useEffect(() => {
    if (!appointment) {
      return;
    }

    reset({
      petId: appointment.petId,
      slotId: appointment.slotId ?? 0,
      reason: appointment.reason,
    });

    if (appointment.slot) {
      const date = new Date(
        appointment.slot.startTime,
      ).toLocaleDateString("en-CA", {
        timeZone:
          "America/Argentina/Buenos_Aires",
      });

      setSelectedDate(date);
    }
  }, [appointment, reset]);

  const mutation = useMutation({
    mutationFn: (
      data: AppointmentFormData,
    ) =>
      updateAppointment(
        params.id,
        data,
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["appointments"],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "appointment",
            params.id,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ["availability"],
        }),
      ]);

      showNotification(
        "Turno actualizado correctamente",
        "success",
      );

      router.push("/appointments");
    },

    onError: (error: Error) => {
      showNotification(
        error.message,
        "error",
      );
    },
  });

  function onSubmit(
    data: AppointmentFormData,
  ) {
    mutation.mutate(data);
  }

  if (
    isLoadingAppointment ||
    isLoadingPets
  ) {
    return <p>Cargando turno...</p>;
  }

  if (isError || !appointment) {
    return (
      <p className="text-red-600">
        No se pudo cargar el turno.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Editar turno
        </h1>

        <p className="mt-1 text-gray-600">
          Modificá la mascota, el horario o el motivo.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Mascota
          </label>

          <select
            {...register("petId", {
              valueAsNumber: true,
            })}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value={0}>
              Seleccioná una mascota
            </option>

            {pets.map((pet) => (
              <option
                key={pet.id}
                value={pet.id}
              >
                {pet.name}
              </option>
            ))}
          </select>

          {errors.petId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.petId.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Fecha
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(
                event.target.value,
              );

              setValue("slotId", 0);
            }}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {selectedDate && (
          <div>
            <p className="mb-2 text-sm font-medium">
              Horario
            </p>

            {isLoadingAvailability ? (
              <p className="text-sm text-gray-500">
                Consultando horarios...
              </p>
            ) : (
              <Controller
                name="slotId"
                control={control}
                render={() => (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availability?.slots.map(
                      (slot) => {
                        const isCurrentSlot =
                          slot.id ===
                          appointment.slotId;

                        const selectable =
                          slot.available ||
                          isCurrentSlot;

                        const selected =
                          selectedSlotId ===
                          slot.id;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!selectable}
                            onClick={() =>
                              setValue(
                                "slotId",
                                slot.id,
                                {
                                  shouldValidate:
                                    true,
                                },
                              )
                            }
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              selected
                                ? "border-teal-600 bg-teal-600 text-white"
                                : selectable
                                  ? "hover:border-teal-500"
                                  : "cursor-not-allowed bg-gray-100 text-gray-400"
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              />
            )}

            {errors.slotId && (
              <p className="mt-2 text-sm text-red-600">
                {errors.slotId.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Motivo
          </label>

          <textarea
            {...register("reason")}
            rows={4}
            className="w-full rounded-lg border px-3 py-2"
          />

          {errors.reason && (
            <p className="mt-1 text-sm text-red-600">
              {errors.reason.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {mutation.isPending
              ? "Guardando..."
              : "Guardar cambios"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/appointments")
            }
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}