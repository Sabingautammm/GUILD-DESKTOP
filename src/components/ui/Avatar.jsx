export default function Avatar({ src, alt = "Avatar", size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  }[size] || "w-10 h-10";

  return (
    <div className={`relative inline-block rounded-full overflow-hidden bg-guild-700 ring-1 ring-guild-600 ${sizeClasses}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-gold-300">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
