import Image from "next/image";
import Link from "next/link";

import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section className="bg-teal-50">
      <Container>
        <div className="grid min-h-[620px] items-center gap-12 py-16 md:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-800">
              Atención veterinaria profesional
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Cuidamos a quienes más querés
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Atención integral, prevención y seguimiento para acompañar a tu
              mascota en cada etapa de su vida.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="#contact"
                className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-800"
              >
                Reservar turno
              </Link>

              <Link
                href="#services"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Ver servicios
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl">
            <Image
              src="/images/hero/vetcare-hero.jpeg"
              alt="Veterinaria atendiendo a un perro"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}