import { NextRequest, NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";
import { handleApiError } from "@/lib/api/handleApiError";

const API_URL = process.env.API_URL;

export async function GET() {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/users`,
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Error al obtener los usuarios",
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Error al registrar el usuario",
      },
      {
        status: 500,
      },
    );
  }
}