import { useCallback, useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

export function ToastItem({ toast, onDismiss }) {
  const [closing, setClosing] = useState(false);

  const handleDismiss = useCallback(() => {
    setClosing(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (toast.duration !== Infinity) {
      const timer = setTimeout(handleDismiss, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, handleDismiss]);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200 ${
        closing ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div>
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-slate-500">{toast.description}</p>
        )}
      </div>
      <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600">
        <IoCloseSharp />
      </button>
    </div>
  );
}
