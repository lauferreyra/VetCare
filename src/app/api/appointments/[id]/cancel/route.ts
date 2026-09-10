import {
  NextRequest,
  NextResponse,
} from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";

const API_URL = process.env.API_URL;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  _request: NextRequest,
  { params }: Params,
) {
  try {
    const { id } = await params;

    const response =
      await authenticatedFetch(
        `${API_URL}/appointments/${id}/cancel`,
        {
          method: "PATCH",
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
        { message: "No autenticado" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Error al cancelar el turno",
      },
      {
        status: 500,
      },
    );
  }
}