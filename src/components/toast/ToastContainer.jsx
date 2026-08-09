import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast";
import { MAX_VISIBLE_TOASTS } from "./toastTypes";

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed left-0 right-0 top-4 z-[60] flex flex-col gap-3 px-4 md:left-auto md:right-6 md:bottom-6 md:top-auto md:w-[360px] md:items-stretch md:px-0 md:flex-col-reverse"
    >
      <AnimatePresence>
        {toasts.slice(-MAX_VISIBLE_TOASTS).map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}