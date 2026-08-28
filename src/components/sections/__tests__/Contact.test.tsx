import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Contact from "@/components/sections/Contact";

describe("Contact", () => {
  it("renders the contact form", () => {
    render(<Contact />);

    expect(
      screen.getByRole("heading", {
        name: "¿Necesitás una consulta?",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Nombre"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Teléfono"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Motivo"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Mensaje"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Enviar consulta",
      }),
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();

    render(<Contact />);

    await user.click(
      screen.getByRole("button", {
        name: "Enviar consulta",
      }),
    );

    expect(
      await screen.findByText(
        "El nombre debe tener al menos 2 caracteres",
      ),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Ingresá un email válido"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Ingresá un teléfono válido"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Seleccioná un motivo"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "El mensaje debe tener al menos 10 caracteres",
      ),
    ).toBeInTheDocument();
  });

  it("shows validation error for an invalid email", async () => {
    const user = userEvent.setup();

    render(<Contact />);

    await user.type(
      screen.getByLabelText("Nombre"),
      "Juan Pérez",
    );

    await user.type(
      screen.getByLabelText("Email"),
      "esto-no-es-un-email",
    );

    await user.type(
      screen.getByLabelText("Teléfono"),
      "1122334455",
    );

    await user.selectOptions(
      screen.getByLabelText("Motivo"),
      "consulta",
    );

    await user.type(
      screen.getByLabelText("Mensaje"),
      "Necesito realizar una consulta veterinaria.",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Enviar consulta",
      }),
    );

    expect(
      await screen.findByText("Ingresá un email válido"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Consulta enviada correctamente."),
    ).not.toBeInTheDocument();
  });

  it("submits a valid form and shows success message", async () => {
    const user = userEvent.setup();

    render(<Contact />);

    await user.type(
      screen.getByLabelText("Nombre"),
      "Juan Pérez",
    );

    await user.type(
      screen.getByLabelText("Email"),
      "juan@email.com",
    );

    await user.type(
      screen.getByLabelText("Teléfono"),
      "1122334455",
    );

    await user.selectOptions(
      screen.getByLabelText("Motivo"),
      "consulta",
    );

    await user.type(
      screen.getByLabelText("Mensaje"),
      "Quiero solicitar una consulta para mi mascota.",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Enviar consulta",
      }),
    );

    expect(
      await screen.findByText(
        "Consulta enviada correctamente.",
      ),
    ).toBeInTheDocument();
  });

  it("clears the fields after a successful submit", async () => {
    const user = userEvent.setup();

    render(<Contact />);

    const nameInput = screen.getByLabelText("Nombre");
    const emailInput = screen.getByLabelText("Email");
    const phoneInput = screen.getByLabelText("Teléfono");
    const subjectSelect = screen.getByLabelText("Motivo");
    const messageInput = screen.getByLabelText("Mensaje");

    await user.type(
      nameInput,
      "Juan Pérez",
    );

    await user.type(
      emailInput,
      "juan@email.com",
    );

    await user.type(
      phoneInput,
      "1122334455",
    );

    await user.selectOptions(
      subjectSelect,
      "consulta",
    );

    await user.type(
      messageInput,
      "Quiero solicitar una consulta para mi mascota.",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Enviar consulta",
      }),
    );

    expect(
      await screen.findByText(
        "Consulta enviada correctamente.",
      ),
    ).toBeInTheDocument();

    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(phoneInput).toHaveValue("");
    expect(subjectSelect).toHaveValue("");
    expect(messageInput).toHaveValue("");
  });

  it("does not submit when the name is too short", async () => {
    const user = userEvent.setup();

    render(<Contact />);

    await user.type(
      screen.getByLabelText("Nombre"),
      "J",
    );

    await user.type(
      screen.getByLabelText("Email"),
      "juan@email.com",
    );

    await user.type(
      screen.getByLabelText("Teléfono"),
      "1122334455",
    );

    await user.selectOptions(
      screen.getByLabelText("Motivo"),
      "consulta",
    );

    await user.type(
      screen.getByLabelText("Mensaje"),
      "Necesito realizar una consulta veterinaria.",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Enviar consulta",
      }),
    );

    expect(
      await screen.findByText(
        "El nombre debe tener al menos 2 caracteres",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Consulta enviada correctamente.",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not submit when phone is too short", async () => {
    const user = userEvent.setup();

    render(<Contact />);

    await user.type(
      screen.getByLabelText("Nombre"),
      "Juan Pérez",
    );

    await user.type(
      screen.getByLabelText("Email"),
      "juan@email.com",
    );

    await user.type(
      screen.getByLabelText("Teléfono"),
      "123",
    );

    await user.selectOptions(
      screen.getByLabelText("Motivo"),
      "consulta",
    );

    await user.type(
      screen.getByLabelText("Mensaje"),
      "Necesito realizar una consulta veterinaria.",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Enviar consulta",
      }),
    );

    expect(
      await screen.findByText(
        "Ingresá un teléfono válido",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Consulta enviada correctamente.",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not submit when message is too short", async () => {
    const user = userEvent.setup();

    render(<Contact />);

    await user.type(
      screen.getByLabelText("Nombre"),
      "Juan Pérez",
    );

    await user.type(
      screen.getByLabelText("Email"),
      "juan@email.com",
    );

    await user.type(
      screen.getByLabelText("Teléfono"),
      "1122334455",
    );

    await user.selectOptions(
      screen.getByLabelText("Motivo"),
      "consulta",
    );

    await user.type(
      screen.getByLabelText("Mensaje"),
      "Hola",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Enviar consulta",
      }),
    );

    expect(
      await screen.findByText(
        "El mensaje debe tener al menos 10 caracteres",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Consulta enviada correctamente.",
      ),
    ).not.toBeInTheDocument();
  });
});