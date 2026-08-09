import SocialLogin from "./SocialLogin";

export default function LoginForm() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Welcome to GUILD</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in with Google to join or create a guild. Your game details are added during onboarding.
        </p>
      </div>

      <SocialLogin />

      <p className="text-center text-[11px] text-slate-400">
        By continuing you agree to the GUILD terms. Leaders verify ownership after signing in.
      </p>
    </div>
  );
}