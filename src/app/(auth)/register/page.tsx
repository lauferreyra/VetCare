"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useNotificationStore } from "@/stores/useNotificationStore";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres"),

    email: z
      .string()
      .email("Ingresá un email válido"),

    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),

    confirmPassword: z
      .string()
      .min(6, "Confirmá la contraseña"),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    },
  );

type RegisterFormData = z.infer<
  typeof registerSchema
>;

export default function RegisterPage() {
  const router = useRouter();

  const showNotification =
    useNotificationStore(
      (state) => state.showNotification,
    );

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(
    values: RegisterFormData,
  ) {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message ??
          "No se pudo crear la cuenta";

      showNotification(message, "error");

      return;
    }

    showNotification(
      "Cuenta creada correctamente",
      "success",
    );

    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Crear cuenta
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Registrate para gestionar tus mascotas y turnos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
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
              type="text"
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
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-teal-500"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-teal-500"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.confirmPassword
                    .message
                }
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creando cuenta..."
              : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tenés una cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-teal-600"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}