import { createContext, useCallback, useContext, useRef, useState } from "react";
import { ToastContainer } from "./ToastContainer";
import { TOAST_DURATIONS } from "./toastTypes";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((type, message, description, opts = {}) => {
    const id = ++idCounter.current;
    const duration = opts.duration ?? TOAST_DURATIONS[type] ?? 4000;
    setToasts((prev) => [...prev, { id, type, message, description, duration, createdAt: Date.now() }]);
    return id;
  }, []);

  const toastApi = {
    info: (message, description, opts) => addToast("info", message, description, opts),
    success: (message, description, opts) => addToast("success", message, description, opts),
    warning: (message, description, opts) => addToast("warning", message, description, opts),
    error: (message, description, opts) => addToast("error", message, description, opts),
    loading: (message, description) => addToast("loading", message, description, { duration: Infinity }),
    dismiss,
    dismissAll,
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
        addToast("error", errTitle || "Something went wrong", errDesc);
        throw err;
      }
    },
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}