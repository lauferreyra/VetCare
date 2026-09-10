import {
  NextRequest,
  NextResponse,
} from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";

const API_URL = process.env.API_URL;

export async function GET(
  request: NextRequest,
) {
  try {
    const date =
      request.nextUrl.searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        {
          message: "La fecha es obligatoria",
        },
        {
          status: 400,
        },
      );
    }

    const response =
      await authenticatedFetch(
        `${API_URL}/appointments/availability?date=${encodeURIComponent(date)}`,
      );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
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
        "Error al consultar disponibilidad",
    },
    {
      status: 500,
    },
  );
}