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
  const hasError = aria["aria-invalid"];

  return (
    <div className="relative mb-3">
      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3A488]" />

      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        autoComplete={autoComplete}
        {...aria}
        className={`w-full rounded-lg border bg-[#FAF6EE] pl-9 pr-10 py-2.5 text-sm text-[#17120D] outline-none transition-colors duration-200 focus:ring-2 ${
          hasError
            ? "border-[#C81034]/40 focus:border-[#C81034] focus:ring-[#C81034]/10"
            : "border-[#EDE1CB] focus:border-[#E3A012] focus:ring-[#E3A012]/15"
        }`}
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3A488] transition-colors duration-200 hover:text-[#17120D]"
      >
        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;