import { useState } from "react";
import { FiHeart, FiSend } from "react-icons/fi";
import { useToast } from "../toast/ToastProvider";
import { useAuth } from "../../features/auth/context/AuthContext";
import { toggleReaction, addComment } from "../../services/api/mediaApi";
import { ApiError } from "../../services/api/client";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { playerName } from "../../utils/playerName";

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
    <article className="rounded-xl border border-guild-700 bg-guild-900 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/10 text-sm font-bold text-gold-400 ring-1 ring-gold-500/30">
          {playerName(uploader, "?").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cream truncate">{playerName(uploader)}</p>
          {media.guildUid && <p className="text-[11px] text-guild-500 font-mono">Guild {media.guildUid}</p>}
        </div>
        {media.visibility === "private" && (
          <span className="ml-auto rounded-full bg-guild-800 px-2 py-0.5 text-[10px] font-semibold text-guild-400">
            Private
          </span>
        )}
      </div>

      <div className="bg-black aspect-video flex items-center justify-center overflow-hidden">
        {media.type === "video" ? (
          <video src={resolveMediaUrl(media.url)} controls className="w-full h-full object-contain" />
        ) : (
          <img src={resolveMediaUrl(media.url)} alt="Media" className="w-full h-full object-contain bg-black"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        )}
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-4 text-sm text-guild-300">
          <button
            onClick={handleReact}
            disabled={busy}
            className={`flex items-center gap-1.5 font-semibold hover:opacity-80 ${iReacted ? "text-red-400" : ""}`}
          >
            <FiHeart className={iReacted ? "fill-red-400" : ""} />
            {media.reactions?.length ?? 0}
          </button>
          <span className="text-xs text-guild-500">
            {media.createdAt ? new Date(media.createdAt).toLocaleDateString() : "Recently"}
          </span>
        </div>

        {media.comments && media.comments.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {media.comments.map((c) => (
              <li key={c._id ?? c.userId?.toString?.() ?? c.createdAt} className="text-xs text-guild-300">
                <span className="font-semibold text-cream">{playerName(c.userId)}</span>{" "}
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
            className="flex-1 rounded-full input-dark px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <button type="submit" disabled={busy || !comment.trim()} className="rounded-full gold-gradient-bg p-2 text-guild-950 hover:brightness-110 disabled:opacity-40">
            <FiSend className="text-xs" />
          </button>
        </form>
      </div>
    </article>
  );
}