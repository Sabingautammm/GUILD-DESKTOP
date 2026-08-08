import { createContext, useCallback, useContext, useRef, useState } from "react";
import { ToastItem } from "./ToastItem";
import { MAX_VISIBLE_TOASTS, TOAST_DURATIONS } from "./toastTypes";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, title, description, opts = {}) => {
    const id = ++idCounter.current;
    const duration = opts.duration ?? TOAST_DURATIONS[type] ?? 4000;
    setToasts((prev) => [...prev.slice(-MAX_VISIBLE_TOASTS + 1), { id, type, title, description, duration }]);
    return id;
  }, []);

  const toastApi = {
    info: (title, desc, opts) => addToast("info", title, desc, opts),
    success: (title, desc, opts) => addToast("success", title, desc, opts),
    warning: (title, desc, opts) => addToast("warning", title, desc, opts),
    error: (title, desc, opts) => addToast("error", title, desc, opts),
    loading: (title, desc) => addToast("loading", title, desc, { duration: Infinity }),
    dismiss,
    promise: async (promise, messages) => {
      const id = addToast("loading", messages.loading, messages.loadingDescription);
      try {
        const result = await promise;
        dismiss(id);
        const succTitle = typeof messages.success === "function" ? messages.success(result) : messages.success;
        const succDesc = typeof messages.successDescription === "function" ? messages.successDescription(result) : messages.successDescription;
        addToast("success", succTitle, succDesc);
        return result;
      } catch (err) {
        dismiss(id);
        const errTitle = typeof messages.error === "function" ? messages.error(err) : messages.error;
        const errDesc = typeof messages.errorDescription === "function" ? messages.errorDescription(err) : messages.errorDescription;
        addToast("error", errTitle, errDesc);
        throw err;
      }
    },
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
