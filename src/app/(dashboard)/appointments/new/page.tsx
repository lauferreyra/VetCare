"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
  const response = await fetch("/api/pets");

  if (!response.ok) {
    throw new Error("Error al obtener las mascotas");
  }

  return response.json();
}

async function getAvailability(
  date: string,
): Promise<AvailabilityResponse> {
  const response = await fetch(
    `/api/appointments/availability?date=${date}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "Error al consultar disponibilidad",
    );
  }

  return data;
}

async function createAppointment(data: {
  petId: number;
  slotId: number;
  reason: string;
}) {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.message ?? "Error al reservar el turno",
    );
  }

  return responseData;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const [petId, setPetId] = useState("");
  const [reason, setReason] = useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedSlotId, setSelectedSlotId] =
    useState<number | null>(null);

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
    isError: isAvailabilityError,
  } = useQuery({
    queryKey: ["availability", selectedDate],
    queryFn: () =>
      getAvailability(selectedDate),
    enabled: !!selectedDate,
  });

  const mutation = useMutation({
    mutationFn: createAppointment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["appointments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pets"],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "availability",
            selectedDate,
          ],
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

      queryClient.invalidateQueries({
        queryKey: [
          "availability",
          selectedDate,
        ],
      });
    },
  });

  function handleDateChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSelectedDate(event.target.value);

    // Si cambia el día, descartamos
    // el horario seleccionado anteriormente.
    setSelectedSlotId(null);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!petId) {
      showNotification(
        "Seleccioná una mascota",
        "error",
      );
      return;
    }

    if (!selectedDate) {
      showNotification(
        "Seleccioná una fecha",
        "error",
      );
      return;
    }

    if (!selectedSlotId) {
      showNotification(
        "Seleccioná un horario",
        "error",
      );
      return;
    }

    mutation.mutate({
      petId: Number(petId),
      slotId: selectedSlotId,
      reason,
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">
        Reservar turno
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="mb-2 block font-medium">
            Mascota
          </label>

          <select
            value={petId}
            onChange={(event) =>
              setPetId(event.target.value)
            }
            disabled={isLoadingPets}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">
              Seleccionar mascota
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
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Fecha
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {selectedDate && (
          <div>
            <label className="mb-2 block font-medium">
              Horario
            </label>

            {isLoadingAvailability && (
              <p className="text-sm text-gray-500">
                Consultando horarios...
              </p>
            )}

            {isAvailabilityError && (
              <p className="text-sm text-red-600">
                No se pudieron consultar los horarios.
              </p>
            )}

            {availability && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availability.slots.map(
                  (slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={
                        !slot.available
                      }
                      onClick={() =>
                        setSelectedSlotId(
                          slot.id,
                        )
                      }
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        selectedSlotId ===
                        slot.id
                          ? "bg-teal-600 text-white"
                          : slot.available
                            ? "bg-white hover:bg-gray-50"
                            : "cursor-not-allowed bg-gray-100 text-gray-400"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="mb-2 block font-medium">
            Motivo
          </label>

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            minLength={3}
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-teal-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {mutation.isPending
            ? "Reservando..."
            : "Reservar turno"}
        </button>
      </form>
    </div>
  );
}