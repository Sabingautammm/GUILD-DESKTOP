import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHash, FiShield, FiLoader } from "react-icons/fi";
import { checkGuildUid, createGuild } from "../services/api/authApi";
import { applyToGuild } from "../services/api/guildApi";
import { ApiError } from "../services/api/client";
import { useToast } from "../components/toast/ToastProvider";
import { useAuth } from "../features/auth/context/AuthContext";

export default function OnboardingPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, membership, refresh } = useAuth();

  const [uid, setUid] = useState("");
  const [uidError, setUidError] = useState("");
  const [checked, setChecked] = useState(null); // { exists, guild } | { exists: false }
  const [form, setForm] = useState({ name: "", slogan: "", password: "" });
  const [isBusy, setIsBusy] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-600">Please sign in first to join or create a guild.</p>
        <button onClick={() => navigate("/login")} className="mt-4 rounded-lg bg-[#17120D] px-5 py-2 text-sm font-semibold text-[#FFD873]">
          Sign in
        </button>
      </div>
    );
  }

  if (membership) {
    const isPending = membership.status === "pending_approval";
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-bold text-[#17120D]">{isPending ? "Application pending" : "You're all set!"}</p>
        <p className="text-sm text-slate-600 mt-2">
          {isPending ? (
            <>
              Your application to guild{" "}
              <span className="font-mono font-semibold">{membership.guildUid}</span> is awaiting approval by the guild
              leaders. You'll be able to play the moment it's approved.
            </>
          ) : (
            <>
              You're an active member of guild{" "}
              <span className="font-mono font-semibold">{membership.guildUid}</span>
              {membership.role !== "member" && ` (as ${membership.role.replace("_", " ")})`}.
            </>
          )}
        </p>
        <button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-[#17120D] px-5 py-2 text-sm font-semibold text-[#FFD873]">
          Go to dashboard
        </button>
      </div>
    );
  }

  const lookupGuild = async () => {
    setUidError("");
    if (!/^\d+$/.test(uid.trim())) {
      setUidError("Guild UID must be numeric.");
      return;
    }
    setChecked(null);
    setIsBusy(true);
    try {
      const result = await checkGuildUid(uid.trim());
      setChecked(result);
    } catch (err) {
      setChecked(null);
      setUidError(err instanceof ApiError ? err.message : "Could not look up this UID.");
    } finally {
      setIsBusy(false);
    }
  };

  const applyToExisting = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await toast.promise(applyToGuild(uid.trim()), {
        loading: "Applying…",
        success: "Application sent",
        successDescription: "An admin will review your request.",
        error: (err) => (err instanceof ApiError ? err.message : "Could not apply."),
      });
      await refresh();
      navigate("/");
    } catch {
      // toast surfaced error
    } finally {
      setIsBusy(false);
    }
  };

  const createNewGuild = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await toast.promise(
        createGuild({
          guildUid: uid.trim(),
          name: form.name,
          slogan: form.slogan,
          avatar: "",
          leaderPassword: form.password,
        }),
        {
          loading: "Creating guild…",
          success: "Guild created",
          successDescription: "You are now the Leader!",
          error: (err) => (err instanceof ApiError ? err.message : "Could not create guild."),
        }
      );
      await refresh();
      navigate("/");
    } catch {
      // toast handled error
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#17120D]">Join or create a guild</h1>
      <p className="text-sm text-slate-600 mt-1">
        Enter your in-game Guild UID (Free Fire, PUBG, etc.) to get started.
      </p>

      <div className="mt-6 rounded-xl border border-[#EDE1CB] bg-white p-6 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-800">Are you in a guild?</label>
          <p className="text-xs text-slate-500 mt-1">Enter the numeric UID of your guild below.</p>
        </div>

        <div className="relative">
          <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            inputMode="numeric"
            value={uid}
            onChange={(e) => {
              setUid(e.target.value.replace(/\D/g, ""));
              setChecked(null);
            }}
            placeholder="Numeric guild UID, e.g. 14556656"
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        {uidError && <p className="text-xs text-red-500">{uidError}</p>}

        {!checked && (
          <button
            onClick={lookupGuild}
            disabled={isBusy}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#17120D] py-2 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-60"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Check guild UID"}
          </button>
        )}

        {checked && checked.exists && checked.guild && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-[#FAF6EE] border border-[#EDE1CB] p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3A012]/10 text-[#B9660B]">
                <FiShield className="text-lg" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#17120D]">{checked.guild.name}</p>
                <p className="text-xs text-slate-500">{checked.guild.slogan}</p>
                <p className="text-xs text-slate-400 font-mono">UID {checked.guild.guildUid}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              This guild already exists. Apply to join — a leader/acting leader or an officer will review your request.
            </p>
            <button
              onClick={applyToExisting}
              disabled={isBusy}
              className="w-full rounded-lg bg-[#17120D] py-2 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-60"
            >
              {isBusy ? "Applying…" : "Apply to join"}
            </button>
          </div>
        )}

        {checked && !checked.exists && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Guild <span className="font-mono font-semibold">{uid}</span> doesn't exist yet. Create it and become its
              Leader — anyone who claims this UID first becomes the Leader.
            </p>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Guild name *"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              value={form.slogan}
              onChange={(e) => setForm((f) => ({ ...f, slogan: e.target.value }))}
              placeholder="Guild slogan (optional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Leader password *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Only the Leader uses a password — you'll log in with Guild UID + this later. Editable in Profile.
              </p>
            </div>
            <button
              onClick={createNewGuild}
              disabled={isBusy || !form.name || !form.password}
              className="w-full rounded-lg bg-[#17120D] py-2 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-50"
            >
              {isBusy ? "Creating…" : "Create guild & become Leader"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}