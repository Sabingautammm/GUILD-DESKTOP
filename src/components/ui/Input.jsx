export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="block text-xs font-semibold text-guild-300">{label}</label>}
      <input
        className={`w-full input-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
