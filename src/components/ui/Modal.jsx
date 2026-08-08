export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {title && <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>}
        {children}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}
