import { useToast } from "../components/toast/useToast";

export default function ToastDemoPage() {
  const { toast, dismissAll } = useToast();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-display text-cream">Toast Demo</h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toast.info("New notification", "You have received a new guild invitation.")}
            className="rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/30"
          >
            Info Toast
          </button>
          <button
            onClick={() => toast.success("Guild created", "Your guild was successfully created.")}
            className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/30"
          >
            Success Toast
          </button>
          <button
            onClick={() => toast.warning("Low activity", "Your guild has been inactive for 7 days.")}
            className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/30"
          >
            Warning Toast
          </button>
          <button
            onClick={() => toast.error("Something went wrong", "Unable to connect to the server.")}
            className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/30"
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
            className="rounded-lg border border-guild-600 px-4 py-2 text-sm font-medium text-guild-300 hover:bg-guild-800"
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
            className="rounded-lg border border-guild-600 px-4 py-2 text-sm font-medium text-guild-300 hover:bg-guild-800"
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
            className="rounded-lg border border-guild-600 px-4 py-2 text-sm font-medium text-guild-300 hover:bg-guild-800"
          >
            Long Message
          </button>
          <button
            onClick={dismissAll}
            className="rounded-lg border border-guild-600 px-4 py-2 text-sm font-medium text-guild-300 hover:bg-guild-800"
          >
            Dismiss All
          </button>
        </div>

        <p className="text-xs text-guild-500">
          Desktop: bottom-right | Mobile: top-center | Swipe to dismiss | Hover to pause | Max 2 visible
        </p>
      </div>
    </div>
  );
}