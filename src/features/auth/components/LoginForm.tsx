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
      <h1 className="text-xl sm:text-2xl font-bold text-[#17120D] mb-1">Welcome back</h1>

      <p className="text-sm text-[#6B5B45] mb-6">Sign in to continue to your account</p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Server/network errors now surface as a toast (see useLogin) instead
            of a banner here — one place for the "did it work" signal. */}

        {/* Email */}
        <label htmlFor="login-email" className="block text-xs font-medium text-[#6B5B45] mb-1">
          Email address
        </label>

        <div className="relative mb-1">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3A488]" />

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
            className={`w-full rounded-lg border bg-[#FAF6EE] pl-9 pr-3 py-2.5 text-sm text-[#17120D] outline-none transition-colors duration-200 focus:ring-2 ${
              fieldErrors.email
                ? "border-[#C81034]/40 focus:border-[#C81034] focus:ring-[#C81034]/10"
                : "border-[#EDE1CB] focus:border-[#E3A012] focus:ring-[#E3A012]/15"
            }`}
          />
        </div>

        {fieldErrors.email && (
          <p id="login-email-error" className="text-xs text-[#C81034] mb-3">
            {fieldErrors.email}
          </p>
        )}
        {!fieldErrors.email && <div className="mb-4" />}

        {/* Password */}
        <label htmlFor="login-password" className="block text-xs font-medium text-[#6B5B45] mb-1">
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
          <p id="login-password-error" className="text-xs text-[#C81034] -mt-2 mb-3">
            {fieldErrors.password}
          </p>
        )}

        {/* Remember Me */}
        <div className="flex items-center justify-between mb-6 text-xs">
          <label className="flex items-center gap-2 text-[#6B5B45]">
            <input
              type="checkbox"
              className="rounded border-[#EDE1CB]"
              style={{ accentColor: "#E3A012" }}
            />
            Remember me
          </label>

          <a href="#" className="text-[#B9660B] hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] py-2.5 text-sm font-semibold text-[#17120D] shadow-md shadow-[#E3A012]/25 transition-all duration-200 hover:shadow-lg hover:shadow-[#E3A012]/35 disabled:cursor-not-allowed disabled:opacity-60"
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