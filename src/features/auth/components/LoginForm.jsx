import { useNavigate } from "react-router-dom";
import { FiLoader, FiHash } from "react-icons/fi";
import PasswordInput from "./PasswordInput";
import SocialLogin from "./SocialLogin";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
  const navigate = useNavigate();
  const { values, fieldErrors, isSubmitting, setField, handleSubmit } = useLogin(() => navigate("/"));

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 text-center">Leader Sign In</h2>
      <p className="text-xs text-slate-500 text-center">
        Leaders log in with their Guild UID and password. Everyone else signs in with Google below.
      </p>

      <div className="space-y-1">
        <div className="relative">
          <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            inputMode="numeric"
            value={values.guildUid}
            onChange={(e) => setField("guildUid", e.target.value)}
            placeholder="Guild UID (numeric)"
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        {fieldErrors.guildUid && <p className="text-xs text-red-500">{fieldErrors.guildUid}</p>}
      </div>

      <PasswordInput
        value={values.password}
        onChange={(e) => setField("password", e.target.value)}
        error={fieldErrors.password}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-[#17120D] py-2 text-sm font-semibold text-[#FFD873] hover:opacity-90 flex items-center justify-center gap-2"
      >
        {isSubmitting ? <FiLoader className="animate-spin text-sm" /> : "Sign In"}
      </button>

      <div className="my-2 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] uppercase tracking-wide text-slate-400">or continue with</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <SocialLogin />
    </form>
  );
}