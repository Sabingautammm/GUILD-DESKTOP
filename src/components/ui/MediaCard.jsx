import { useState } from "react";
import { FiHeart, FiSend } from "react-icons/fi";
import { useToast } from "../toast/ToastProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import { toggleReaction, addComment } from "../../services/api/mediaApi";
import { ApiError } from "../../services/api/client";

export default function MediaCard({ media, onChanged }) {
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const iReacted = user && media.reactions?.some((id) => id === user.id || (id && id._id === user.id));

  const handleReact = async () => {
    if (!isAuthenticated) {
      toast.warning("Sign in to react");
      return;
    }
    setBusy(true);
    try {
      await toggleReaction(media._id);
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not react.");
    } finally {
      setBusy(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning("Sign in to comment");
      return;
    }
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await addComment(media._id, comment.trim());
      setComment("");
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not comment.");
    } finally {
      setBusy(false);
    }
  };

  const uploader = media.uploaderId;

  return (
    <article className="rounded-xl border border-[#EDE1CB] bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3A012]/10 text-sm font-bold text-[#B9660B]">
          {uploader?.name?.charAt(0).toUpperCase() || "?"}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#17120D] truncate">{uploader?.name ?? "Player"}</p>
          {media.guildUid && <p className="text-[11px] text-slate-400 font-mono">Guild {media.guildUid}</p>}
        </div>
        {media.visibility === "private" && (
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            Private
          </span>
        )}
      </div>

      <div className="bg-black aspect-video flex items-center justify-center overflow-hidden">
        {media.type === "video" ? (
          <video src={media.url} controls className="w-full h-full object-contain" />
        ) : (
          <img src={media.url} alt="Media" className="w-full h-full object-contain bg-black"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        )}
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <button
            onClick={handleReact}
            disabled={busy}
            className={`flex items-center gap-1.5 font-semibold hover:opacity-80 ${iReacted ? "text-red-500" : ""}`}
          >
            <FiHeart className={iReacted ? "fill-red-500" : ""} />
            {media.reactions?.length ?? 0}
          </button>
          <span className="text-xs text-slate-400">
            {media.createdAt ? new Date(media.createdAt).toLocaleDateString() : "Recently"}
          </span>
        </div>

        {media.comments && media.comments.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {media.comments.map((c) => (
              <li key={c._id ?? c.userId?.toString?.() ?? c.createdAt} className="text-xs text-slate-600">
                <span className="font-semibold text-[#17120D]">{c.userId?.name ?? "Player"}</span>{" "}
                {c.text}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleComment} className="mt-3 flex items-center gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-full bg-[#FAF6EE] border border-transparent px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button type="submit" disabled={busy || !comment.trim()} className="rounded-full bg-[#17120D] p-2 text-[#FFD873] hover:opacity-90 disabled:opacity-40">
            <FiSend className="text-xs" />
          </button>
        </form>
      </div>
    </article>
  );
}