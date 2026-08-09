import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoCloseSharp,
  IoInformationCircle,
  IoWarning,
} from "react-icons/io5";
import { TOAST_COLORS } from "./toastTypes";

const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

function ToastIcon({ type }) {
  const size = 18;
  if (type === "loading") {
    return (
      <span
        className="block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/20 border-t-[#f59e0b]"
        aria-hidden="true"
      />
    );
  }
  const icons = {
    info: <IoInformationCircle size={size} />,
    success: <IoCheckmarkCircle size={size} />,
    warning: <IoWarning size={size} />,
    error: <IoCloseCircle size={size} />,
  };
  return icons[type] ?? icons.info;
}

export function Toast({ toast, onDismiss }) {
  const colors = TOAST_COLORS[toast.type] ?? TOAST_COLORS.info;
  const hasTimer = Number.isFinite(toast.duration);

  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(toast.duration);
  const [paused, setPaused] = useState(false);
  const [exitDir, setExitDir] = useState(0);
  const mobileRef = useRef(isMobile());

  const dismiss = useCallback(() => onDismiss(toast.id), [toast.id, onDismiss]);

  const tick = useCallback(() => {
    const el = progressRef.current;
    const total = toast.duration;
    const remaining = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current));
    if (el) el.style.transform = `scaleX(${remaining / total})`;
    if (remaining > 0) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [toast.duration]);

  const pauseTimer = useCallback(() => {
    if (paused || !hasTimer) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current));
    setPaused(true);
  }, [paused, hasTimer]);

  const resumeTimer = useCallback(() => {
    if (!paused) return;
    setPaused(false);
  }, [paused]);

  useEffect(() => {
    if (!hasTimer) return;
    if (!paused) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(dismiss, remainingRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
    const onVisibility = () => {
      if (document.hidden) pauseTimer();
      else resumeTimer();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, hasTimer, dismiss, tick, pauseTimer, resumeTimer]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const handleDragEnd = (_e, info) => {
    const width = progressRef.current?.parentElement?.offsetWidth ?? 320;
    const threshold = Math.max(80, width * 0.3);
    if (Math.abs(info.offset.x) > threshold) {
      setExitDir(info.offset.x > 0 ? 1 : -1);
      dismiss();
    }
  };

  const enter = mobileRef.current
    ? { opacity: 0, y: -32, scale: 0.98 }
    : { opacity: 0, x: 80, scale: 0.95 };

  const exit = mobileRef.current
    ? { opacity: 0, y: -40, transition: { duration: 0.2 } }
    : { opacity: 0, x: exitDir === 0 ? 80 : 140 * exitDir, transition: { duration: 0.22 } };

  const aria =
    toast.type === "error"
      ? { role: "alert", "aria-live": "assertive" }
      : { role: "status", "aria-live": "polite" };

  return (
    <motion.div
      layout
      drag="x"
      dragSnapToOrigin
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      initial={enter}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={exit}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onTouchStart={pauseTimer}
      onTouchEnd={resumeTimer}
      onKeyDown={(e) => {
        if (e.key === "Escape") dismiss();
      }}
      className="pointer-events-auto relative w-full overflow-hidden rounded-xl border bg-[#0a0a0f] p-4 pl-5 shadow-2xl outline-none"
      style={{
        borderColor: colors.border,
        boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 24px ${colors.accent}33`,
      }}
      {...aria}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: colors.accent }}
      />

      <div className="flex items-start gap-3 pr-7">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.iconBg, color: colors.icon }}
        >
          <ToastIcon type={toast.type} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-white">{toast.message}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{toast.description}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Close notification"
        className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 hover:text-white"
      >
        <IoCloseSharp size={16} />
      </button>

      {hasTimer && (
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
          <div
            ref={progressRef}
            className="h-full w-full origin-left"
            style={{
              backgroundColor: colors.progress,
              transform: "scaleX(1)",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}