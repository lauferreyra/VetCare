import { NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";

const API_URL = process.env.API_URL;

export async function GET() {
  try {
    const response =
      await authenticatedFetch(
        `${API_URL}/auth/me`,
      );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Error al obtener el usuario",
      },
      {
        status: 500,
      },
    );
  }
}