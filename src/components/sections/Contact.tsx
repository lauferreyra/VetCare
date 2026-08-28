"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

import {
  contactSchema,
  type ContactFormData,
} from "@/schemas/contactSchema";

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });
const [isSuccess, setIsSuccess] = useState(false);
 const onSubmit = async (data: ContactFormData) => {
  console.log(data);

  setIsSuccess(true);
  reset();
};

  return (
    <section id="contact" className="scroll-mt-16 bg-slate-50 py-20 lg:py-24">
      <Container>
        <SectionTitle
          eyebrow="Contacto"
          title="¿Necesitás una consulta?"
          description="Completá el formulario y nuestro equipo se pondrá en contacto con vos."
        />

        <div className="mx-auto mt-12 max-w-3xl">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nombre
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  {...register("name")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="nombre@email.com"
                  {...register("email")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Teléfono
                </label>

                <input
                  id="phone"
                  type="tel"
                  placeholder="11 1234 5678"
                  {...register("phone")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Motivo
                </label>

                <select
                  id="subject"
                  {...register("subject")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="">Seleccionar</option>
                  <option value="consulta">Consulta general</option>
                  <option value="vacunacion">Vacunación</option>
                  <option value="urgencia">Urgencia</option>
                  <option value="otro">Otro</option>
                </select>

                {errors.subject && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.subject.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Mensaje
              </label>

              <textarea
                id="message"
                rows={5}
                placeholder="Contanos brevemente en qué podemos ayudarte"
                {...register("message")}
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />

              {errors.message && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "Enviando..." : "Enviar consulta"}
            </button>
            {isSuccess && (
                <p className="mt-4 text-sm font-medium text-emerald-600">
                    Consulta enviada correctamente.
                </p>
                )}
          </form>
        </div>
      </Container>
    </section>
  );
}