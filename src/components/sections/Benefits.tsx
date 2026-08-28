import {
  Clock3,
  HeartHandshake,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

const benefits = [
  {
    title: "Atención personalizada",
    description:
      "Cada mascota recibe un seguimiento adaptado a sus necesidades.",
    icon: UserRoundCheck,
  },
  {
    title: "Profesionales capacitados",
    description:
      "Un equipo preparado para brindar atención responsable y de calidad.",
    icon: ShieldCheck,
  },
  {
    title: "Trato cercano",
    description:
      "Buscamos generar confianza tanto con las mascotas como con sus familias.",
    icon: HeartHandshake,
  },
  {
    title: "Atención organizada",
    description:
      "Turnos planificados para reducir esperas y mejorar la experiencia.",
    icon: Clock3,
  },
];

export default function Benefits() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <Container>
        <SectionTitle
          eyebrow="Por qué elegirnos"
          title="Una atención pensada para tu mascota"
          description="Combinamos atención profesional, prevención y cercanía para ofrecer una mejor experiencia."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <Icon size={26} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {benefit.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}