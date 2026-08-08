import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiLoader, FiAlertCircle, FiUpload } from "react-icons/fi";
import MediaCard from "../components/ui/MediaCard";
import { getGallery, uploadMedia } from "../services/api/mediaApi";
import { ApiError } from "../services/api/client";
import { useToast } from "../components/toast/ToastProvider";
import { useAuth } from "../features/auth/context/AuthContext";

export default function GalleryPage({ reelOnly = false }) {
  const toast = useToast();
  const { isAuthenticated, membership } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const guildUid = searchParams.get("guildUid") ?? "";
  const playerUid = searchParams.get("playerUid") ?? "";

  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showUpload, setShowUpload] = useState(false);
  const [upload, setUpload] = useState({ url: "", type: "photo", category: "guild", visibility: "public" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const params = {
      guildUid: guildUid || undefined,
      playerUid: playerUid || undefined,
      type: reelOnly ? "video" : undefined,
    };
    getGallery(params)
      .then((d) => !cancelled && setMedia(Array.isArray(d) ? d : []))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load gallery."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [guildUid, playerUid, reelOnly, refreshKey]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!upload.url.trim()) return;
    setUploading(true);
    try {
      await toast.promise(uploadMedia(upload), {
        loading: "Uploading…",
        success: "Media uploaded",
        successDescription: membership ? "Awaiting admin approval." : undefined,
        error: (err) => (err instanceof ApiError ? err.message : "Upload failed."),
      });
      setShowUpload(false);
      setUpload({ url: "", type: "photo", category: "guild", visibility: "public" });
      setRefreshKey((k) => k + 1);
    } catch {
      // toast handled it
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#17120D]">{reelOnly ? "Reels" : "Gallery"}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {reelOnly ? "Videos from guilds around the community." : "Photos and videos, searchable by Guild UID or Player UID."}
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-full bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90"
          >
            <FiUpload /> Upload media
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={guildUid}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            const next = new URLSearchParams(searchParams);
            if (v) next.set("guildUid", v);
            else next.delete("guildUid");
            setSearchParams(next, { replace: true });
          }}
          placeholder="Filter by Guild UID"
          inputMode="numeric"
          className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input
          value={playerUid}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            const next = new URLSearchParams(searchParams);
            if (v) next.set("playerUid", v);
            else next.delete("playerUid");
            setSearchParams(next, { replace: true });
          }}
          placeholder="Filter by Player UID"
          inputMode="numeric"
          className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <FiLoader className="animate-spin text-2xl text-[#B9660B]" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <FiAlertCircle className="mx-auto text-3xl text-[#B9660B]" />
          <p className="mt-3 text-sm font-semibold text-[#17120D]">{error}</p>
        </div>
      ) : media.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          {showUpload ? "" : "No media found. Uploaded media must be approved by guild admins to appear here."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {media.map((m) => (
            <MediaCard key={m._id} media={m} onChanged={() => setRefreshKey((k) => k + 1)} />
          ))}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowUpload(false)}>
          <form
            onSubmit={handleUpload}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900">Upload media</h3>
            <input
              value={upload.url}
              onChange={(e) => setUpload((u) => ({ ...u, url: e.target.value }))}
              placeholder="Media URL (https://…)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-600">
                Type
                <select
                  value={upload.type}
                  onChange={(e) => setUpload((u) => ({ ...u, type: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Visibility
                <select
                  value={upload.visibility}
                  onChange={(e) => setUpload((u) => ({ ...u, visibility: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="public">Public</option>
                  <option value="private">Guild members only</option>
                </select>
              </label>
            </div>

            {membership && (
              <div>
                <label className="text-xs font-semibold text-slate-600">Category (you're in a guild)</label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs">
                    <input
                      type="radio"
                      name="category"
                      checked={upload.category === "guild"}
                      onChange={() => setUpload((u) => ({ ...u, category: "guild" }))}
                    />
                    Guild — stays with the guild
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs">
                    <input
                      type="radio"
                      name="category"
                      checked={upload.category === "personal"}
                      onChange={() => setUpload((u) => ({ ...u, category: "personal" }))}
                    />
                    Personal — stays on your profile
                  </label>
                </div>
              </div>
            )}

            {membership && (
              <p className="text-[11px] text-slate-400">
                While you're an active member, all uploads are reviewed by guild admins before publishing.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 rounded-lg bg-[#17120D] py-2 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}