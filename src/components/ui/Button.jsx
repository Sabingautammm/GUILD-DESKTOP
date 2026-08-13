export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200";
  const variants = {
    primary: "gold-gradient-bg text-guild-950 font-bold hover:brightness-110",
    secondary: "bg-guild-700 text-guild-100 hover:bg-guild-600",
    outline: "border border-guild-600 text-guild-200 hover:bg-guild-800",
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
