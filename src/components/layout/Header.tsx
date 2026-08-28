import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal-700">
            VetCare
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#services"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-700"
            >
              Servicios
            </Link>

            <Link
              href="#about"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-700"
            >
              Nosotros
            </Link>

            <Link
              href="#contact"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-700"
            >
              Contacto
            </Link>
          </nav>

          <Link
            href="#contact"
            className="hidden rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 md:inline-flex"
          >
            Reservar turno
          </Link>
        </div>
      </Container>
    </header>
  );
}