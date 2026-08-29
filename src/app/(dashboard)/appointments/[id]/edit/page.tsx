"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Pet = {
  id: number;
  name: string;
  species: string;
};

type Appointment = {
  id: number;
  date: string;
  reason: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  petId: number;
};

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<Appointment["status"]>("PENDING");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setError("");

        const [appointmentResponse, petsResponse] = await Promise.all([
          fetch(`/api/appointments/${params.id}`, {
            cache: "no-store",
          }),
          fetch("/api/pets", {
            cache: "no-store",
          }),
        ]);

        const appointmentData = await appointmentResponse.json();
        const petsData = await petsResponse.json();

        if (!appointmentResponse.ok) {
          throw new Error(
            appointmentData.message ?? "No se pudo cargar el turno",
          );
        }

        if (!petsResponse.ok) {
          throw new Error(
            petsData.message ?? "No se pudieron cargar las mascotas",
          );
        }

        setPets(petsData);
        setPetId(String(appointmentData.petId));
        setReason(appointmentData.reason);
        setStatus(appointmentData.status);

        const appointmentDate = new Date(appointmentData.date);

        const localDate = new Date(
          appointmentDate.getTime() -
            appointmentDate.getTimezoneOffset() * 60_000,
        )
          .toISOString()
          .slice(0, 16);

        setDate(localDate);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el turno",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/appointments/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId: Number(petId),
          date: new Date(date).toISOString(),
          reason,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message ?? "No se pudo actualizar el turno",
        );
      }

      router.push("/appointments");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el turno",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-600">Cargando turno...</p>;
  }

  return (
    <section className="max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Editar turno
        </h1>

        <p className="mt-2 text-slate-600">
          Modificá los datos del turno seleccionado.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="pet"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Mascota
          </label>

          <select
            id="pet"
            value={petId}
            onChange={(event) => setPetId(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} - {pet.species}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Fecha y hora
          </label>

          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="reason"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Motivo
          </label>

          <textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Estado
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as Appointment["status"])
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          >
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="CANCELLED">Cancelado</option>
            <option value="COMPLETED">Completado</option>
          </select>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <Link
            href="/appointments"
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}