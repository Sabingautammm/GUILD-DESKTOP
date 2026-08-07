import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { ToastItem } from "./ToastItem";
import {
  MAX_VISIBLE_TOASTS,
  TOAST_DURATIONS,
  type PromiseMessages,
  type ToastApi,
  type ToastOptions,
  type ToastRecord,
  type ToastType,
} from "./Types";

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = (id: number) => {
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
  };

  const dismiss = useCallback((id: number) => {
    clearTimer(id);
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, closing: true } : t)));
    // matches the exit transition duration in ToastItem
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 220);
  }, []);

  const scheduleAutoDismiss = (id: number, duration: number) => {
    clearTimer(id);
    if (duration !== Infinity) {
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    }
  };

  const push = useCallback(
    (type: ToastType, title: string, description?: string, opts: ToastOptions = {}) => {
      const id = ++idRef.current;
      const duration = opts.duration ?? TOAST_DURATIONS[type];
      setToasts((list) => [...list, { id, type, title, description, duration, closing: false }]);
      scheduleAutoDismiss(id, duration);
      return id;
    },
    [dismiss],
  );

  const update = useCallback(
    (id: number, type: ToastType, title: string, description?: string) => {
      const duration = TOAST_DURATIONS[type];
      setToasts((list) =>
        list.map((t) => (t.id === id ? { ...t, type, title, description, duration } : t)),
      );
      scheduleAutoDismiss(id, duration);
    },
    [dismiss],
  );

  const promise = useCallback(
    async <T,>(p: Promise<T>, messages: PromiseMessages<T>): Promise<T> => {
      const id = push("loading", messages.loading, messages.loadingDescription);
      try {
        const result = await p;
        const title = typeof messages.success === "function" ? messages.success(result) : messages.success;
        const desc =
          typeof messages.successDescription === "function"
            ? messages.successDescription(result)
            : messages.successDescription;
        update(id, "success", title, desc);
        return result;
      } catch (err) {
        const title = typeof messages.error === "function" ? messages.error(err) : messages.error;
        const desc =
          typeof messages.errorDescription === "function"
            ? messages.errorDescription(err)
            : (messages.errorDescription ?? (err instanceof Error ? err.message : undefined));
        update(id, "error", title, desc);
        throw err;
      }
    },
    [push, update],
  );

  const api: ToastApi = {
    info: (title, description, opts) => push("info", title, description, opts),
    success: (title, description, opts) => push("success", title, description, opts),
    warning: (title, description, opts) => push("warning", title, description, opts),
    error: (title, description, opts) => push("error", title, description, opts),
    loading: (title, description) => push("loading", title, description),
    dismiss,
    promise,
  };

  // Rule 3 — Stacking: cap what's on screen, queue the rest silently.
  const visible = toasts.slice(-MAX_VISIBLE_TOASTS);
  const overflowCount = toasts.length - visible.length;

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Rule 1 — Position: top-center on mobile, bottom-right on desktop. Never dead-center. */}
      <div
        className="
          pointer-events-none fixed z-[999] flex flex-col gap-2
          top-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-sm
          sm:left-auto sm:right-4 sm:top-auto sm:bottom-4 sm:translate-x-0 sm:w-96
        "
      >
        {overflowCount > 0 && (
          <div className="pointer-events-none text-right text-[11px] font-medium text-slate-400 pr-1">
            +{overflowCount} more
          </div>
        )}
        {visible.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}