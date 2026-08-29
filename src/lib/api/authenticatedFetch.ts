import { cookies } from "next/headers";

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
) {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("UNAUTHORIZED");
  }

  return fetch(url, {
    ...options,

    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}