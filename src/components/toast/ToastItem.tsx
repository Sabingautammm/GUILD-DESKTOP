import { useEffect, useRef, useState } from "react";
import type { ToastRecord, ToastType } from "./Types";

// Rule 5 — Color coding: complete class strings (not template-built) so Tailwind's
// scanner includes them in the build. Don't refactor these into `border-${color}-500`.
const STYLE: Record<
  ToastType,
  { border: string; iconBg: string; iconText: string; barBg: string; glyph: string }
> = {
  info: {
    border: "border-l-blue-500",
    iconBg: "bg-blue-500/15",
    iconText: "text-blue-400",
    barBg: "bg-blue-500",
    glyph: "i",
  },
  success: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-400",
    barBg: "bg-emerald-500",
    glyph: "\u2713",
  },
  warning: {
    border: "border-l-amber-500",
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-400",
    barBg: "bg-amber-500",
    glyph: "!",
  },
  error: {
    border: "border-l-rose-500",
    iconBg: "bg-rose-500/15",
    iconText: "text-rose-400",
    barBg: "bg-rose-500",
    glyph: "\u00d7",
  },
  loading: {
    border: "border-l-slate-500",
    iconBg: "bg-slate-500/15",
    iconText: "text-slate-400",
    barBg: "bg-slate-500",
    glyph: "\u25cc",
  },
};

export function ToastItem({ toast, onClose }: { toast: ToastRecord; onClose: () => void }) {
  const { type, title, description, duration, closing } = toast;
  const style = STYLE[type];
  const [entered, setEntered] = useState(false);
  const [dragX, setDragX] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Rule 4 — Dismissible: close button always present, swipe gesture layered on top.
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDragX(e.clientX - startX.current);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(dragX) > 90) onClose();
    else setDragX(0);
  };

  // Transform/opacity are per-drag/per-frame values — kept inline since Tailwind
  // classes can't express arbitrary runtime numbers. Everything static is a class.
  const transform = closing
    ? "translateX(120%)"
    : !entered
    ? "translateY(-12px) scale(0.96)"
    : `translateX(${dragX}px)`;
  const opacity = closing ? 0 : entered ? Math.max(0, 1 - Math.abs(dragX) / 160) : 0;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      role="status"
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`
        pointer-events-auto select-none cursor-grab
        w-full rounded-xl overflow-hidden
        bg-[#11131a]/90 backdrop-blur-md
        border border-white/[0.06] border-l-[3px] ${style.border}
        shadow-2xl shadow-black/40
        transition-[transform,opacity]
      `}
      style={{
        transform,
        opacity,
        transitionDuration: dragging.current ? "0ms" : "260ms, 220ms",
        transitionTimingFunction: dragging.current ? undefined : "cubic-bezier(.34,1.56,.64,1), linear",
      }}
    >
      <div className="flex items-start gap-3 px-3.5 py-3">
        <div
          className={`shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold ${style.iconBg} ${style.iconText}`}
        >
          {type === "loading" ? <Spinner /> : style.glyph}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-slate-100 leading-tight truncate">{title}</p>
          {description && (
            <p className="text-xs text-slate-400 leading-snug mt-0.5">{description}</p>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          X
        </button>
      </div>

      {duration !== Infinity && (
        <div className="h-0.5 bg-white/5">
          <div
            className={`h-full ${style.barBg}`}
            style={{
              width: entered && !closing ? 0 : "100%",
              transition: entered && !closing ? `width ${duration}ms linear` : "none",
            }}
          />
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" strokeWidth="3" className="stroke-current opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeWidth="3" strokeLinecap="round" className="stroke-current" />
    </svg>
  );
}