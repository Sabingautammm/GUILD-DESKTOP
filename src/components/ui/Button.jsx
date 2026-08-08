export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200";
  const variants = {
    primary: "bg-[#17120D] text-[#FFD873] hover:opacity-90",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
