import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken =
    request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pets/:path*",
    "/appointments/:path*",
  ],
};