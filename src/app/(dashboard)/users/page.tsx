"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

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

export default function UsersPage() {
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) {
    return <p>Cargando usuarios...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        No se pudieron cargar los usuarios.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Usuarios
        </h1>

        <p className="mt-1 text-gray-600">
          Administrá los usuarios registrados en VetCare.
        </p>
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
              {users.map((user) => (
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
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="font-medium text-teal-600 hover:text-teal-700"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay usuarios registrados.
          </div>
        )}
      </div>
    </div>
  );
}