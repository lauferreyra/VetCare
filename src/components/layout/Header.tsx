import Link from "next/link";

import Container from "@/components/ui/Container";
import MobileMenu from "@/components/layout/MobileMenu";
import { navigation } from "@/constants/navigation";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal-700">
            VetCare
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

         <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
            >
              Iniciar sesión
            </Link>

            <Link
              href="#contact"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              Reservar turno
            </Link>
          </div>


          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}