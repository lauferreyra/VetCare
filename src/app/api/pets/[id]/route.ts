import { NextRequest, NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";

const API_URL = process.env.API_URL;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: Params,
) {
  try {
    const { id } = await params;

    const response = await authenticatedFetch(
      `${API_URL}/pets/${id}`,
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params,
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await authenticatedFetch(
      `${API_URL}/pets/${id}`,
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
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params,
) {
  try {
    const { id } = await params;

    const response = await authenticatedFetch(
      `${API_URL}/pets/${id}`,
      {
        method: "DELETE",
      },
    );

    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

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
    { message: "Error interno del servidor" },
    { status: 500 },
  );
}