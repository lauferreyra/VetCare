import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres"),

  email: z
    .string()
    .trim()
    .email("Ingresá un email válido"),

  role: z.enum(["USER", "ADMIN"]),
});

export type UserFormData = z.infer<typeof userSchema>;