import { NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";
import { handleApiError } from "@/lib/api/handleApiError";

const API_URL = process.env.API_URL;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;

    const response = await authenticatedFetch(
      `${API_URL}/prescriptions/${id}`,
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Error al obtener la receta",
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await authenticatedFetch(
      `${API_URL}/prescriptions/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Error al actualizar la receta",
    );
  }
}