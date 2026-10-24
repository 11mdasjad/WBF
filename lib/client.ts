export async function api(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<any> {
  const r = await fetch("/api/" + path, {
    method,
    credentials: "same-origin",
    headers:
      data instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...(data
      ? { body: data instanceof FormData ? data : JSON.stringify(data) }
      : {}),
  });
  const result: any = await r.json();
  if (!r.ok)
    throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}
