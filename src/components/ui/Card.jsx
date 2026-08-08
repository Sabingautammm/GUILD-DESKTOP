export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-[#EDE1CB] bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
