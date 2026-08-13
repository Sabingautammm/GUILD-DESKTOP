export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-guild-700 bg-guild-900 p-6 shadow-2xl">
        {title && <h3 className="text-lg font-bold text-cream mb-4 font-display">{title}</h3>}
        {children}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-guild-700 py-2 text-sm font-semibold text-guild-100 hover:bg-guild-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
