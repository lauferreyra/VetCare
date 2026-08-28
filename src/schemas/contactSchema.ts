import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, {
      error: "El nombre debe tener al menos 2 caracteres",
    }),

  email: z.email({
    error: "Ingresá un email válido",
  }),

  phone: z
    .string()
    .min(8, {
      error: "Ingresá un teléfono válido",
    }),

  subject: z
    .string()
    .min(1, {
      error: "Seleccioná un motivo",
    }),

  message: z
    .string()
    .min(10, {
      error: "El mensaje debe tener al menos 10 caracteres",
    }),
});

export type ContactFormData = z.infer<typeof contactSchema>;