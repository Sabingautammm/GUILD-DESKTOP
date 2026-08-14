import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiHash, FiShield, FiCheck, FiPlus, FiLogOut } from "react-icons/fi";
import {
  submitUidRegion,
  selectGame,
  submitGameIdentity,
  verifyLeaderPassword,
  createGuild,
  completeOnboarding,
} from "../features/auth/services/authApi";
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
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">
        Step {step} of {total}
      </p>
      <h2 className="mt-1 text-xl font-display text-cream">{title}</h2>
      {description && <p className="mt-1 text-sm text-guild-400">{description}</p>}
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-xs text-red-400">{message}</p>;
}

export default function OnboardingPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, membership, refresh } = useAuth();

  const [step, setStep] = useState("uid-region");
  const [selectedGame, setSelectedGame] = useState("");
  const [uid, setUid] = useState("");
  const [region, setRegion] = useState("");
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
        <p className="text-sm text-guild-400">Please sign in first to continue onboarding.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 rounded-lg gold-gradient-bg px-5 py-2 text-sm font-bold text-guild-950 hover:brightness-110"
        >
          Sign in
        </button>
      </div>
    );
  }

  const handleAllSetDone = async () => {
    setError("");
    setIsBusy(true);
    try {
      await completeOnboarding();
    } catch {
      // Non-fatal: an active member is always allowed into the dashboard.
    } finally {
      setIsBusy(false);
    }
    await refresh();
    navigate("/", { replace: true });
  };

  if (membership && membership.status !== "pending_approval") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-display text-cream">You're all set!</p>
        <p className="text-sm text-guild-400 mt-2">
          You're an active member of guild <span className="font-mono font-semibold text-gold-300">{membership.guildUid}</span>
          {membership.role !== "member" && ` (as ${ROLE_LABEL[membership.role]})`}.
        </p>
        <button
          onClick={handleAllSetDone}
          disabled={isBusy}
          className="mt-4 rounded-lg gold-gradient-bg px-5 py-2 text-sm font-bold text-guild-950 hover:brightness-110 disabled:opacity-60"
        >
          {isBusy ? "Finishing setup…" : "Go to dashboard"}
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

  const handleSubmitUidRegion = async () => {
    if (!/^\d+$/.test(uid.trim())) {
      setError("UID must be numeric.");
      return;
    }
    if (!region) {
      setError("Please select a region.");
      return;
    }
    setError("");
    setIsBusy(true);
    try {
      await toast.promise(submitUidRegion(uid.trim(), region), {
        loading: "Saving UID and region…",
        success: "UID and region saved",
        error: (e) => (e instanceof ApiError ? e.message : "Could not save UID and region."),
      });
      await refresh();
      setStep("game");
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
      const needsVerification = res.status?.needsVerification;
      if (kind === "leader" && needsVerification) {
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

  const REGIONS = [
    { code: "IND", label: "India" },
    { code: "BR", label: "Brazil" },
    { code: "US", label: "United States" },
    { code: "SAC", label: "South America" },
    { code: "NA", label: "North America" },
    { code: "SG", label: "Singapore" },
    { code: "BD", label: "Bangladesh" },
    { code: "VN", label: "Vietnam" },
    { code: "TH", label: "Thailand" },
    { code: "ID", label: "Indonesia" },
    { code: "RU", label: "Russia" },
    { code: "TW", label: "Taiwan" },
    { code: "ME", label: "Middle East" },
    { code: "PK", label: "Pakistan" },
    { code: "CIS", label: "CIS" },
    { code: "EUROPE", label: "Europe" },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {step === "uid-region" && (
        <div className="card-surface p-6">
          <StepHeader step={1} total={5} title="Enter your UID and Region" description="This is required to fetch your Free Fire profile." />
          <div className="space-y-3">
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500 text-sm" />
              <input
                inputMode="numeric"
                value={uid}
                onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
                placeholder="Free Fire UID (numeric)"
                className="w-full input-dark rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-guild-300 mb-1 block">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">Select Region</option>
                {REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ErrorBox message={error} />
          <button
            onClick={handleSubmitUidRegion}
            disabled={isBusy}
            className="mt-6 w-full rounded-lg gold-gradient-bg py-2.5 text-sm font-bold text-guild-950 hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Continue"}
          </button>
        </div>
      )}

      {step === "game" && (
        <div className="card-surface p-6">
          <StepHeader step={2} total={5} title="Which game do you play?" description="Select the game you will compete with in this guild." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GAMES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGame(g)}
                className={`rounded-xl border-2 px-4 py-6 text-sm font-bold transition-all ${
                  selectedGame === g
                    ? "border-gold-500 bg-guild-800 text-gold-300 gold-glow"
                    : "border-guild-700 bg-guild-900 text-guild-300 hover:border-gold-500/50"
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
            className="mt-6 w-full rounded-lg gold-gradient-bg py-2.5 text-sm font-bold text-guild-950 hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Continue"}
          </button>
        </div>
      )}

      {step === "identity" && (
        <div className="card-surface p-6">
          <StepHeader step={3} total={5} title="Your game details" description={`Enter your ${selectedGame || ""} UID and in-game name. We'll detect your guild status automatically.`} />
          <div className="space-y-3">
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500 text-sm" />
              <input
                inputMode="numeric"
                value={gameUid}
                onChange={(e) => setGameUid(e.target.value.replace(/\D/g, ""))}
                placeholder="Game UID (numeric)"
                className="w-full input-dark rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <input
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              placeholder="In-Game Name"
              className="w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <ErrorBox message={error} />
          <button
            onClick={handleSubmitIdentity}
            disabled={isBusy}
            className="mt-6 w-full rounded-lg gold-gradient-bg py-2.5 text-sm font-bold text-guild-950 hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Check guild status"}
          </button>
        </div>
      )}

      {step === "leader-verify" && (
        <div className="card-surface p-6">
          <StepHeader step={4} total={5} title="Leader verification" description="You're the Leader of this guild. Confirm with your Leader password to continue." />
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-guild-300">Email (read-only)</label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="mt-1 w-full rounded-lg border border-guild-700 bg-guild-900 px-3 py-2 text-sm text-guild-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-guild-300">Leader Password</label>
              <input
                type="password"
                value={leaderPassword}
                onChange={(e) => setLeaderPassword(e.target.value)}
                placeholder="The password you set when creating the guild"
                className="mt-1 w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <ErrorBox message={error} />
          <button
            onClick={handleVerifyLeader}
            disabled={isBusy}
            className="mt-6 w-full rounded-lg gold-gradient-bg py-2.5 text-sm font-bold text-guild-950 hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Verify & continue"}
          </button>
        </div>
      )}

      {step === "no-guild" && (
        <div className="card-surface p-6">
          <StepHeader step={4} total={5} title="You are currently not in a guild" description="Create a new guild to become its Leader, or continue as a Free Player." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setError("");
                setStep("create-guild");
              }}
              className="rounded-xl border-2 border-gold-500/60 bg-guild-800 p-6 text-left hover:brightness-110 transition-all"
            >
              <FiPlus className="text-gold-400 text-xl" />
              <p className="mt-2 text-sm font-bold text-cream">Create Guild</p>
              <p className="text-xs text-guild-400 mt-1">Start a new guild and become its Leader.</p>
            </button>
            <button
              onClick={handleStayFree}
              disabled={isBusy}
              className="rounded-xl border-2 border-guild-700 bg-guild-900 p-6 text-left hover:border-guild-600 disabled:opacity-60"
            >
              <FiLogOut className="text-guild-400 text-xl" />
              <p className="mt-2 text-sm font-bold text-cream">Stay Without Guild</p>
              <p className="text-xs text-guild-400 mt-1">Continue as a Free Player. You can join or create a guild later.</p>
            </button>
          </div>
        </div>
      )}

      {step === "create-guild" && (
        <div className="card-surface p-6">
          <StepHeader step={5} total={5} title="Create your guild" />
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-guild-300">Guild Name *</label>
              <input
                value={guildName}
                onChange={(e) => setGuildName(e.target.value)}
                placeholder="e.g. 7x Esport"
                className="mt-1 w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-guild-300">Guild Slogan *</label>
              <input
                value={guildSlogan}
                onChange={(e) => setGuildSlogan(e.target.value)}
                placeholder="Short tagline for your guild"
                className="mt-1 w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-guild-300">Guild UID *</label>
              <div className="relative mt-1">
                <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500 text-sm" />
                <input
                  inputMode="numeric"
                  value={createUid}
                  onChange={(e) => setCreateUid(e.target.value.replace(/\D/g, ""))}
                  placeholder="Numeric Guild UID"
                  className="w-full input-dark rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
            <div className="relative flex items-center gap-2 rounded-lg border border-guild-700 bg-guild-900 px-3 py-2">
              <FiShield className="text-guild-500 text-sm" />
              <span className="text-xs text-guild-400">{user?.email ?? "your@email.com"}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wide text-guild-600">read-only</span>
            </div>
            <div>
              <label className="text-xs font-bold text-guild-300">Leader Password</label>
              <input
                type="password"
                value={createPw}
                onChange={(e) => setCreatePw(e.target.value)}
                placeholder="Min 6 characters"
                className="mt-1 w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-guild-300">Confirm Password</label>
              <input
                type="password"
                value={createPwConfirm}
                onChange={(e) => setCreatePwConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="mt-1 w-full input-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <ErrorBox message={error} />
          <button
            onClick={handleCreateGuild}
            disabled={isBusy}
            className="mt-6 w-full rounded-lg gold-gradient-bg py-2.5 text-sm font-bold text-guild-950 hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? <FiLoader className="animate-spin" /> : "Create Guild"}
          </button>
        </div>
      )}

      {step === "guild-success" && (
        <div className="card-surface p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full gold-gradient-bg text-guild-950 gold-glow">
            <FiCheck className="text-2xl" />
          </span>
          <h2 className="mt-4 text-xl font-display text-cream">Guild created successfully!</h2>
          <p className="mt-2 text-sm text-guild-300">
            {guildName.trim()} · <span className="font-mono">#{createUid.trim()}</span>
          </p>
          <p className="text-xs text-guild-500">Role: Leader</p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="mt-6 rounded-lg gold-gradient-bg px-6 py-2.5 text-sm font-bold text-guild-950 hover:brightness-110"
          >
            Go to homepage
          </button>
        </div>
      )}
    </div>
  );
}