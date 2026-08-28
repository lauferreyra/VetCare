// src/components/layout/Footer.tsx

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import Container from "@/components/ui/Container";
import { navigation } from "@/constants/navigation";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 py-12 text-white">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="text-2xl font-bold text-teal-400">
              VetCare
            </Link>

            <p className="mt-4 leading-7 text-slate-400">
              Atención veterinaria profesional para acompañar a tu mascota en
              cada etapa de su vida.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Navegación
            </h3>

            <nav className="mt-4 flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-400 transition-colors hover:text-teal-400"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Contacto
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <p>Buenos Aires, Argentina</p>
              <p>contacto@vetcare.com</p>
              <p>+54 11 1234 5678</p>
            </div>
            
            <div className="mt-6 flex items-center gap-4">
                <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-teal-700 hover:text-white"
                >
                    <FaInstagram size={20} />
                </a>

                <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-teal-700 hover:text-white"
                >
                    <FaFacebookF size={18} />
                </a>

                <a
                    href="https://wa.me/541112345678"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-teal-700 hover:text-white"
                >
                    <FaWhatsapp size={20} />
                </a>
                </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} VetCare. Todos los derechos reservados.
        </div>
      </Container>
    </footer>
  );
}