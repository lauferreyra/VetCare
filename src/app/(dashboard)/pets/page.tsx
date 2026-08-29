import { cookies } from 'next/headers';
import Link from "next/link";

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
};

const API_URL = process.env.API_URL;

async function getPets(): Promise<Pet[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const response = await fetch(`${API_URL}/pets`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se pudieron cargar las mascotas');
  }

  return response.json();
}

export default async function PetsPage() {
  const pets = await getPets();

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Mis mascotas
          </h2>

          <p className="mt-2 text-gray-600">
            Administrá tus mascotas registradas.
          </p>
        </div>

        <Link
            href="/pets/new"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
            Nueva mascota
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <article
            key={pet.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {pet.name}
            </h3>

            <p className="mt-2 text-gray-600">
              {pet.species}
            </p>

            {pet.breed && (
              <p className="text-sm text-gray-500">
                {pet.breed}
              </p>
            )}
          </article>
        ))}
      </div>

      {pets.length === 0 && (
        <p className="mt-8 text-gray-500">
          Todavía no tenés mascotas registradas.
        </p>
      )}
    </section>
  );
}