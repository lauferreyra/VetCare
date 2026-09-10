import { NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";
import { handleApiError } from "@/lib/api/handleApiError";

const API_URL = process.env.API_URL;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  _request: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;

    const response = await authenticatedFetch(
      `${API_URL}/prescriptions/${id}/cancel`,
      {
        method: "PATCH",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Error al cancelar la receta",
    );
  }
}