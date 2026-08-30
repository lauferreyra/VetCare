"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { clientFetch } from "@/lib/api/clientFetch";

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;

  owner: {
    id: number;
    name: string;
    email: string;
  };
};

async function getPets(): Promise<Pet[]> {
  const response = await clientFetch(
    "/api/admin/pets",
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudieron obtener las mascotas",
    );
  }

  return data;
}

export default function AdminPetsPage() {
  const {
    data: pets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-pets"],
    queryFn: getPets,
  });

  if (isLoading) {
    return <p>Cargando mascotas...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        No se pudieron cargar las mascotas.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Mascotas
        </h1>

        <p className="mt-1 text-gray-600">
          Todas las mascotas registradas en VetCare.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  Mascota
                </th>

                <th className="px-4 py-3">
                  Especie
                </th>

                <th className="px-4 py-3">
                  Raza
                </th>

                <th className="px-4 py-3">
                  Cliente
                </th>

                <th className="px-4 py-3">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {pets.map((pet) => (
                <tr
                  key={pet.id}
                  className="border-b last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium">
                    {pet.name}
                  </td>

                  <td className="px-4 py-3">
                    {pet.species}
                  </td>

                  <td className="px-4 py-3">
                    {pet.breed || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${pet.owner.id}`}
                      className="font-medium text-teal-600 hover:text-teal-700"
                    >
                      {pet.owner.name}
                    </Link>

                    <p className="text-xs text-gray-500">
                      {pet.owner.email}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/pets/${pet.id}/clinical-records`}
                        className="font-medium text-teal-600 hover:text-teal-700"
                      >
                        Historia clínica
                      </Link>

                      <Link
                        href={`/pets/${pet.id}/prescriptions`}
                        className="font-medium text-teal-600 hover:text-teal-700"
                      >
                        Recetas
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pets.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay mascotas registradas.
          </div>
        )}
      </div>
    </div>
  );
}