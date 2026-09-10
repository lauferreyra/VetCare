import { z } from "zod";

export const petSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres"),

  species: z
    .string()
    .trim()
    .min(2, "La especie es obligatoria"),

  breed: z
    .string()
    .trim()
    .optional(),

  birthDate: z
    .string()
    .optional(),
});

export type PetFormData = z.infer<typeof petSchema>;