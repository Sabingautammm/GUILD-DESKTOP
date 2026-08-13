import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiShield, FiLogOut, FiPlusCircle, FiLoader, FiEdit3, FiCheck, FiX, FiTrash2, FiUsers, FiArrowRight, FiCamera, FiUpload, FiFile } from "react-icons/fi";
import PasswordInput from "../features/auth/components/PasswordInput";
import { apiFetch, ApiError } from "../services/api/client";
import { uploadAvatarFile, removeAvatar as removeAvatarApi } from "../services/api/mediaApi";
import { useToast } from "../components/toast/ToastProvider";
import { useAuth } from "../features/auth/context/AuthContext";
import { ROLE_LABEL } from "../features/dashboard/data/playerTypes";
import { usePlayerProfile } from "../features/dashboard/hooks/usePlayerProfile";
import { updateMyProfile } from "../features/dashboard/services/playerApi";
import { resolveMediaUrl } from "../utils/mediaUrl";

const ACCEPT_AVATAR = "image/jpeg,image/png,image/webp";
const AVATAR_MIMES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB

function validateAvatarFile(file) {
  if (!file) return { ok: false, message: "Please select an image." };
  const mime = (file.type || "").toLowerCase();
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!AVATAR_MIMES.includes(mime) || !AVATAR_EXTENSIONS.includes(ext)) {
    return { ok: false, message: "Unsupported file type. Profile picture must be JPG, PNG or WEBP." };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { ok: false, message: "Profile picture is too large. Maximum allowed is 2 MB." };
  }
  return { ok: true };
}

const STAT_MODES = [
  { key: "brRank", title: "BR Rank Match", hasPoints: true, pointsLabel: "Points" },
  { key: "csRank", title: "CS Rank Match", hasPoints: true, pointsLabel: "Star" },
  { key: "clashSquadCustom", title: "Clash Squad (Custom) Match", hasPoints: false },
];

const emptyMode = (hasPoints) => ({
  matches: 0,
  kd: 0,
  headshotRate: 0,
  winRate: 0,
  ...(hasPoints ? { rankPoints: 0 } : {}),
});

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const statsValid = (stats) => {
  for (const key of Object.keys(stats)) {
    const m = stats[key];
    if (m.matches < 0 || m.kd < 0 || m.headshotRate < 0 || m.headshotRate > 100 || m.winRate < 0 || m.winRate > 100 || (m.rankPoints !== undefined && m.rankPoints < 0)) {
      return false;
    }
  }
  return true;
};

function StatField({ label, value, onChange, max, step = "0.01" }) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-wide text-[#6B5B45] block mb-1">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(num(e.target.value))}
        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </label>
  );
}

export default function ProfilePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, membership, role, isAdmin, logout, refresh } = useAuth();
  const { player, refetch } = usePlayerProfile({ enabled: true });

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [inGameName, setInGameName] = useState(player?.inGameName || user?.inGameName || "");
  const nameTouchedRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);

  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const [editingStats, setEditingStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [savingStats, setSavingStats] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isFree = !membership;
  const isLeader = role === "leader";

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (password.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setPwError("Passwords do not match.");
      return;
    }
    setIsSavingPw(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "PUT",
        body: { newPassword: password },
      });
      toast.success("Password updated", "This session is now signed out. Please sign in again.");
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update password.");
    } finally {
      setIsSavingPw(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/");
  };

  const saveName = async (e) => {
    e.preventDefault();
    if (!inGameName.trim()) return;
    setIsSaving(true);
    try {
      await toast.promise(updateMyProfile({ inGameName: inGameName.trim() }), {
        loading: "Saving…",
        success: "Profile updated",
        error: (err) => (err instanceof ApiError ? err.message : "Could not update profile."),
      });
      nameTouchedRef.current = true;
      await Promise.all([refresh(), refetch()]);
    } catch {
      // toast handled it
    } finally {
      setIsSaving(false);
    }
  };

  // Sync the input once the profile loads (or after a save) without
  // overwriting whatever the user is currently typing.
  useEffect(() => {
    if (player?.inGameName && !nameTouchedRef.current) {
      setInGameName(player.inGameName);
    }
  }, [player?.inGameName]);

  const startEditStats = () => {
    const base = player?.stats || {};
    const next = {};
    for (const mode of STAT_MODES) {
      next[mode.key] = { ...emptyMode(mode.hasPoints) };
      if (base[mode.key]) {
        next[mode.key] = { ...next[mode.key], ...base[mode.key] };
      }
    }
    setStats(next);
    setStatsError("");
    setEditingStats(true);
  };

  const saveStats = async () => {
    if (!stats || !statsValid(stats)) {
      setStatsError("Invalid values. Use non-negative numbers; Headshot % and Win Rate % must be 0–100.");
      return;
    }
    setStatsError("");
    setSavingStats(true);
    try {
      await toast.promise(updateMyProfile({ seasonStats: stats }), {
        loading: "Saving statistics…",
        success: "Season stats updated",
        error: (err) => (err instanceof ApiError ? err.message : "Could not save statistics."),
      });
      setEditingStats(false);
      refetch();
    } catch {
      // toast handled it
    } finally {
      setSavingStats(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await apiFetch("/auth/account", { method: "DELETE" });
      toast.success("Account deleted", "Your account and related data were removed permanently.");
      setConfirmingDelete(false);
      await logout();
      navigate("/");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete account.");
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleAvatarSelect = (e) => {
    setAvatarError("");
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const result = validateAvatarFile(file);
    if (!result.ok) {
      setAvatarFile(null);
      setAvatarPreview("");
      setAvatarError(result.message);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setAvatarError("Please choose an image from your device.");
      return;
    }
    setIsSavingAvatar(true);
    try {
      await toast.promise(uploadAvatarFile(avatarFile), {
        loading: "Uploading picture…",
        success: "Profile picture updated",
        error: (err) => (err instanceof ApiError ? err.message : "Could not upload profile picture."),
      });
      await refresh();
      clearAvatarSelection();
      toast.success("Profile picture updated");
    } catch {
      // toast handled it
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const clearAvatarSelection = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    setAvatarError("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const removeAvatar = async () => {
    setIsSavingAvatar(true);
    try {
      await toast.promise(removeAvatarApi(), {
        loading: "Removing picture…",
        success: "Profile picture removed",
        error: (err) => (err instanceof ApiError ? err.message : "Could not remove profile picture."),
      });
      await refresh();
      clearAvatarSelection();
    } catch {
      // toast handled it
    } finally {
      setIsSavingAvatar(false);
    }
  };

  // Clean up the object URL when the component unmounts or the preview changes.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        {user?.avatar ? (
          <img
            src={resolveMediaUrl(user.avatar)}
            alt={user?.name}
            className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-[#E3A012]/30"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E3A012]/10 text-2xl font-bold text-[#B9660B]">
            {user?.name?.charAt(0).toUpperCase() || <FiUser />}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#17120D]">{user?.name ?? "Player"}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <FiMail className="text-xs" /> {user?.email}
          </p>
          <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isAdmin ? "bg-[#E3A012]/15 text-[#8a5200]" : "bg-slate-100 text-slate-500"
          }`}>
            <FiShield className="text-xs" /> {ROLE_LABEL[role] ?? role ?? "Free Player"}
          </span>
        </div>
      </div>

      {/* GUILD */}
      <section className="rounded-xl border border-[#EDE1CB] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45] mb-4">Guild</h2>
        {membership ? (
          <div className="rounded-lg border border-[#E3A012]/30 bg-[#FAF6EE] p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <p className="text-sm font-bold text-[#17120D]">{player?.guildName || `Guild ${membership.guildUid}`}</p>
                <p className="text-[11px] font-mono text-slate-400">Guild UID {membership.guildUid}</p>
              </div>
              <span className="rounded-full bg-[#E3A012]/15 px-2.5 py-1 text-[11px] font-bold text-[#8a5200]">
                Role: {ROLE_LABEL[membership.role] ?? membership.role}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/guild/${membership.guildUid}`)}
                className="flex items-center gap-1.5 rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90"
              >
                <FiUsers className="text-xs" /> View guild
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin/members")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <FiShield className="text-xs" /> Admin Dashboard
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#E3A012]/50 bg-[#FFFBEF] p-5 space-y-3">
            <p className="text-sm font-semibold text-[#17120D]">Not in a Guild</p>
            <p className="text-xs text-slate-500">Join an existing guild or create your own to become its Leader.</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/guild")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#B9660B] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                <FiUsers className="text-xs" /> Join Guild
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90"
              >
                <FiPlusCircle className="text-xs" /> Create Guild
              </button>
            </div>
          </div>
        )}
      </section>

      {/* PERSONAL INFORMATION */}
      <section className="rounded-xl border border-[#EDE1CB] bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Personal Information</h2>

        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#EDE1CB] bg-[#FAF6EE] p-4">
          <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E3A012]/15 ring-2 ring-[#E3A012]/30">
            {avatarPreview || user?.avatar ? (
              <img
                src={avatarPreview || resolveMediaUrl(user?.avatar) || ""}
                alt="Profile preview"
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <FiUser className="text-2xl text-[#B9660B]" />
            )}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            {!avatarFile ? (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-[#E3A012]/40 bg-[#FFFBEF] px-4 py-2 text-xs font-semibold text-[#8a5200] hover:bg-[#FFF6DC]"
              >
                <FiUpload /> Upload Profile Picture
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FiFile className="text-[#B9660B] shrink-0" />
                  <span className="text-xs font-semibold text-[#17120D] truncate">{avatarFile.name}</span>
                  <span className="text-[11px] text-slate-400">{(avatarFile.size / 1024).toFixed(0)} KB</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearAvatarSelection}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept={ACCEPT_AVATAR}
              onChange={handleAvatarSelect}
              className="hidden"
            />
            {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveAvatar}
                disabled={isSavingAvatar || !avatarFile}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-50"
              >
                {isSavingAvatar ? <FiLoader className="animate-spin" /> : <FiCamera />}
                Save picture
              </button>
              {user?.avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={isSavingAvatar}
                  className="text-[11px] font-semibold text-slate-400 hover:text-red-600 disabled:opacity-50"
                >
                  Remove picture
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Game</label>
            <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {user?.game || "—"}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Game UID (locked)</label>
            <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-600">
              {user?.gameUid || "—"}
            </p>
          </div>
          <form onSubmit={saveName} className="flex flex-col">
            <label htmlFor="in-game-name" className="text-xs font-semibold text-slate-700">In-Game Name</label>
            <input
              id="in-game-name"
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              placeholder="Your in-game name"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isSaving || !inGameName.trim()}
              className="mt-2 rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save name"}
            </button>
          </form>
        </div>
      </section>

      {/* SEASON STATISTICS */}
      <section className="rounded-xl border border-[#EDE1CB] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Season Statistics</h2>
          {!editingStats && (
            <button
              onClick={startEditStats}
              className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <FiEdit3 /> Edit stats
            </button>
          )}
        </div>

        {editingStats && stats ? (
          <>
            <div className="space-y-5">
              {STAT_MODES.map((mode) => (
                <div key={mode.key} className="rounded-lg border border-[#EDE1CB] bg-[#FAF6EE] p-4">
                  <p className="text-sm font-semibold text-[#17120D] mb-3">{mode.title}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {mode.hasPoints && (
                      <StatField label={mode.pointsLabel} value={stats[mode.key].rankPoints} onChange={(v) => setStats((s) => ({ ...s, [mode.key]: { ...s[mode.key], rankPoints: v } }))} max={undefined} step="1" />
                    )}
                    <StatField label="Matches" value={stats[mode.key].matches} onChange={(v) => setStats((s) => ({ ...s, [mode.key]: { ...s[mode.key], matches: v } }))} max={undefined} step="1" />
                    <StatField label="K/D" value={stats[mode.key].kd} onChange={(v) => setStats((s) => ({ ...s, [mode.key]: { ...s[mode.key], kd: v } }))} max={undefined} />
                    <StatField label="Headshot %" value={stats[mode.key].headshotRate} onChange={(v) => setStats((s) => ({ ...s, [mode.key]: { ...s[mode.key], headshotRate: v } }))} max={100} />
                    <StatField label="Win Rate %" value={stats[mode.key].winRate} onChange={(v) => setStats((s) => ({ ...s, [mode.key]: { ...s[mode.key], winRate: v } }))} max={100} />
                  </div>
                </div>
              ))}
            </div>
            {statsError && <p className="text-xs text-red-500">{statsError}</p>}
            <div className="flex gap-2">
              <button
                onClick={saveStats}
                disabled={savingStats}
                className="flex items-center gap-1.5 rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-50"
              >
                {savingStats ? <FiLoader className="animate-spin" /> : <FiCheck />} Save stats
              </button>
              <button
                onClick={() => setEditingStats(false)}
                disabled={savingStats}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <FiX /> Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {STAT_MODES.map((mode) => {
              const m = player?.stats?.[mode.key] || {};
              return (
                <div key={mode.key} className="rounded-lg border border-[#EDE1CB] bg-[#FAF6EE] p-4">
                  <p className="text-sm font-semibold text-[#17120D] mb-2">{mode.title}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    {mode.hasPoints && (
                      <div className="rounded-lg bg-white border border-[#EDE1CB] p-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B5B45]">{mode.pointsLabel}</p>
                        <p className="text-base font-bold text-[#17120D]">{(m.rankPoints ?? 0).toLocaleString()}</p>
                      </div>
                    )}
                    <div className="rounded-lg bg-white border border-[#EDE1CB] p-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B5B45]">Matches</p>
                      <p className="text-base font-bold text-[#17120D]">{(m.matches ?? 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-[#EDE1CB] p-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B5B45]">K/D</p>
                      <p className="text-base font-bold text-[#17120D]">{(m.kd ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-[#EDE1CB] p-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B5B45]">Headshot</p>
                      <p className="text-base font-bold text-[#17120D]">{(m.headshotRate ?? 0).toFixed(1)}%</p>
                    </div>
                    <div className="rounded-lg bg-white border border-[#EDE1CB] p-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B5B45]">Win Rate</p>
                      <p className="text-base font-bold text-[#17120D]">{(m.winRate ?? 0).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isFree && (
        <button
          onClick={() => navigate("/onboarding")}
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-[#E3A012]/50 bg-[#FFFBEF] p-5 text-sm font-bold text-[#8a5200] hover:bg-[#FFF6DC]"
        >
          <FiPlusCircle className="text-lg" /> You're a free player — Create Guild or Apply to join one
        </button>
      )}

      {/* ACCOUNT */}
      <section className="rounded-xl border border-[#EDE1CB] bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Account</h2>

        {isAdmin && (
          <button
            onClick={() => navigate("/admin/members")}
            className="flex items-center justify-between w-full rounded-lg border border-[#E3A012]/40 bg-[#FFFBEF] px-4 py-3 text-sm font-semibold text-[#8a5200] hover:bg-[#FFF6DC]"
          >
            <span className="flex items-center gap-2">
              <FiShield className="text-xs" /> Admin Dashboard
            </span>
            <FiArrowRight className="text-xs" />
          </button>
        )}

        {isLeader && (
          <form onSubmit={savePassword} className="rounded-lg border border-[#EDE1CB] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FiShield className="text-[#B9660B]" />
              <h3 className="text-sm font-semibold text-[#17120D]">Leader password</h3>
            </div>
            <p className="text-xs text-slate-400">Your Leader login uses Guild UID + this password. Changing it signs you out everywhere (session version).</p>
            <div className="space-y-3">
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
              <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" />
            </div>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            <button
              type="submit"
              disabled={isSavingPw}
              className="rounded-lg bg-[#17120D] px-5 py-2 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            >
              {isSavingPw && <FiLoader className="animate-spin" />} Update password
            </button>
          </form>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline"
        >
          <FiLogOut /> Sign out
        </button>

        <div className="pt-2 border-t border-[#F3EADA]">
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline"
          >
            <FiTrash2 /> Delete account
          </button>
          <p className="mt-1 text-[11px] text-slate-400">
            Permanently removes your account and data. Leaders must transfer leadership before deleting.
          </p>
        </div>
      </section>

      {/* DELETE CONFIRMATION */}
      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmingDelete(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-[#17120D]">Delete your account?</h3>
            <p className="text-sm text-slate-500">
              This will permanently delete your account, memberships, notifications and profile data. This action
              cannot be undone. If you lead a guild, transfer leadership or disband it first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <FiLoader className="animate-spin" />} Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}