import { NextResponse } from "next/server";

import { authenticatedFetch } from "@/lib/api/authenticatedFetch";
import { handleApiError } from "@/lib/api/handleApiError";

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
      `${process.env.API_URL}/prescriptions/${id}/pdf`,
    );

    if (!response.ok) {
      const error = await response.json();

      return NextResponse.json(
        error,
        { status: response.status },
      );
    }

    const pdf = await response.arrayBuffer();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receta-${id}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}