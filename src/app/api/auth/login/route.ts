import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        message: data.message ?? 'Error al iniciar sesión',
      },
      {
        status: response.status,
      },
    );
  }

  const nextResponse = NextResponse.json({
    success: true,
  });

  nextResponse.cookies.set({
    name: 'accessToken',
    value: data.accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  return nextResponse;
}