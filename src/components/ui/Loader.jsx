export default function Loader({ size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size] || "w-8 h-8";

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-2 border-slate-300 border-t-amber-500 ${sizeClasses}`} />
    </div>
  );
}
