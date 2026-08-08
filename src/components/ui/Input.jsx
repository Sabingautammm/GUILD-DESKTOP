export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <input
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
