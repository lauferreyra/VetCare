import { NextResponse } from "next/server";

export function handleApiError(
  error: unknown,
  fallbackMessage = "Error interno del servidor",
) {
  if (
    error instanceof Error &&
    error.message === "UNAUTHORIZED"
  ) {
    return NextResponse.json(
      { message: "No autenticado" },
      { status: 401 },
    );
  }

  console.error(error);

  return NextResponse.json(
    { message: fallbackMessage },
    { status: 500 },
  );
}