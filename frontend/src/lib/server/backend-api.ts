const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

function getBackendUrl(): string {
  return (process.env.AGENTHUB_BACKEND_URL ?? DEFAULT_BACKEND_URL).replace(
    /\/$/,
    "",
  );
}

export async function fetchBackend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${getBackendUrl()}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}
