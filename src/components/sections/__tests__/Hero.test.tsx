import { render, screen } from "@testing-library/react";

import Hero from "@/components/sections/Hero";

describe("Hero", () => {
  it("renders the main heading", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cuidamos a quienes más querés",
      }),
    ).toBeInTheDocument();
  });

  it("renders the main actions", () => {
    render(<Hero />);

    expect(
      screen.getByRole("link", {
        name: "Reservar turno",
      }),
    ).toHaveAttribute("href", "#contact");

    expect(
      screen.getByRole("link", {
        name: "Ver servicios",
      }),
    ).toHaveAttribute("href", "#services");
  });

  it("renders the hero image with accessible alt text", () => {
    render(<Hero />);

    expect(
      screen.getByAltText("Veterinaria atendiendo a un perro"),
    ).toBeInTheDocument();
  });
});