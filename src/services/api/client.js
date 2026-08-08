const API_BASE_URL = import.meta.env.VITE_API_URL?.trim()
  ? import.meta.env.VITE_API_URL : "/api";

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiFetch(path, options = {}) {
  const { timeoutMs = 10000, headers, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
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
  const raw = await response.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      // Non-JSON response handling
    }
  }

  if (!response.ok) {
    const body = data ?? {};
    throw new ApiError(
      body.message ?? defaultMessageForStatus(response.status),
      response.status,
      body.errors
    );
  }

  return data;
}

function defaultMessageForStatus(status) {
  switch (status) {
    case 400: return "That request wasn't valid. Please check your details.";
    case 401: return "Incorrect email or password.";
    case 403: return "You don't have permission to do that.";
    case 404: return "We couldn't find that.";
    case 409: return "An account with that email already exists.";
    case 422: return "Please fix the highlighted fields.";
    case 429: return "Too many attempts. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503: return "Something went wrong on our end. Please try again shortly.";
    default: return "Something went wrong. Please try again.";
  }
}
