"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { clientFetch } from "@/lib/api/clientFetch";
import {
  UserFormData,
  userSchema,
} from "@/lib/validations/userSchema";
import { useNotificationStore } from "@/stores/useNotificationStore";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

async function getUser(id: string): Promise<User> {
  const response = await clientFetch(`/api/users/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "No se pudo obtener el usuario",
    );
  }

  return data;
}

async function updateUser(
  id: string,
  data: UserFormData,
) {
  const response = await clientFetch(
    `/api/users/${id}`,
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
    const message = Array.isArray(responseData.message)
      ? responseData.message.join(", ")
      : responseData.message;

    throw new Error(
      message ?? "No se pudo actualizar el usuario",
    );
  }

  return responseData;
}

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "USER",
    },
  });

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", params.id],
    queryFn: () => getUser(params.id),
  });

  useEffect(() => {
    if (!user) return;

    reset({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: UserFormData) =>
      updateUser(params.id, data),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["users"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["user", params.id],
        }),
      ]);

      showNotification(
        "Usuario actualizado correctamente",
        "success",
      );

      router.push("/users");
    },

    onError: (error: Error) => {
      showNotification(error.message, "error");
    },
  });

  function onSubmit(data: UserFormData) {
    mutation.mutate(data);
  }

  if (isLoading) {
    return <p>Cargando usuario...</p>;
  }

  if (isError || !user) {
    return (
      <p className="text-red-600">
        No se pudo cargar el usuario.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Editar usuario
        </h1>

        <p className="mt-1 text-gray-600">
          Modificá los datos y permisos del usuario.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium"
          >
            Nombre
          </label>

          <input
            id="name"
            {...register("name")}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-teal-500"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-teal-500"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-1 block text-sm font-medium"
          >
            Rol
          </label>

          <select
            id="role"
            {...register("role")}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>

          {errors.role && (
            <p className="mt-1 text-sm text-red-600">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending
              ? "Guardando..."
              : "Guardar cambios"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/users")}
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}