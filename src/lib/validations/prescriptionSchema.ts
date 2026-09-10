import { z } from "zod";

export const prescriptionSchema = z.object({
  date: z.string().optional(),

  medication: z
    .string()
    .trim()
    .min(2, "El medicamento debe tener al menos 2 caracteres"),

  dosage: z
    .string()
    .trim()
    .min(2, "La dosis debe tener al menos 2 caracteres"),

  instructions: z.string().trim().optional(),
});

export type PrescriptionFormData = z.infer<
  typeof prescriptionSchema
>;