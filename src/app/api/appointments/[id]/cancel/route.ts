import { cookies } from "next/headers";
import {
  NextRequest,
  NextResponse,
} from "next/server";

const API_URL = process.env.API_URL;

export async function PATCH(
  _request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await context.params;

  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "No autenticado",
      },
      {
        status: 401,
      },
    );
  }

  const response = await fetch(
    `${API_URL}/appointments/${id}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}