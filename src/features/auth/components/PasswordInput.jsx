import { useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

export default function PasswordInput({ value, onChange, error, placeholder = "Password" }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1 w-full">
      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500 text-sm" />
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full input-dark rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-guild-500 hover:text-gold-300"
        >
          {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
