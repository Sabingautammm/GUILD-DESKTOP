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
    

      <h1 className="text-xl sm:text-2xl font-bold text-[#17120D] mb-6">
        Create your account
      </h1>

      {/* Full Name */}
      <label className="block text-xs font-medium text-[#6B5B45] mb-1">
        Full name
      </label>

      <div className="relative mb-4">
        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3A488]" />

        <input
          type="text"
          placeholder="Enter Your name"
          className="w-full rounded-lg border border-[#EDE1CB] bg-[#FAF6EE] pl-9 pr-3 py-2.5 text-sm text-[#17120D] outline-none transition-colors duration-200 focus:border-[#E3A012] focus:ring-2 focus:ring-[#E3A012]/15"
        />
      </div>

      {/* Email */}
      <label className="block text-xs font-medium text-[#6B5B45] mb-1">
        Email address
      </label>

      <div className="relative mb-4">
        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3A488]" />

        <input
          type="email"
          placeholder="you@company.com"
          className="w-full rounded-lg border border-[#EDE1CB] bg-[#FAF6EE] pl-9 pr-3 py-2.5 text-sm text-[#17120D] outline-none transition-colors duration-200 focus:border-[#E3A012] focus:ring-2 focus:ring-[#E3A012]/15"
        />
      </div>

      {/* Password */}
      <label className="block text-xs font-medium text-[#6B5B45] mb-1">
        Password
      </label>

      <PasswordInput placeholder="At least 8 characters" />

      <p className="text-[11px] text-[#B3A488] mb-3">
        Use 8+ characters with a number or symbol
      </p>

      {/* Terms */}
      <label className="flex items-start gap-2 text-xs text-[#6B5B45] mb-5">
        <input
          type="checkbox"
          className="mt-0.5 rounded border-[#EDE1CB]"
          style={{ accentColor: "#E3A012" }}
        />

        <span>
          I agree to the{" "}
          <a href="#" className="text-[#B9660B] hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#B9660B] hover:underline">
            Privacy Policy
          </a>
        </span>
      </label>

      {/* Signup Button */}
      <button className="w-full rounded-lg bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] py-2.5 text-sm font-semibold text-[#17120D] shadow-md shadow-[#E3A012]/25 transition-all duration-200 hover:shadow-lg hover:shadow-[#E3A012]/35">
        Create account
      </button>

      <SocialLogin />
    </div>
  );
}

export default SignupForm;