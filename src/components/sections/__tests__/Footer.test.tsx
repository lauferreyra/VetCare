import { render, screen } from "@testing-library/react";

import Footer from "@/components/layout/Footer";
import { navigation } from "@/constants/navigation";

describe("Footer", () => {
  it("renders the VetCare brand", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", {
        name: "VetCare",
      }),
    ).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Footer />);

    navigation.forEach((item) => {
      expect(
        screen.getByRole("link", {
          name: item.label,
        }),
      ).toHaveAttribute("href", item.href);
    });
  });

  it("renders social links", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", {
        name: "Instagram",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Facebook",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "WhatsApp",
      }),
    ).toBeInTheDocument();
  });

  it("renders contact information", () => {
    render(<Footer />);

    expect(
      screen.getByText("Buenos Aires, Argentina"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("contacto@vetcare.com"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("+54 11 1234 5678"),
    ).toBeInTheDocument();
  });

  it("renders the current year", () => {
    render(<Footer />);

    expect(
      screen.getByText(
        new RegExp(`${new Date().getFullYear()} VetCare`),
      ),
    ).toBeInTheDocument();
  });
});