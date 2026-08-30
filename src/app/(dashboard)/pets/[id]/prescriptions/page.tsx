"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { clientFetch } from "@/lib/api/clientFetch";

type Prescription = {
  id: number;
  date: string;
  medication: string;
  dosage: string;
  instructions: string | null;
  status: "ACTIVE" | "CANCELLED";
};

type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string | null;
};

async function getPet(id: string): Promise<Pet> {
  const response = await clientFetch(`/api/pets/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudo obtener la mascota",
    );
  }

  return data;
}

async function getPrescriptions(
  petId: string,
): Promise<Prescription[]> {
  const response = await clientFetch(
    `/api/prescriptions/pet/${petId}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudieron obtener las recetas",
    );
  }

  return data;
}

export default function PrescriptionsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuthUser();

  const queryClient = useQueryClient();

    const showNotification = useNotificationStore(
    (state) => state.showNotification,
    );

    const cancelMutation = useMutation({
  mutationFn: async (prescriptionId: number) => {
    const response = await clientFetch(
      `/api/prescriptions/${prescriptionId}/cancel`,
      {
        method: "PATCH",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ??
          "No se pudo cancelar la receta",
      );
    }

    return data;
  },

  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: [
        "prescriptions",
        params.id,
      ],
    });

    showNotification(
      "Receta cancelada correctamente",
      "success",
    );
  },

  onError: (error: Error) => {
    showNotification(
      error.message,
      "error",
    );
  },
});

  const {
    data: pet,
    isLoading: isLoadingPet,
  } = useQuery({
    queryKey: ["pet", params.id],
    queryFn: () => getPet(params.id),
  });

  const {
    data: prescriptions = [],
    isLoading: isLoadingPrescriptions,
    isError,
  } = useQuery({
    queryKey: ["prescriptions", params.id],
    queryFn: () => getPrescriptions(params.id),
  });

  if (isLoadingPet || isLoadingPrescriptions) {
    return <p>Cargando recetas...</p>;
  }

  if (isError || !pet) {
    return (
      <p className="text-red-600">
        No se pudieron cargar las recetas.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/pets"
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
      >
        <ArrowLeft size={16} />
        Volver a mascotas
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="text-teal-600" />

            <h1 className="text-2xl font-bold">
              Recetas veterinarias
            </h1>
          </div>

          <p className="mt-2 text-gray-600">
            {pet.name} · {pet.species}
            {pet.breed ? ` · ${pet.breed}` : ""}
          </p>
        </div>

        {user.role === "ADMIN" && (
          <Link
            href={`/pets/${pet.id}/prescriptions/new`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus size={16} />
            Nueva receta
          </Link>
        )}
      </div>

      {prescriptions.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <FileText
            size={32}
            className="mx-auto mb-3 text-gray-400"
          />

          <h2 className="font-semibold">
            Sin recetas
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Esta mascota todavía no tiene recetas registradas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <article
              key={prescription.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row">
                <div>
                  <p className="font-semibold">
                    {prescription.medication}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      prescription.date,
                    ).toLocaleDateString(
                      "es-AR",
                      {
                        timeZone:
                          "America/Argentina/Buenos_Aires",
                      },
                    )}
                  </p>
                </div>

                <span
                  className={
                    prescription.status === "ACTIVE"
                      ? "text-sm font-medium text-green-600"
                      : "text-sm font-medium text-red-600"
                  }
                >
                  {prescription.status === "ACTIVE"
                    ? "Activa"
                    : "Cancelada"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Dosis
                  </p>

                  <p className="mt-1">
                    {prescription.dosage}
                  </p>
                </div>

                {prescription.instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Indicaciones
                    </p>

                    <p className="mt-1">
                      {prescription.instructions}
                    </p>
                  </div>
                )}

            {user.role === "ADMIN" && (
                <div className="flex gap-4 pt-2">
                    {prescription.status === "ACTIVE" && (
                    <>
                        <Link
                        href={`/pets/${pet.id}/prescriptions/${prescription.id}/edit`}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                        >
                        Editar
                        </Link>

                        <button
                        type="button"
                        disabled={cancelMutation.isPending}
                        onClick={() =>
                            cancelMutation.mutate(
                            prescription.id,
                            )
                        }
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                        Cancelar
                        </button>
                    </>
                    )}
                </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}