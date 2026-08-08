import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiShield, FiLogOut, FiPlusCircle, FiLoader } from "react-icons/fi";
import PasswordInput from "../features/auth/components/PasswordInput";
import { apiFetch, ApiError } from "../services/api/client";
import { useToast } from "../components/toast/ToastProvider";
import { useAuth } from "../features/auth/context/AuthContext";
import { ROLE_LABEL } from "../features/dashboard/data/playerTypes";

export default function ProfilePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, membership, role, isAdmin, logout, refresh } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [inGameName, setInGameName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);

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
        body: JSON.stringify({ newPassword: password }),
      });
      toast.success("Password updated", "Use it next time you log in as Leader.");
      setPassword("");
      setConfirm("");
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
      await apiFetch("/players/me", {
        method: "PUT",
        body: JSON.stringify({ inGameName: inGameName.trim() }),
      });
      toast.success("Profile updated");
      setInGameName("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E3A012]/10 text-2xl font-bold text-[#B9660B]">
          {user?.name?.charAt(0).toUpperCase() || <FiUser />}
        </span>
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

      {membership && (
        <button
          onClick={() => navigate(`/guild/${membership.guildUid}`)}
          className="w-full rounded-xl border border-[#EDE1CB] bg-white p-4 text-left hover:bg-[#FAF6EE]"
        >
          <p className="text-[11px] uppercase tracking-wide text-[#6B5B45]">Your guild</p>
          <p className="text-sm font-bold text-[#17120D] mt-0.5">
            GUILD {membership.guildUid} → <span className="text-[#B9660B]">View profile</span>
          </p>
        </button>
      )}

      {isFree && (
        <button
          onClick={() => navigate("/onboarding")}
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-[#E3A012]/50 bg-[#FFFBEF] p-5 text-sm font-bold text-[#8a5200] hover:bg-[#FFF6DC]"
        >
          <FiPlusCircle className="text-lg" /> You're a free player — Create Guild or Apply to join one
        </button>
      )}

      {isLeader && (
        <form onSubmit={savePassword} className="rounded-xl border border-[#EDE1CB] bg-white p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FiShield className="text-[#B9660B]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Leader password</h2>
          </div>
          <p className="text-xs text-slate-400">Your Leader login uses Guild UID + this password. Changing it signs you out everywhere (session version).</p>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
          <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" />
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

      <div className="rounded-xl border border-[#EDE1CB] bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">In-game name</h2>
        <form onSubmit={saveName} className="flex gap-2">
          <input
            value={inGameName}
            onChange={(e) => setInGameName(e.target.value)}
            placeholder="Your Free Fire / PUBG in-game name"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={isSaving || !inGameName.trim()}
            className="rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
        </form>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline"
      >
        <FiLogOut /> Sign out
      </button>
    </div>
  );
}