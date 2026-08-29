"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

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
  const response = await fetch(
    `/api/appointments/${id}`,
  );

  if (!response.ok) {
    throw new Error("Error al obtener el turno");
  }

  return response.json();
}

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
      data.message ??
        "Error al consultar disponibilidad",
    );
  }

  return data;
}

async function updateAppointment({
  id,
  data,
}: {
  id: string;
  data: {
    petId: number;
    slotId: number;
    reason: string;
  };
}) {
  const response = await fetch(
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
        "Error al modificar el turno",
    );
  }

  return responseData;
}

export default function EditAppointmentPage() {
  const params = useParams<{ id: string }>();
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
    data: appointment,
    isLoading: isLoadingAppointment,
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
    enabled: !!selectedDate,
  });

  useEffect(() => {
    if (!appointment) {
      return;
    }

    setPetId(
      String(appointment.petId),
    );

    setReason(appointment.reason);

    if (appointment.slot) {
      const date = new Date(
        appointment.slot.startTime,
      );

      const localDate =
        date.toLocaleDateString(
          "en-CA",
          {
            timeZone:
              "America/Argentina/Buenos_Aires",
          },
        );

      setSelectedDate(localDate);

      setSelectedSlotId(
        appointment.slot.id,
      );
    }
  }, [appointment]);

  const mutation = useMutation({
    mutationFn: updateAppointment,

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
          queryKey: ["pets"],
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

      queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },
  });

  function handleDateChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSelectedDate(
      event.target.value,
    );

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

    if (!selectedSlotId) {
      showNotification(
        "Seleccioná un horario",
        "error",
      );
      return;
    }

    mutation.mutate({
      id: params.id,
      data: {
        petId: Number(petId),
        slotId: selectedSlotId,
        reason,
      },
    });
  }

  if (isLoadingAppointment) {
    return <p>Cargando turno...</p>;
  }

  if (!appointment) {
    return <p>Turno no encontrado.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">
        Editar turno
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
              setPetId(
                event.target.value,
              )
            }
            disabled={isLoadingPets}
            className="w-full rounded-lg border px-3 py-2"
          >
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
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {selectedDate && availability && (
          <div>
            <label className="mb-2 block font-medium">
              Horario
            </label>

            {isLoadingAvailability ? (
              <p>Consultando horarios...</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availability.slots.map(
                  (slot) => {
                    const isCurrentSlot =
                      slot.id ===
                      appointment.slotId;

                    const selectable =
                      slot.available ||
                      isCurrentSlot;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={
                          !selectable
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
                            : selectable
                              ? "bg-white hover:bg-gray-50"
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
          </div>
        )}

        <div>
          <label className="mb-2 block font-medium">
            Motivo
          </label>

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value,
              )
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
            ? "Guardando..."
            : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}