import {
  HeartPulse,
  Syringe,
  Stethoscope,
  Scissors,
  PawPrint,
  Ambulance,
} from "lucide-react";

import type { Service } from "@/types/service";

export const services: Service[] = [
  {
    title: "Consulta clínica",
    description:
      "Controles generales, diagnóstico y seguimiento para cuidar la salud de tu mascota.",
    icon: Stethoscope,
  },
  {
    title: "Vacunación",
    description:
      "Planes de vacunación y prevención adaptados a cada etapa de vida.",
    icon: Syringe,
  },
  {
    title: "Urgencias",
    description:
      "Atención rápida ante situaciones que requieren evaluación veterinaria inmediata.",
    icon: Ambulance,
  },
  {
    title: "Cardiología",
    description:
      "Evaluación y seguimiento cardiovascular para detectar problemas de forma temprana.",
    icon: HeartPulse,
  },
  {
    title: "Peluquería",
    description:
      "Baño, corte y cuidado estético para mantener el bienestar de tu mascota.",
    icon: Scissors,
  },
  {
    title: "Bienestar integral",
    description:
      "Acompañamiento preventivo para mejorar la calidad de vida de perros y gatos.",
    icon: PawPrint,
  },
];