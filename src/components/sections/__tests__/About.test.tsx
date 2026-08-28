import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import About from "@/components/sections/About";

describe("About", () => {
  it("renders the about heading", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", {
        name: "Cuidado profesional con un trato cercano",
      }),
    ).toBeInTheDocument();
  });

  it("renders the team image", () => {
    render(<About />);

    expect(
      screen.getByAltText("Equipo veterinario de VetCare"),
    ).toBeInTheDocument();
  });
});