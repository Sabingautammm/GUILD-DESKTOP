import { useNavigate } from "react-router-dom";
import { FiMail, FiLoader } from "react-icons/fi";
import PasswordInput from "./PasswordInput";
import SocialLogin from "./SocialLogin";
import { useLogin } from "../hooks/UseLogin";

interface LoginFormProps {
  isSignUp: boolean;
}

function LoginForm({ isSignUp }: LoginFormProps) {
  const navigate = useNavigate();
  const { values, fieldErrors, isSubmitting, setField, handleSubmit } = useLogin(() =>
    navigate("/")
  );

  return (
    <div
      className={`w-full max-w-sm transition-opacity duration-300 ${
        isSignUp ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>

      <p className="text-sm text-slate-500 mb-6">Sign in to continue to your account</p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Server/network errors now surface as a toast (see useLogin) instead
            of a banner here — one place for the "did it work" signal. */}

        {/* Email */}
        <label htmlFor="login-email" className="block text-xs font-medium text-slate-600 mb-1">
          Email address
        </label>

        <div className="relative mb-1">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className={`w-full rounded-lg border bg-slate-50 pl-9 pr-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
              fieldErrors.email
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
            }`}
          />
        </div>

        {fieldErrors.email && (
          <p id="login-email-error" className="text-xs text-red-500 mb-3">
            {fieldErrors.email}
          </p>
        )}
        {!fieldErrors.email && <div className="mb-4" />}

        {/* Password */}
        <label htmlFor="login-password" className="block text-xs font-medium text-slate-600 mb-1">
          Password
        </label>

        <PasswordInput
          id="login-password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => setField("password", e.target.value)}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
        />

        {fieldErrors.password && (
          <p id="login-password-error" className="text-xs text-red-500 -mt-2 mb-3">
            {fieldErrors.password}
          </p>
        )}

        {/* Remember Me */}
        <div className="flex items-center justify-between mb-6 text-xs">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="rounded border-slate-300" />
            Remember me
          </label>

          <a href="#" className="text-indigo-500 hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <FiLoader className="animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Social Login */}
      <SocialLogin />
    </div>
  );
}

export default LoginForm;