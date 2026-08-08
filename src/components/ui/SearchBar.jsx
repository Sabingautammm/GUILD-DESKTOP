import { FiSearch } from "react-icons/fi";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative w-full">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full bg-slate-100 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  );
}
