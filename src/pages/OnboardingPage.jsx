import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiHash } from "react-icons/fi";
import {
  submitUidRegion,
} from "../features/auth/services/authApi";
import { ApiError } from "../services/api/client";
import { useToast } from "../components/toast/ToastProvider";
import { useAuth } from "../features/auth/context/AuthContext";

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

export default function OnboardingPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, membership, refresh } = useAuth();

  const [step, setStep] = useState("uid-region");
  const [uid, setUid] = useState("");
  const [region, setRegion] = useState("");
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

  if (membership && membership.status !== "pending_approval") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-display text-cream">You're all set!</p>
        <p className="text-sm text-guild-400 mt-2">
          You're an active member of guild <span className="font-mono font-semibold text-gold-300">{membership.guildUid}</span>.
        </p>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="mt-4 rounded-lg gold-gradient-bg px-5 py-2 text-sm font-bold text-guild-950 hover:brightness-110"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

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
        loading: "Fetching your Free Fire profile…",
        success: "Profile fetched! Redirecting…",
        error: (e) => (e instanceof ApiError ? e.message : "Could not fetch profile."),
      });
      await refresh();
      navigate("/", { replace: true });
    } catch {
      // toast handled
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="card-surface p-6">
        <StepHeader step={1} total={1} title="Enter your UID and Region" description="This will fetch your Free Fire profile and stats automatically." />
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
          {isBusy ? <FiLoader className="animate-spin" /> : "Fetch Profile & Continue"}
        </button>
      </div>
    </div>
  );
}