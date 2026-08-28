import { render, screen } from "@testing-library/react";

import Services from "@/components/sections/Services";
import { services } from "@/constants/services";

describe("Services", () => {
  it("renders the section title", () => {
    render(<Services />);

    expect(
      screen.getByRole("heading", {
        name: "Todo lo que tu mascota necesita",
      }),
    ).toBeInTheDocument();
  });

  it("renders all configured services", () => {
    render(<Services />);

    services.forEach((service) => {
      expect(
        screen.getByRole("heading", {
          name: service.title,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(service.description),
      ).toBeInTheDocument();
    });
  });
});