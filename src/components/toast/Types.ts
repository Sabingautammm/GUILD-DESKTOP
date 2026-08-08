export type ToastType = "info" | "success" | "warning" | "error" | "loading";

export interface ToastOptions {
  /** ms before auto-dismiss. Defaults come from DURATIONS below. Pass Infinity to pin it. */
  duration?: number;
}

export interface ToastRecord {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
  closing: boolean;
}

/** Rule 2 — Timing: info dismisses fast, warnings hold longer, errors wait for the user. */
export const TOAST_DURATIONS: Record<ToastType, number> = {
  info: 4000,
  success: 5000,
  warning: 7000,
  error: 4000,
  loading: Infinity,
};

/** Rule 3 — Stacking: never show more than this many at once. */
export const MAX_VISIBLE_TOASTS = 2;

export interface PromiseMessages<T> {
  loading: string;
  loadingDescription?: string;
  success: string | ((result: T) => string);
  successDescription?: string | ((result: T) => string);
  error: string | ((err: unknown) => string);
  errorDescription?: string | ((err: unknown) => string);
}

export interface ToastApi {
  info: (title: string, description?: string, opts?: ToastOptions) => number;
  success: (title: string, description?: string, opts?: ToastOptions) => number;
  warning: (title: string, description?: string, opts?: ToastOptions) => number;
  error: (title: string, description?: string, opts?: ToastOptions) => number;
  loading: (title: string, description?: string) => number;
  dismiss: (id: number) => void;
  /** Wrap any promise (e.g. an apiFetch call) — shows loading, then flips to success/error. */
  promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>) => Promise<T>;
}