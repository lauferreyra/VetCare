import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "@/components/layout/Header";
import { navigation } from "@/constants/navigation";

describe("Header", () => {
  it("renders the VetCare logo", () => {
    render(<Header />);

    expect(
      screen.getByRole("link", {
        name: "VetCare",
      }),
    ).toBeInTheDocument();
  });

  it("renders the navigation links", () => {
    render(<Header />);

    navigation.forEach((item) => {
      expect(
        screen.getByRole("link", {
          name: item.label,
        }),
      ).toBeInTheDocument();
    });
  });

  it("renders the appointment CTA", () => {
    render(<Header />);

    expect(
      screen.getByRole("link", {
        name: "Reservar turno",
      }),
    ).toHaveAttribute("href", "#contact");
  });
});