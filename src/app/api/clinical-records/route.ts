import { NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";
import { handleApiError } from "@/lib/api/handleApiError";

const API_URL = process.env.API_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await authenticatedFetch(
      `${API_URL}/clinical-records`,
      {
        method: "POST",
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
      "Error al crear el registro clínico",
    );
  }
}