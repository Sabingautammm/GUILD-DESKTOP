import { useNavigate } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import SocialLogin from "./SocialLogin";

export default function SignupForm() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-sm space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 text-center">Create Account</h2>
      <p className="text-center text-sm text-slate-500">
        Accounts are created with Google — it's the fastest way to join or found a guild.
        Your Leader password is set when you create a guild.
      </p>

      <SocialLogin />

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[11px] uppercase tracking-wide text-slate-400">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/login")}
        className="w-full rounded-lg border border-[#17120D]/15 bg-[#17120D] py-2 text-sm font-semibold text-[#FFD873] hover:opacity-90"
      >
        <span className="inline-flex items-center gap-2">
          <FiShield className="text-xs" />
          I'm / I found a Guild Leader — sign in as Leader
        </span>
      </button>
    </div>
  );
}