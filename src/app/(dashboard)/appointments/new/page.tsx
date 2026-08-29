"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

async function createAppointment(
  data: AppointmentFormData,
) {
  const response = await clientFetch(
    "/api/appointments",
    {
      method: "POST",
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
        "No se pudo reservar el turno",
    );
  }

  return responseData;
}

export default function NewAppointmentPage() {
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(
      appointmentSchema,
    ),
    defaultValues: {
      petId: 0,
      slotId: 0,
      reason: "",
    },
  });

  const selectedSlotId = watch("slotId");

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

  const mutation = useMutation({
    mutationFn: createAppointment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["appointments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["availability"],
        }),
      ]);

      showNotification(
        "Turno reservado correctamente",
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

  const today = new Date()
    .toLocaleDateString("en-CA", {
      timeZone:
        "America/Argentina/Buenos_Aires",
    });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Reservar turno
        </h1>

        <p className="mt-1 text-gray-600">
          Elegí una mascota, fecha y horario.
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
            min={today}
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
              Horarios disponibles
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
                        const selected =
                          selectedSlotId ===
                          slot.id;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={
                              !slot.available
                            }
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
                                : slot.available
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
            placeholder="Ej: Control anual"
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
            disabled={
              mutation.isPending ||
              isLoadingPets
            }
            className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {mutation.isPending
              ? "Reservando..."
              : "Reservar turno"}
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