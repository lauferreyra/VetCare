import { NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";
import { handleApiError } from "@/lib/api/handleApiError";

export async function GET() {
  try {
    const response = await authenticatedFetch(
      `${process.env.API_URL}/appointments/admin/all`,
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}