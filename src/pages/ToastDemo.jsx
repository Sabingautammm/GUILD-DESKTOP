import { useToast } from "../components/toast/useToast";

export default function ToastDemoPage() {
  const { toast, dismissAll } = useToast();

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-white">Toast Demo</h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toast.info("New notification", "You have received a new guild invitation.")}
            className="rounded-lg bg-[#3b82f6]/20 px-4 py-2 text-sm font-medium text-[#3b82f6] hover:bg-[#3b82f6]/30"
          >
            Info Toast
          </button>
          <button
            onClick={() => toast.success("Guild created", "Your guild was successfully created.")}
            className="rounded-lg bg-[#10b981]/20 px-4 py-2 text-sm font-medium text-[#10b981] hover:bg-[#10b981]/30"
          >
            Success Toast
          </button>
          <button
            onClick={() => toast.warning("Low activity", "Your guild has been inactive for 7 days.")}
            className="rounded-lg bg-[#f59e0b]/20 px-4 py-2 text-sm font-medium text-[#f59e0b] hover:bg-[#f59e0b]/30"
          >
            Warning Toast
          </button>
          <button
            onClick={() => toast.error("Something went wrong", "Unable to connect to the server.")}
            className="rounded-lg bg-[#ef4444]/20 px-4 py-2 text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/30"
          >
            Error Toast
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              toast.success("Saved 1", "Your profile was updated.");
              toast.info("New notification", "You have received a new guild invitation.");
            }}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            Trigger 2 Toasts
          </button>
          <button
            onClick={() => {
              toast.info("Info", "First toast");
              toast.success("Success", "Second toast");
              toast.warning("Warning", "Third toast");
              toast.error("Error", "Fourth toast — this replaces the oldest info");
            }}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            Trigger 4 Toasts
          </button>
          <button
            onClick={() =>
              toast.success(
                "Your guild profile has been successfully updated",
                "Your guild information, player roster, introduction, history, and season statistics have all been synchronized successfully."
              )
            }
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            Long Message
          </button>
          <button
            onClick={dismissAll}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            Dismiss All
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Desktop: bottom-right | Mobile: top-center | Swipe to dismiss | Hover to pause | Max 2 visible
        </p>
      </div>
    </div>
  );
}