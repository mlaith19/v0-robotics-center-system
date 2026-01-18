// lib/services/http.ts
export async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  })

  const data = await safeJson(res)

  if (!res.ok) {
    const msg =
      (data as any)?.error ||
      (data as any)?.message ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }

  return data as T
}
