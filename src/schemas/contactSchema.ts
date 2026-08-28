import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),

  email: z
    .string()
    .email("Ingresá un email válido"),

  phone: z
    .string()
    .min(8, "Ingresá un teléfono válido"),

  subject: z
    .string()
    .min(1, "Seleccioná un motivo"),

  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export type ContactFormData = z.infer<typeof contactSchema>;