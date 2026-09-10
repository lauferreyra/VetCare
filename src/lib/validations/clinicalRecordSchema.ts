import { z } from "zod";

export const clinicalRecordSchema = z.object({
  date: z.string().optional(),

  reason: z
    .string()
    .trim()
    .min(3, "El motivo debe tener al menos 3 caracteres"),

  diagnosis: z
    .string()
    .trim()
    .min(3, "El diagnóstico debe tener al menos 3 caracteres"),

  treatment: z.string().trim().optional(),

  observations: z.string().trim().optional(),

  weight: z
    .number()
    .min(0, "El peso no puede ser negativo")
    .optional(),
});

export type ClinicalRecordFormData = z.infer<
  typeof clinicalRecordSchema
>;