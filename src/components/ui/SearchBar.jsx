import { FiSearch } from "react-icons/fi";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative w-full">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full input-dark pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
      />
    </div>
  );
}
