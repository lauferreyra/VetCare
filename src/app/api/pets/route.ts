import {
  NextRequest,
  NextResponse,
} from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";

const API_URL = process.env.API_URL;

export async function GET() {
  try {
    const response =
      await authenticatedFetch(
        `${API_URL}/pets`,
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
        {
          message: "No autenticado",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        message:
          "Error al obtener mascotas",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const response =
      await authenticatedFetch(
        `${API_URL}/pets`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        },
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
        {
          message: "No autenticado",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        message:
          "Error al crear mascota",
      },
      {
        status: 500,
      },
    );
  }
}