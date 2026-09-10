import { NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";
import { handleApiError } from "@/lib/api/handleApiError";

const API_URL = process.env.API_URL;

type Params = {
  params: Promise<{
    petId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Params,
) {
  try {
    const { petId } = await params;

    const response = await authenticatedFetch(
      `${API_URL}/prescriptions/pet/${petId}`,
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Error al obtener las recetas",
    );
  }
}