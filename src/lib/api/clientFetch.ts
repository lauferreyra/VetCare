export async function clientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, init);

  if (response.status === 401) {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";

    throw new Error("UNAUTHORIZED");
  }

  return response;
}