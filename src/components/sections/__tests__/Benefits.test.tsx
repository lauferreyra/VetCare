import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Benefits from "@/components/sections/Benefits";

describe("Benefits", () => {
  it("renders the section title", () => {
    render(<Benefits />);

    expect(
      screen.getByRole("heading", {
        name: "Una atención pensada para tu mascota",
      }),
    ).toBeInTheDocument();
  });

  it("renders the benefits", () => {
    render(<Benefits />);

    expect(
      screen.getByRole("heading", {
        name: "Atención personalizada",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Profesionales capacitados",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Trato cercano",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Atención organizada",
      }),
    ).toBeInTheDocument();
  });
});