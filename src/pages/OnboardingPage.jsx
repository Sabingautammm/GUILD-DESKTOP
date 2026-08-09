import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiHash, FiShield, FiCheck, FiPlus, FiLogOut } from "react-icons/fi";
import {
  selectGame,
  submitGameIdentity,
  verifyLeaderPassword,
  createGuild,
  completeOnboarding,
} from "../services/api/authApi";
import { ApiError } from "../services/api/client";
import { useToast } from "../components/toast/ToastProvider";
import { useAuth } from "../features/auth/context/AuthContext";

const GAMES = ["PUBG", "Free Fire", "Mobile Legends"];

const ROLE_LABEL = {
  leader: "Leader",
  acting_leader: "Acting Leader",
  officer: "Officer",
  member: "Member",
  free: "Free Player",
};

function StepHeader({ step, total, title, description }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B9660B]">
        Step {step} of {total}
      </p>
      <h2 className="mt-1 text-xl font-bold text-[#17120D]">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-xs text-red-500">{message}</p>;
}

export default function OnboardingPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, membership, refresh } = useAuth();

  const [step, setStep] = useState("game");
  const [selectedGame, setSelectedGame] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [inGameName, setInGameName] = useState("");
  const [leaderPassword, setLeaderPassword] = useState("");
  const [guildName, setGuildName] = useState("");
  const [guildSlogan, setGuildSlogan] = useState("");
  const [createUid, setCreateUid] = useState("");
  const [createPw, setCreatePw] = useState("");
  const [createPwConfirm, setCreatePwConfirm] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-600">Please sign in first to continue onboarding.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 rounded-lg bg-[#17120D] px-5 py-2 text-sm font-semibold text-[#FFD873]"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (membership && membership.status !== "pending_approval") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-bold text-[#17120D]">You're all set!</p>
        <p className="text-sm text-slate-600 mt-2">
          You're an active member of guild <span className="font-mono font-semibold">{membership.guildUid}</span>
          {membership.role !== "member" && ` (as ${ROLE_LABEL[membership.role]})`}.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 rounded-lg bg-[#17120D] px-5 py-2 text-sm font-semibold text-[#FFD873]"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  const handleSelectGame = async () => {
    if (!selectedGame) {
      setError("Please select a game.");
      return;
    }
    setError("");
    setIsBusy(true);
    try {
      await toast.promise(selectGame(selectedGame), {
        loading: "Saving your game…",
        success: `Selected ${selectedGame}`,
        error: (e) => (e instanceof ApiError ? e.message : "Could not save selection."),
      });
      await refresh();
      setStep("identity");
    } catch {
      // toast handled
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmitIdentity = async () => {
    if (!/^\d+$/.test(gameUid.trim())) {
      setError("Game UID must be numeric.");
      return;
    }
    if (!inGameName.trim()) {
      setError("In-Game Name is required.");
      return;
    }
    setError("");
    setIsBusy(true);
    try {
      const res = await toast.promise(submitGameIdentity(gameUid.trim(), inGameName.trim()), {
        loading: "Detecting your guild status…",
        success: "Status detected",
        error: (e) => (e instanceof ApiError ? e.message : "Could not submit details."),
      });
      await refresh();
      const kind = res.status?.kind;
      if (kind === "leader") {
        setStep("leader-verify");
      } else if (kind === "free") {
        setStep("no-guild");
      } else {
        await finishOnboarding();
      }
    } catch {
      // toast handled
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyLeader = async () => {
    if (!leaderPassword) {
      setError("Enter your Leader password to verify.");
      return;
    }
    setError("");
    setIsBusy(true);
    try {
      await toast.promise(verifyLeaderPassword(leaderPassword), {
        loading: "Verifying leadership…",
        success: "Leadership verified",
        error: (e) => (e instanceof ApiError ? e.message : "Verification failed."),
      });
      await finishOnboarding();
    } catch {
      // toast handled
    } finally {
      setIsBusy(false);
    }
  };

  const handleStayFree = async () => {
    setIsBusy(true);
    try {
      await toast.promise(completeOnboarding(), {
        loading: "Finalizing…",
        success: "Welcome, Free Player!",
        error: (e) => (e instanceof ApiError ? e.message : "Could not complete onboarding."),
      });
      await refresh();
      navigate("/", { replace: true });
    } catch {
      // toast handled
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!guildName.trim()) {
      setError("Guild Name is required.");
      return;
    }
    if (!/^\d+$/.test(createUid.trim())) {
      setError("Guild UID must be numeric.");
      return;
    }
    if (!createPw || createPw.length < 6) {
      setError("Leader password must be at least 6 characters.");
      return;
    }
    if (createPw !== createPwConfirm) {
      setError("Password confirmation does not match.");
      return;
    }
    setError("");
    setIsBusy(true);
    try {
      await toast.promise(
        createGuild({
          guildUid: createUid.trim(),
          name: guildName.trim(),
          slogan: guildSlogan.trim(),
          avatar: "",
          leaderPassword: createPw,
          confirmPassword: createPwConfirm,
        }),
        {
          loading: "Creating guild…",
          success: "Guild created successfully!",
          successDescription: "You are now the Leader.",
          error: (e) => (e instanceof ApiError ? e.message : "Could not create guild."),
        }
      );
      await refresh();
      setStep("guild-success");
    } catch {
      // toast handled
    } finally {
      setIsBusy(false);
    }
  };

  const finishOnboarding = async () => {
    try {
      await completeOnboarding();
      await refresh();
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not complete onboarding.");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {step === "game" && (
        <div className="rounded-xl border border-[#EDE1CB] bg-white p-6">
          <StepHeader step={1} total={4} title="Which game do you play?" description="Select the game you will compete with in this guild." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GAMES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGame(g)}
                className={`rounded-xl border-2 px-4 py-6 text-sm font-bold transition-all ${
                  selectedGame === g
                    ? "border-[#E3A012] bg-[#FAF6EE] text-[#B9660B]"
                    : "border-[#EDE1CB] bg-white text-slate-600 hover:border-[#E3A012]/50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <ErrorBox message={error} />
          <button
            onClick={handleSelectGame}
            disabled={isBusy}
            className="mt-6 w-full rounded-lg bg-[#17120D] py-2.5 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Continue"}
          </button>
        </div>
      )}

      {step === "identity" && (
        <div className="rounded-xl border border-[#EDE1CB] bg-white p-6">
          <StepHeader step={2} total={4} title="Your game details" description={`Enter your ${selectedGame || ""} UID and in-game name. We'll detect your guild status automatically.`} />
          <div className="space-y-3">
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                inputMode="numeric"
                value={gameUid}
                onChange={(e) => setGameUid(e.target.value.replace(/\D/g, ""))}
                placeholder="Game UID (numeric)"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <input
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              placeholder="In-Game Name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <ErrorBox message={error} />
          <button
            onClick={handleSubmitIdentity}
            disabled={isBusy}
            className="mt-6 w-full rounded-lg bg-[#17120D] py-2.5 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Check guild status"}
          </button>
        </div>
      )}

      {step === "leader-verify" && (
        <div className="rounded-xl border border-[#EDE1CB] bg-white p-6">
          <StepHeader step={3} total={4} title="Leader verification" description="You're the Leader of this guild. Confirm with your Leader password to continue." />
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email (read-only)</label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Leader Password</label>
              <input
                type="password"
                value={leaderPassword}
                onChange={(e) => setLeaderPassword(e.target.value)}
                placeholder="The password you set when creating the guild"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <ErrorBox message={error} />
          <button
            onClick={handleVerifyLeader}
            disabled={isBusy}
            className="mt-6 w-full rounded-lg bg-[#17120D] py-2.5 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Verify & continue"}
          </button>
        </div>
      )}

      {step === "no-guild" && (
        <div className="rounded-xl border border-[#EDE1CB] bg-white p-6">
          <StepHeader step={3} total={4} title="You are currently not in a guild" description="Create a new guild to become its Leader, or continue as a Free Player." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setError("");
                setStep("create-guild");
              }}
              className="rounded-xl border-2 border-[#E3A012] bg-[#FAF6EE] p-6 text-left hover:brightness-95"
            >
              <FiPlus className="text-[#B9660B] text-xl" />
              <p className="mt-2 text-sm font-bold text-[#17120D]">Create Guild</p>
              <p className="text-xs text-slate-500 mt-1">Start a new guild and become its Leader.</p>
            </button>
            <button
              onClick={handleStayFree}
              disabled={isBusy}
              className="rounded-xl border-2 border-slate-200 bg-white p-6 text-left hover:border-slate-300"
            >
              <FiLogOut className="text-slate-500 text-xl" />
              <p className="mt-2 text-sm font-bold text-[#17120D]">Stay Without Guild</p>
              <p className="text-xs text-slate-500 mt-1">Continue as a Free Player. You can join or create a guild later.</p>
            </button>
          </div>
        </div>
      )}

      {step === "create-guild" && (
        <div className="rounded-xl border border-[#EDE1CB] bg-white p-6">
          <StepHeader step={4} total={4} title="Create your guild" />
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Guild Name *</label>
              <input
                value={guildName}
                onChange={(e) => setGuildName(e.target.value)}
                placeholder="e.g. 7x Esport"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Guild Slogan *</label>
              <input
                value={guildSlogan}
                onChange={(e) => setGuildSlogan(e.target.value)}
                placeholder="Short tagline for your guild"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Guild UID *</label>
              <div className="relative mt-1">
                <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  inputMode="numeric"
                  value={createUid}
                  onChange={(e) => setCreateUid(e.target.value.replace(/\D/g, ""))}
                  placeholder="Numeric Guild UID"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="relative flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <FiShield className="text-slate-400 text-sm" />
              <span className="text-xs text-slate-500">{user?.email ?? "your@email.com"}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">read-only</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Leader Password</label>
              <input
                type="password"
                value={createPw}
                onChange={(e) => setCreatePw(e.target.value)}
                placeholder="Min 6 characters"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
              <input
                type="password"
                value={createPwConfirm}
                onChange={(e) => setCreatePwConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <ErrorBox message={error} />
          <button
            onClick={handleCreateGuild}
            disabled={isBusy}
            className="mt-6 w-full rounded-lg bg-[#17120D] py-2.5 text-sm font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Create Guild"}
          </button>
        </div>
      )}

      {step === "guild-success" && (
        <div className="rounded-xl border border-[#EDE1CB] bg-white p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600/10 text-green-600">
            <FiCheck className="text-2xl" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-[#17120D]">Guild created successfully!</h2>
          <p className="mt-2 text-sm text-slate-600">
            {guildName.trim()} · #{createUid.trim()}
          </p>
          <p className="text-xs text-slate-500">Role: Leader</p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="mt-6 rounded-lg bg-[#17120D] px-6 py-2.5 text-sm font-semibold text-[#FFD873] hover:opacity-90"
          >
            Go to homepage
          </button>
        </div>
      )}
    </div>
  );
}