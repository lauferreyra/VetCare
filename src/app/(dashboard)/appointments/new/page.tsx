"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Pet = {
  id: number;
  name: string;
  species: string;
};

export default function NewAppointmentPage() {
  const router = useRouter();

  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const [loadingPets, setLoadingPets] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPets() {
      try {
        const response = await fetch("/api/pets", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "No se pudieron cargar las mascotas");
        }

        setPets(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las mascotas",
        );
      } finally {
        setLoadingPets(false);
      }
    }

    loadPets();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId: Number(petId),
          date: new Date(date).toISOString(),
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message ?? "No se pudo crear el turno",
        );
      }

      router.push("/appointments");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear el turno",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Nuevo turno
        </h1>

        <p className="mt-2 text-slate-600">
          Seleccioná una mascota, fecha y motivo de la consulta.
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
            disabled={loadingPets}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-700"
          >
            <option value="">
              {loadingPets
                ? "Cargando mascotas..."
                : "Seleccioná una mascota"}
            </option>

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
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-700"
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
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            rows={4}
            placeholder="Ej: Control anual"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-700"
          />
        </div>

        {pets.length === 0 && !loadingPets && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Necesitás registrar una mascota antes de solicitar un turno.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || loadingPets || pets.length === 0}
            className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Reservar turno"}
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