// Base URL for the backend. Set VITE_API_URL in your .env when the real API
// exists (e.g. VITE_API_URL=https://api.yourapp.com). Falls back to a
// same-origin "/api" so a dev proxy (Vite's `server.proxy`) works untouched.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

/**
 * Thrown for every failed request — network failure, timeout, or a non-2xx
 * response. `status` is 0 for failures that never reached the server
 * (offline, timeout, CORS), so callers can distinguish "no connection" from
 * "server said no".
 */
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 10000, headers, ...rest } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      // Lets the browser send/store the httpOnly auth cookie the server
      // sets on login. Client code never reads or stores the token itself.
      credentials: "include",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("That took too long. Please try again.", 0);
    }
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }
  clearTimeout(timeoutId);

  // Read as text first — an empty 204 body would break res.json().
  const raw = await response.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      // Server returned non-JSON (e.g. an HTML error page from a proxy).
      // Leave data null; the status-based message below still applies.
    }
  }

  if (!response.ok) {
    const body = (data ?? {}) as { message?: string; errors?: Record<string, string> };
    throw new ApiError(
      body.message ?? defaultMessageForStatus(response.status),
      response.status,
      body.errors
    );
  }

  return data as T;
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "That request wasn't valid. Please check your details.";
    case 401:
      return "Incorrect email or password.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find that.";
    case 409:
      return "An account with that email already exists.";
    case 422:
      return "Please fix the highlighted fields.";
    case 429:
      return "Too many attempts. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "Something went wrong on our end. Please try again shortly.";
    default:
      return "Something went wrong. Please try again.";
  }
}