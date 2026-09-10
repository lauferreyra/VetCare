"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { clientFetch } from "@/lib/api/clientFetch";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

async function getUsers(): Promise<User[]> {
  const response = await clientFetch("/api/users");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudieron obtener los usuarios",
    );
  }

  return data;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) {
    return <p>Cargando clientes...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        No se pudieron cargar los clientes.
      </p>
    );
  }

  const clients = users.filter(
    (user) => user.role === "USER",
  );

  const normalizedSearch = search
    .trim()
    .toLowerCase();

  const filteredClients = clients.filter(
    (user) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        user.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          .toLowerCase()
          .includes(normalizedSearch)
      );
    },
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Clientes
        </h1>

        <p className="mt-1 text-gray-600">
          Consultá los clientes registrados y
          accedé a sus mascotas y turnos.
        </p>
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:border-teal-500 sm:max-w-md"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">
                  Nombre
                </th>

                <th className="px-4 py-3 font-medium">
                  Email
                </th>

                <th className="px-4 py-3 font-medium">
                  Rol
                </th>

                <th className="px-4 py-3 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-b-0"
                >
                  <td className="px-4 py-3">
                    {user.name}
                  </td>

                  <td className="px-4 py-3">
                    {user.email}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-teal-600 hover:text-teal-700"
                      >
                        Ver cliente
                      </Link>

                      <Link
                        href={`/users/${user.id}/edit`}
                        className="font-medium text-gray-600 hover:text-gray-800"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clients.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay clientes registrados.
          </div>
        )}

        {clients.length > 0 &&
          filteredClients.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No se encontraron clientes para
              &quot;{search}&quot;.
            </div>
          )}
      </div>
    </div>
  );
}