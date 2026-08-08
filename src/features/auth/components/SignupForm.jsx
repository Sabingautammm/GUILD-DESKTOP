import { FiMail, FiUser } from "react-icons/fi";
import PasswordInput from "./PasswordInput";
import SocialLogin from "./SocialLogin";

export default function SignupForm() {
  return (
    <form className="w-full max-w-sm space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 text-center">Create Account</h2>
      <div className="relative">
        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Full name"
          className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div className="relative">
        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="email"
          placeholder="Email address"
          className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <PasswordInput value="" onChange={() => {}} placeholder="Password" />

      <button
        type="submit"
        className="w-full rounded-lg bg-[#17120D] py-2 text-sm font-semibold text-[#FFD873] hover:opacity-90"
      >
        Sign Up
      </button>

      <SocialLogin />
    </form>
  );
}
