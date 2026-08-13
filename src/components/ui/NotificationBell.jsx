import { FiBell } from "react-icons/fi";

export default function NotificationBell({ count = 0 }) {
  return (
    <div className="relative inline-flex items-center">
      <FiBell className="text-xl text-guild-300" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </div>
  );
}
