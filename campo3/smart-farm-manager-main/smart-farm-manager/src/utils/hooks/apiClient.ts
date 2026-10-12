import { BASE_URL } from "@/utils/constants";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions extends RequestInit {
  method?: HttpMethod;
  body?: any;
}

/**
 * Reusable API client wrapper
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", headers, body, ...rest } = options;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error (${response.status}): ${message}`);
  }

  return response.json();
}
