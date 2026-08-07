import { FiMail, FiUser } from "react-icons/fi";
import PasswordInput from "./PasswordInput";
import SocialLogin from "./SocialLogin";

interface SignupFormProps {
  isSignUp: boolean;
}

function SignupForm({ isSignUp }: SignupFormProps) {
  return (
    <div
      className={`w-full max-w-sm transition-opacity duration-300 ${
        isSignUp ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <p className="text-xs font-semibold tracking-wide text-indigo-500 uppercase mb-1">
        Start building in minutes
      </p>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
        Create your account
      </h1>

      {/* Full Name */}
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Full name
      </label>

      <div className="relative mb-4">
        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          placeholder="Ada Lovelace"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Email */}
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Email address
      </label>

      <div className="relative mb-4">
        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="email"
          placeholder="you@company.com"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Password */}
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Password
      </label>

      <PasswordInput placeholder="At least 8 characters" />

      <p className="text-[11px] text-slate-400 mb-3">
        Use 8+ characters with a number or symbol
      </p>

      {/* Terms */}
      <label className="flex items-start gap-2 text-xs text-slate-500 mb-5">
        <input
          type="checkbox"
          className="mt-0.5 rounded border-slate-300"
        />

        <span>
          I agree to the{" "}
          <a
            href="#"
            className="text-indigo-500 hover:underline"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-indigo-500 hover:underline"
          >
            Privacy Policy
          </a>
        </span>
      </label>

      {/* Signup Button */}
      <button className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:opacity-90 transition">
        Create account
      </button>
      <SocialLogin/>
    </div>
  );
}

export default SignupForm;