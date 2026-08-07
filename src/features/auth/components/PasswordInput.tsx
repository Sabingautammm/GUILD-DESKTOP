import { useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

interface PasswordInputProps {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  autoComplete?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

function PasswordInput({
  id,
  placeholder = "Enter your password",
  value,
  onChange,
  name,
  autoComplete,
  ...aria
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative mb-3">
      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        autoComplete={autoComplete}
        {...aria}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;