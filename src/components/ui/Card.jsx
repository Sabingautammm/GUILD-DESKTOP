export default function Card({ children, className = "" }) {
  return (
    <div className={`card-surface p-5 ${className}`}>
      {children}
    </div>
  );
}
