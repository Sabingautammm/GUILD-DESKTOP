const API_BASE_URL = import.meta.env.VITE_API_URL?.trim()
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '/api';

// Fail loudly in production if the API URL wasn't configured at build time —
// silently hitting the SPA rewrite would return index.html for every API call.
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL?.trim()) {
  console.error(
    "[client] VITE_API_URL is not set! In this production build every API call",
    "will hit vercel.json's rewrite and return HTML, breaking the app.",
    "Set VITE_API_URL=https://<your-backend-host>.com/api and redeploy."
  );
}

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// ---- Native session tokens (Bearer fallback) ----
// Inside the Tauri WebView2 shell, the backend's httpOnly cookies are
// third-party (tauri.localhost -> onrender.com) and are frequently blocked by
// tracking prevention — leaving the user logged out even after a successful
// Google exchange. The backend therefore also returns raw tokens when we send
// X-Client-Type: native; we persist them here and attach Authorization on
// every call. On the normal web origin cookies keep working as before.
const TOKEN_STORAGE_KEY = "guild_auth_tokens";

function readStoredTokens() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredTokens(tokens) {
  try {
    if (!tokens || (!tokens.accessToken && !tokens.refreshToken)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    }
  } catch {
    // storage unavailable — cookie flow still applies
  }
}

export function clearStoredTokens() {
  writeStoredTokens(null);
}

// Capture native tokens from any API response that carries them
// (/auth/google, /auth/refresh). Silently ignores everything else.
function captureTokens(data) {
  if (data && typeof data === "object" && data.accessToken) {
    writeStoredTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || null,
    });
  }
}

// Honeypot: timestamp when page loaded (bots often submit immediately)
const PAGE_LOAD_TIME = Date.now();

// Generate a simple client fingerprint for bot detection
function generateClientFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('fingerprint', 2, 2);
  const canvasFingerprint = canvas.toDataURL();

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvasFingerprint.substring(0, 50),
  ].join('|');

  // Simple hash
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    hash = ((hash << 5) - hash) + components.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

const CLIENT_FINGERPRINT = generateClientFingerprint();

function addBotProtectionFields(body) {
  if (!body || typeof body !== 'object') return body;

  const protectedBody = { ...body };

  // Add request timestamp (honeypot - bots often submit too fast)
  protectedBody._request_ts = Date.now();
  protectedBody._page_load_ts = PAGE_LOAD_TIME;

  // Add client fingerprint
  protectedBody._client_fp = CLIENT_FINGERPRINT;

  // Add hCaptcha token if available (from global window.hcaptchaToken)
  if (typeof window !== 'undefined' && window.hcaptchaToken) {
    protectedBody.hcaptcha_token = window.hcaptchaToken;
  }

  return protectedBody;
}

export async function apiFetch(path, options = {}) {
  const { timeoutMs = 10000, headers, body, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  // FormData bodies must not set a Content-Type header — the browser needs to
  // insert the multipart boundary itself. Plain objects are JSON-encoded.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const storedTokens = readStoredTokens();
  const requestHeaders = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    // Identify as a native client so the backend returns raw tokens in the
    // body for /auth/google and /auth/refresh.
    "X-Client-Type": "native",
    ...(storedTokens?.accessToken && { Authorization: `Bearer ${storedTokens.accessToken}` }),
    ...headers,
  };
  const requestBody = isFormData
    ? body
    : body !== undefined
      ? JSON.stringify(addBotProtectionFields(body))
      : undefined;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: requestBody,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err && (err.name === "AbortError" || err instanceof DOMException)) {
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

  if (response.ok) {
    captureTokens(data);
    return data;
  }

  // Access token expired? Try one silent refresh with the stored refresh
  // token, then retry the original request once. Never recurse on /auth/*.
  if (
    response.status === 401 &&
    storedTokens?.refreshToken &&
    !path.startsWith("/auth/")
  ) {
    clearTimeout(timeoutId);
    try {
      const refreshed = await refreshNativeSession(storedTokens.refreshToken);
      if (refreshed) {
        return apiFetch(path, options);
      }
    } catch {
      // fall through to the original error
    }
  }

  const errBody = data ?? {};
  throw new ApiError(
    errBody.message ?? defaultMessageForStatus(response.status),
    response.status,
    errBody.errors
  );
}

// Exchange the stored refresh token for a fresh pair. Returns true on success.
async function refreshNativeSession(refreshToken) {
  try {
    const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client-Type": "native" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data?.accessToken) {
      writeStoredTokens(null);
      return false;
    }
    writeStoredTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  } catch {
    return false;
  }
}

// Multipart file upload with a longer timeout (videos can take a while).
export function apiUpload(path, formData, timeoutMs = 120000) {
  return apiFetch(path, { method: "POST", body: formData, timeoutMs });
}

function defaultMessageForStatus(status) {
  switch (status) {
    case 400: return "That request wasn't valid. Please check your details.";
    case 401: return "Incorrect email or password.";
    case 403: return "You don't have permission to do that.";
    case 404: return "We couldn't find that.";
    case 409: return "A conflict occurred. This may be a duplicate guild UID, game UID, or email.";
    case 422: return "Please fix the highlighted fields.";
    case 429: return "Too many attempts. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503: return "Something went wrong on our end. Please try again shortly.";
    default: return "Something went wrong. Please try again.";
  }
}
