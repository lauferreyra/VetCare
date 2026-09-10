import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import AppointmentsList from "./AppointmentsList";
import { clientFetch } from "@/lib/api/clientFetch";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { useNotificationStore } from "@/stores/useNotificationStore";

vi.mock("@/lib/api/clientFetch", () => ({
  clientFetch: vi.fn(),
}));

vi.mock("@/contexts/AuthUserContext", () => ({
  useAuthUser: vi.fn(),
}));

vi.mock("@/stores/useNotificationStore", () => ({
  useNotificationStore: vi.fn(),
}));

const clientFetchMock = vi.mocked(clientFetch);
const useAuthUserMock = vi.mocked(useAuthUser);
const useNotificationStoreMock =
  vi.mocked(useNotificationStore);

const showNotificationMock = vi.fn();

const pendingAppointment = {
  id: 1,
  reason: "Control general",
  status: "PENDING" as const,
  pet: {
    id: 10,
    name: "Firulais",
  },
  slot: {
    id: 20,
    startTime: "2026-09-01T13:00:00.000Z",
  },
};

const confirmedAppointment = {
  id: 2,
  reason: "Vacunación",
  status: "CONFIRMED" as const,
  pet: {
    id: 11,
    name: "Michi",
  },
  slot: {
    id: 21,
    startTime: "2026-09-02T14:00:00.000Z",
  },
};

const cancelledAppointment = {
  id: 3,
  reason: "Consulta",
  status: "CANCELLED" as const,
  pet: {
    id: 12,
    name: "Lola",
  },
  slot: {
    id: 22,
    startTime: "2026-09-03T15:00:00.000Z",
  },
};

function createResponse(
  data: unknown,
  ok = true,
): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AppointmentsList />
    </QueryClientProvider>,
  );
}

describe("AppointmentsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthUserMock.mockReturnValue({
      user: {
        sub: 5,
        email: "user@test.com",
        role: "USER",
      },
    } as ReturnType<typeof useAuthUser>);

    useNotificationStoreMock.mockImplementation(
      (selector) =>
        selector({
          showNotification:
            showNotificationMock,
        } as never),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("carga de turnos", () => {
    it("debe mostrar loading mientras se cargan los turnos", () => {
      clientFetchMock.mockReturnValue(
        new Promise(() => {}),
      );

      renderComponent();

      expect(
        screen.getByText(
          "Cargando turnos...",
        ),
      ).toBeInTheDocument();
    });

    it("debe mostrar error si falla la carga de turnos", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse(
          {
            message:
              "Error al obtener turnos",
          },
          false,
        ),
      );

      renderComponent();

      expect(
        await screen.findByText(
          "No se pudieron cargar los turnos.",
        ),
      ).toBeInTheDocument();
    });

    it("debe mostrar estado vacío cuando no existen turnos", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse([]),
      );

      renderComponent();

      expect(
        await screen.findByText(
          "Todavía no tenés turnos reservados.",
        ),
      ).toBeInTheDocument();

      const link = screen.getByRole(
        "link",
        {
          name: "Reservar primer turno",
        },
      );

      expect(link).toHaveAttribute(
        "href",
        "/appointments/new",
      );
    });

    it("debe renderizar los turnos recibidos", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse([
          pendingAppointment,
          confirmedAppointment,
        ]),
      );

      renderComponent();

      expect(
        await screen.findByText(
          "Firulais",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Michi"),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Control general",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Vacunación"),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Pendiente"),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Confirmado"),
      ).toBeInTheDocument();
    });
  });

  describe("usuario común", () => {
    it("debe permitir editar y cancelar un turno PENDING", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse([
          pendingAppointment,
        ]),
      );

      renderComponent();

      await screen.findByText("Firulais");

      expect(
        screen.getByRole("link", {
          name: "Editar",
        }),
      ).toHaveAttribute(
        "href",
        "/appointments/1/edit",
      );

      expect(
        screen.getByRole("button", {
          name: "Cancelar",
        }),
      ).toBeInTheDocument();
    });

    it("no debe mostrar acciones de administrador a un USER", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse([
          pendingAppointment,
          confirmedAppointment,
        ]),
      );

      renderComponent();

      await screen.findByText("Firulais");

      expect(
        screen.queryByRole("button", {
          name: "Confirmar",
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("button", {
          name: "Completar",
        }),
      ).not.toBeInTheDocument();
    });

    it("no debe permitir modificar un turno CANCELLED", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse([
          cancelledAppointment,
        ]),
      );

      renderComponent();

      await screen.findByText("Lola");

      expect(
        screen.queryByRole("link", {
          name: "Editar",
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("button", {
          name: "Cancelar",
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe("administrador", () => {
    beforeEach(() => {
      useAuthUserMock.mockReturnValue({
        user: {
          sub: 1,
          email: "admin@test.com",
          role: "ADMIN",
        },
      } as ReturnType<
        typeof useAuthUser
      >);
    });

    it("debe mostrar Confirmar para un turno PENDING", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse([
          pendingAppointment,
        ]),
      );

      renderComponent();

      expect(
        await screen.findByRole(
          "button",
          {
            name: "Confirmar",
          },
        ),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("button", {
          name: "Completar",
        }),
      ).not.toBeInTheDocument();
    });

    it("debe mostrar Completar para un turno CONFIRMED", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse([
          confirmedAppointment,
        ]),
      );

      renderComponent();

      expect(
        await screen.findByRole(
          "button",
          {
            name: "Completar",
          },
        ),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("button", {
          name: "Confirmar",
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe("cancelar turno", () => {
    it("no debe cancelar si el usuario rechaza el confirm", async () => {
      clientFetchMock.mockResolvedValue(
        createResponse([
          pendingAppointment,
        ]),
      );

      vi.spyOn(
        window,
        "confirm",
      ).mockReturnValue(false);

      const user = userEvent.setup();

      renderComponent();

      const cancelButton =
        await screen.findByRole(
          "button",
          {
            name: "Cancelar",
          },
        );

      await user.click(cancelButton);

      expect(
        window.confirm,
      ).toHaveBeenCalledWith(
        "¿Querés cancelar este turno?",
      );

      expect(
        clientFetchMock,
      ).toHaveBeenCalledTimes(1);
    });

    it("debe enviar PATCH al cancelar un turno", async () => {
      clientFetchMock
        .mockResolvedValueOnce(
          createResponse([
            pendingAppointment,
          ]),
        )
        .mockResolvedValue(
          createResponse({
            ...pendingAppointment,
            status: "CANCELLED",
          }),
        );

      vi.spyOn(
        window,
        "confirm",
      ).mockReturnValue(true);

      const user = userEvent.setup();

      renderComponent();

      const cancelButton =
        await screen.findByRole(
          "button",
          {
            name: "Cancelar",
          },
        );

      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          clientFetchMock,
        ).toHaveBeenCalledWith(
          "/api/appointments/1/cancel",
          {
            method: "PATCH",
          },
        );
      });
    });

    it("debe mostrar notificación de éxito después de cancelar", async () => {
      clientFetchMock
        .mockResolvedValueOnce(
          createResponse([
            pendingAppointment,
          ]),
        )
        .mockResolvedValue(
          createResponse({
            ...pendingAppointment,
            status: "CANCELLED",
          }),
        );

      vi.spyOn(
        window,
        "confirm",
      ).mockReturnValue(true);

      const user = userEvent.setup();

      renderComponent();

      await user.click(
        await screen.findByRole(
          "button",
          {
            name: "Cancelar",
          },
        ),
      );

      await waitFor(() => {
        expect(
          showNotificationMock,
        ).toHaveBeenCalledWith(
          "Turno cancelado correctamente",
          "success",
        );
      });
    });

    it("debe mostrar notificación de error si falla la cancelación", async () => {
      clientFetchMock
        .mockResolvedValueOnce(
          createResponse([
            pendingAppointment,
          ]),
        )
        .mockResolvedValue(
          createResponse(
            {
              message:
                "No se puede cancelar el turno",
            },
            false,
          ),
        );

      vi.spyOn(
        window,
        "confirm",
      ).mockReturnValue(true);

      const user = userEvent.setup();

      renderComponent();

      await user.click(
        await screen.findByRole(
          "button",
          {
            name: "Cancelar",
          },
        ),
      );

      await waitFor(() => {
        expect(
          showNotificationMock,
        ).toHaveBeenCalledWith(
          "No se puede cancelar el turno",
          "error",
        );
      });
    });
  });

  describe("confirmar turno", () => {
    beforeEach(() => {
      useAuthUserMock.mockReturnValue({
        user: {
          sub: 1,
          email: "admin@test.com",
          role: "ADMIN",
        },
      } as ReturnType<
        typeof useAuthUser
      >);
    });

    it("debe confirmar un turno mediante PATCH", async () => {
      clientFetchMock
        .mockResolvedValueOnce(
          createResponse([
            pendingAppointment,
          ]),
        )
        .mockResolvedValue(
          createResponse({
            ...pendingAppointment,
            status: "CONFIRMED",
          }),
        );

      vi.spyOn(
        window,
        "confirm",
      ).mockReturnValue(true);

      const user = userEvent.setup();

      renderComponent();

      await user.click(
        await screen.findByRole(
          "button",
          {
            name: "Confirmar",
          },
        ),
      );

      await waitFor(() => {
        expect(
          clientFetchMock,
        ).toHaveBeenCalledWith(
          "/api/appointments/1/confirm",
          {
            method: "PATCH",
          },
        );
      });
    });
  });

  describe("completar turno", () => {
    beforeEach(() => {
      useAuthUserMock.mockReturnValue({
        user: {
          sub: 1,
          email: "admin@test.com",
          role: "ADMIN",
        },
      } as ReturnType<
        typeof useAuthUser
      >);
    });

    it("debe completar un turno CONFIRMED mediante PATCH", async () => {
      clientFetchMock
        .mockResolvedValueOnce(
          createResponse([
            confirmedAppointment,
          ]),
        )
        .mockResolvedValue(
          createResponse({
            ...confirmedAppointment,
            status: "COMPLETED",
          }),
        );

      vi.spyOn(
        window,
        "confirm",
      ).mockReturnValue(true);

      const user = userEvent.setup();

      renderComponent();

      await user.click(
        await screen.findByRole(
          "button",
          {
            name: "Completar",
          },
        ),
      );

      await waitFor(() => {
        expect(
          clientFetchMock,
        ).toHaveBeenCalledWith(
          "/api/appointments/2/complete",
          {
            method: "PATCH",
          },
        );
      });
    });
  });
});