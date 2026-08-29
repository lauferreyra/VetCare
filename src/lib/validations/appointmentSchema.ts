import { z } from "zod";

export const appointmentSchema = z.object({
  petId: z
    .number()
    .int()
    .positive("Seleccioná una mascota"),

  slotId: z
    .number()
    .int()
    .positive("Seleccioná un horario"),

  reason: z
    .string()
    .trim()
    .min(3, "El motivo debe tener al menos 3 caracteres"),
});

export type AppointmentFormData = z.infer<
  typeof appointmentSchema
>;