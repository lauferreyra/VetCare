import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import MobileMenu from "@/components/layout/MobileMenu";

describe("MobileMenu", () => {
  it("is closed initially", () => {
    render(<MobileMenu />);

    expect(
      screen.queryByRole("link", {
        name: "Servicios",
      }),
    ).not.toBeInTheDocument();
  });

  it("opens when clicking the menu button", async () => {
    const user = userEvent.setup();

    render(<MobileMenu />);

    const button = screen.getByRole("button", {
      name: "Abrir menú",
    });

    await user.click(button);

    expect(
      screen.getByRole("link", {
        name: "Servicios",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Cerrar menú",
      }),
    ).toBeInTheDocument();
  });

  it("closes when clicking the button again", async () => {
    const user = userEvent.setup();

    render(<MobileMenu />);

    await user.click(
      screen.getByRole("button", {
        name: "Abrir menú",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Cerrar menú",
      }),
    );

    expect(
      screen.queryByRole("link", {
        name: "Servicios",
      }),
    ).not.toBeInTheDocument();
  });

  it("closes after clicking a navigation link", async () => {
    const user = userEvent.setup();

    render(<MobileMenu />);

    await user.click(
      screen.getByRole("button", {
        name: "Abrir menú",
      }),
    );

    await user.click(
      screen.getByRole("link", {
        name: "Servicios",
      }),
    );

    expect(
      screen.queryByRole("link", {
        name: "Nosotros",
      }),
    ).not.toBeInTheDocument();
  });
});