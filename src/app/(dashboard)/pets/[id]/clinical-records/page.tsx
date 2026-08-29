"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";

import { useAuthUser } from "@/contexts/AuthUserContext";
import { clientFetch } from "@/lib/api/clientFetch";

type ClinicalRecord = {
  id: number;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string | null;
  observations: string | null;
  weight: number | null;
};

type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string | null;
};

async function getPet(id: string): Promise<Pet> {
  const response = await clientFetch(
    `/api/pets/${id}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo obtener la mascota",
    );
  }

  return data;
}

async function getClinicalRecords(
  petId: string,
): Promise<ClinicalRecord[]> {
  const response = await clientFetch(
    `/api/clinical-records/pet/${petId}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo obtener la historia clínica",
    );
  }

  return data;
}

export default function ClinicalRecordsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuthUser();

  const {
    data: pet,
    isLoading: isLoadingPet,
  } = useQuery({
    queryKey: ["pet", params.id],
    queryFn: () => getPet(params.id),
  });

  const {
    data: records = [],
    isLoading: isLoadingRecords,
    isError,
  } = useQuery({
    queryKey: [
      "clinical-records",
      params.id,
    ],
    queryFn: () =>
      getClinicalRecords(params.id),
  });

  if (isLoadingPet || isLoadingRecords) {
    return <p>Cargando historia clínica...</p>;
  }

  if (isError || !pet) {
    return (
      <p className="text-red-600">
        No se pudo cargar la historia clínica.
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

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Stethoscope className="text-teal-600" />

          <h1 className="text-2xl font-bold">
            Historia clínica
          </h1>
        </div>

        <p className="mt-2 text-gray-600">
          {pet.name} · {pet.species}
          {pet.breed
            ? ` · ${pet.breed}`
            : ""}
        </p>
      </div>

        {user.role === "ADMIN" && (
            <Link
            href={`/pets/${pet.id}/clinical-records/new`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
            <Plus size={16} />
            Nuevo registro
            </Link>
        )}

      {records.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <Stethoscope
            className="mx-auto mb-3 text-gray-400"
            size={32}
          />

          <h2 className="font-semibold">
            Sin registros clínicos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Esta mascota todavía no tiene
            registros en su historia clínica.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <article
              key={record.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row">
                <div>
                  <p className="font-semibold">
                    {record.reason}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      record.date,
                    ).toLocaleDateString(
                      "es-AR",
                      {
                        timeZone:
                          "America/Argentina/Buenos_Aires",
                      },
                    )}
                  </p>
                </div>

                {record.weight !== null && (
                  <span className="text-sm text-gray-600">
                    Peso:{" "}
                    <strong>
                      {record.weight} kg
                    </strong>
                  </span>
                )}

                {user.role === "ADMIN" && (
                    <Link
                        href={`/pets/${pet.id}/clinical-records/${record.id}/edit`}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                        Editar
                    </Link>
                    )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Diagnóstico
                  </p>

                  <p className="mt-1">
                    {record.diagnosis}
                  </p>
                </div>

                {record.treatment && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Tratamiento
                    </p>

                    <p className="mt-1">
                      {record.treatment}
                    </p>
                  </div>
                )}

                {record.observations && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Observaciones
                    </p>

                    <p className="mt-1">
                      {record.observations}
                    </p>
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