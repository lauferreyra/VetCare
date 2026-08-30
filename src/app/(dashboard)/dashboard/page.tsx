"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { useAuthUser } from "@/contexts/AuthUserContext";
import { clientFetch } from "@/lib/api/clientFetch";

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  createdAt: string;

  owner?: {
    id: number;
    name: string;
    email: string;
  };
};

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Appointment = {
  id: number;
  reason: string;
  status: AppointmentStatus;

  pet: {
    id: number;
    name: string;

    owner?: {
      id: number;
      name: string;
      email: string;
    };
  };

  slot: {
    id: number;
    startTime: string;
  } | null;
};

async function getUserPets(): Promise<Pet[]> {
  const response = await clientFetch("/api/pets");

  if (!response.ok) {
    throw new Error("Error al obtener mascotas");
  }

  return response.json();
}

async function getUserAppointments(): Promise<
  Appointment[]
> {
  const response = await clientFetch(
    "/api/appointments",
  );

  if (!response.ok) {
    throw new Error("Error al obtener turnos");
  }

  return response.json();
}

async function getAdminUsers(): Promise<User[]> {
  const response = await clientFetch("/api/users");

  if (!response.ok) {
    throw new Error("Error al obtener clientes");
  }

  return response.json();
}

async function getAdminPets(): Promise<Pet[]> {
  const response = await clientFetch(
    "/api/admin/pets",
  );

  if (!response.ok) {
    throw new Error("Error al obtener mascotas");
  }

  return response.json();
}

async function getAdminAppointments(): Promise<
  Appointment[]
> {
  const response = await clientFetch(
    "/api/admin/appointments",
  );

  if (!response.ok) {
    throw new Error("Error al obtener turnos");
  }

  return response.json();
}

function getStatusLabel(
  status: AppointmentStatus,
) {
  const labels: Record<
    AppointmentStatus,
    string
  > = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
    COMPLETED: "Completado",
  };

  return labels[status];
}

export default function DashboardPage() {
  const { user } = useAuthUser();

  const isAdmin = user.role === "ADMIN";

  const {
    data: pets = [],
    isLoading: isLoadingPets,
    isError: isPetsError,
  } = useQuery({
    queryKey: isAdmin
      ? ["admin-pets"]
      : ["pets"],

    queryFn: isAdmin
      ? getAdminPets
      : getUserPets,
  });

  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
    isError: isAppointmentsError,
  } = useQuery({
    queryKey: isAdmin
      ? ["admin-appointments"]
      : ["appointments"],

    queryFn: isAdmin
      ? getAdminAppointments
      : getUserAppointments,
  });

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isError: isUsersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAdminUsers,
    enabled: isAdmin,
  });

  if (
    isLoadingPets ||
    isLoadingAppointments ||
    (isAdmin && isLoadingUsers)
  ) {
    return <p>Cargando dashboard...</p>;
  }

  if (
    isPetsError ||
    isAppointmentsError ||
    (isAdmin && isUsersError)
  ) {
    return (
      <p className="text-red-600">
        No se pudo cargar el dashboard.
      </p>
    );
  }

  if (isAdmin) {
    return (
      <AdminDashboard
        users={users}
        pets={pets}
        appointments={appointments}
      />
    );
  }

  return (
    <UserDashboard
      pets={pets}
      appointments={appointments}
    />
  );
}

type UserDashboardProps = {
  pets: Pet[];
  appointments: Appointment[];
};

function UserDashboard({
  pets,
  appointments,
}: UserDashboardProps) {
  const now = new Date();

  const recentPets = [...pets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  const activeAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "PENDING" ||
        appointment.status === "CONFIRMED",
    );

  const upcomingAppointments =
    activeAppointments
      .filter((appointment) => {
        if (!appointment.slot) {
          return false;
        }

        return (
          new Date(
            appointment.slot.startTime,
          ) > now
        );
      })
      .sort(
        (a, b) =>
          new Date(
            a.slot!.startTime,
          ).getTime() -
          new Date(
            b.slot!.startTime,
          ).getTime(),
      )
      .slice(0, 3);

  const pendingCount =
    activeAppointments.filter(
      (appointment) =>
        appointment.status === "PENDING",
    ).length;

  const confirmedCount =
    activeAppointments.filter(
      (appointment) =>
        appointment.status === "CONFIRMED",
    ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-600">
          Resumen de tus mascotas y turnos
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Mascotas"
          value={pets.length}
        />

        <MetricCard
          label="Próximos turnos"
          value={upcomingAppointments.length}
        />

        <MetricCard
          label="Pendientes"
          value={pendingCount}
        />

        <MetricCard
          label="Confirmados"
          value={confirmedCount}
        />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Acciones rápidas
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/pets/new"
            className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
          >
            + Nueva mascota
          </Link>

          <Link
            href="/appointments/new"
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            + Reservar turno
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Últimas mascotas
            </h2>

            <Link
              href="/pets"
              className="text-sm font-medium text-teal-600"
            >
              Ver todas
            </Link>
          </div>

          {recentPets.length === 0 ? (
            <EmptyCard>
              Todavía no registraste mascotas.
            </EmptyCard>
          ) : (
            <div className="space-y-3">
              {recentPets.map((pet) => (
                <div
                  key={pet.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {pet.name}
                      </p>

                      <p className="text-sm text-gray-600">
                        {pet.species}
                        {pet.breed
                          ? ` · ${pet.breed}`
                          : ""}
                      </p>
                    </div>

                    <Link
                      href={`/pets/${pet.id}/edit`}
                      className="text-sm font-medium text-teal-600"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Próximos turnos
            </h2>

            <Link
              href="/appointments"
              className="text-sm font-medium text-teal-600"
            >
              Ver todos
            </Link>
          </div>

          <AppointmentList
            appointments={upcomingAppointments}
            emptyMessage="No tenés próximos turnos."
          />
        </section>
      </div>
    </div>
  );
}

type AdminDashboardProps = {
  users: User[];
  pets: Pet[];
  appointments: Appointment[];
};

function AdminDashboard({
  users,
  pets,
  appointments,
}: AdminDashboardProps) {
  const now = new Date();

  const clients = users.filter(
    (user) => user.role === "USER",
  );

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "PENDING",
    );

  const confirmedAppointments =
    appointments.filter(
    (appointment) =>
      appointment.status === "CONFIRMED",
  );

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "COMPLETED",
    );


  const todayAppointments =
    appointments.filter((appointment) => {
      if (!appointment.slot) {
        return false;
      }

      const date = new Date(
        appointment.slot.startTime,
      );

      return (
        date.getFullYear() ===
          now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    });

  const upcomingAppointments =
    appointments
      .filter((appointment) => {
        if (!appointment.slot) {
          return false;
        }

        if (
          appointment.status === "CANCELLED" ||
          appointment.status === "COMPLETED"
        ) {
          return false;
        }

        return (
          new Date(
            appointment.slot.startTime,
          ) > now
        );
      })
      .sort(
        (a, b) =>
          new Date(
            a.slot!.startTime,
          ).getTime() -
          new Date(
            b.slot!.startTime,
          ).getTime(),
      )
      .slice(0, 5);

  const recentClients = [...clients]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-600">
          Resumen general de VetCare
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Clientes"
          value={clients.length}
        />

        <MetricCard
          label="Mascotas"
          value={pets.length}
        />

        <MetricCard
          label="Turnos pendientes"
          value={pendingAppointments.length}
        />

        <MetricCard
          label="Turnos confirmados"
          value={confirmedAppointments.length}
        />

        <MetricCard
          label="Turnos completados"
          value={completedAppointments.length}
        />

        <MetricCard
          label="Turnos de hoy"
          value={todayAppointments.length}
        />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Accesos rápidos
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
          >
            Ver clientes
          </Link>

          <Link
            href="/admin/pets"
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            Ver mascotas
          </Link>

          <Link
            href="/admin/appointments"
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            Gestionar turnos
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Últimos clientes
            </h2>

            <Link
              href="/admin/users"
              className="text-sm font-medium text-teal-600"
            >
              Ver todos
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <EmptyCard>
              No hay clientes registrados.
            </EmptyCard>
          ) : (
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {client.name}
                      </p>

                      <p className="text-sm text-gray-600">
                        {client.email}
                      </p>
                    </div>

                    <Link
                      href={`/admin/users/${client.id}`}
                      className="text-sm font-medium text-teal-600"
                    >
                      Ver cliente
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Próximos turnos
            </h2>

            <Link
              href="/admin/appointments"
              className="text-sm font-medium text-teal-600"
            >
              Ver todos
            </Link>
          </div>

          <AppointmentList
            appointments={upcomingAppointments}
            emptyMessage="No hay próximos turnos."
            showClient
          />
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function EmptyCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 text-gray-600">
      {children}
    </div>
  );
}

function AppointmentList({
  appointments,
  emptyMessage,
  showClient = false,
}: {
  appointments: Appointment[];
  emptyMessage: string;
  showClient?: boolean;
}) {
  if (appointments.length === 0) {
    return (
      <EmptyCard>
        {emptyMessage}
      </EmptyCard>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">
                {appointment.pet.name}
              </p>

              {showClient &&
                appointment.pet.owner && (
                  <Link
                    href={`/admin/users/${appointment.pet.owner.id}`}
                    className="text-sm font-medium text-teal-600"
                  >
                    {
                      appointment.pet.owner
                        .name
                    }
                  </Link>
                )}

              <p className="text-sm text-gray-600">
                {appointment.reason}
              </p>

              {appointment.slot && (
                <p className="mt-2 text-sm text-gray-500">
                  {new Date(
                    appointment.slot.startTime,
                  ).toLocaleString("es-AR", {
                    timeZone:
                      "America/Argentina/Buenos_Aires",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
              {getStatusLabel(
                appointment.status,
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}