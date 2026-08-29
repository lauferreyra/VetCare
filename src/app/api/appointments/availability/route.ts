import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'No autenticado' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);

  const date = searchParams.get('date');

  const response = await fetch(
    `${API_URL}/appointments/availability?date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}