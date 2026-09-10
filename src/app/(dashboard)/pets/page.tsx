import Link from "next/link";

import PetsList from "@/components/pets/PetsList";

export default function PetsPage() {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Mis mascotas
          </h1>

          <p className="mt-2 text-slate-600">
            Administrá las mascotas asociadas a tu cuenta.
          </p>
        </div>

        <Link
          href="/pets/new"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Nueva mascota
        </Link>
      </div>

      <PetsList />
    </section>
  );
}