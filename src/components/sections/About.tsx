import Image from "next/image";

import Container from "@/components/ui/Container";

export default function About() {
  return (
    <section id="about" className="bg-slate-50 py-20 lg:py-24">
      <Container>
        <div className="flex flex-col items-center gap-12 md:flex-row">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl md:w-1/2">
            <Image
              src="/images/team/vetcare-about.jpg"
              alt="Equipo veterinario de VetCare"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="w-full md:w-1/2">
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-700">
              Sobre nosotros
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Cuidado profesional con un trato cercano
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              En VetCare trabajamos para acompañar a cada mascota con atención
              personalizada, prevención y seguimiento continuo.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Nuestro objetivo es construir una relación de confianza con cada
              familia y ofrecer un cuidado responsable en cada etapa de la vida
              de sus mascotas.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}