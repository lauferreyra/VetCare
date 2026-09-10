"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  appointmentId: number;
};

export default function CancelAppointmentButton({
  appointmentId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    const confirmed = window.confirm(
      "¿Querés cancelar este turno?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CANCELLED",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "No se pudo cancelar el turno",
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar el turno",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {loading ? "Cancelando..." : "Cancelar"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}