import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MobileDashboardMenu } from "@/components/dashboard/MobileDashboardMenu";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${process.env.API_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER MOBILE */}
      <header className="relative border-b bg-white lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-teal-600"
          >
            VetCare
          </Link>

          <MobileDashboardMenu email={user.email} role={user.role} />
        </div>
      </header>

      <div className="flex w-full">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-white lg:block">
          <div className="sticky top-0 p-6">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-teal-600"
            >
              VetCare
            </Link>

            <nav className="mt-8 space-y-2">
              <Link
                href="/dashboard"
                className="block rounded-lg px-4 py-3 hover:bg-gray-100"
              >
                Dashboard
              </Link>

              <Link
                href="/pets"
                className="block rounded-lg px-4 py-3 hover:bg-gray-100"
              >
                Mascotas
              </Link>

              <Link
                href="/appointments"
                className="block rounded-lg px-4 py-3 hover:bg-gray-100"
              >
                Turnos
              </Link>

 {            user.role === "ADMIN" && (
                <Link href="/users"
                className="block rounded-lg px-4 py-3 hover:bg-gray-100"
                >
                  Usuarios
                </Link>
              )}
              <Link
                href="/appointments/new"
                className="block rounded-lg bg-teal-600 px-4 py-3 text-center font-medium text-white hover:bg-teal-700"
              >
                + Reservar turno
              </Link>
             
            </nav>

            <div className="mt-10 border-t pt-5">
              <p className="truncate text-sm font-medium">
                {user.email}
              </p>

              <form
                action="/api/auth/logout"
                method="post"
                className="mt-3"
              >
                <button
                  type="submit"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}