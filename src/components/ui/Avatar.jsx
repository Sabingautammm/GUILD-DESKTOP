import { useState } from "react";
import { FiUser } from "react-icons/fi";

export default function Avatar({
  src,
  name = "Avatar",
  className = "",
  imgClassName = "",
  fallbackClassName = "",
  icon = false,
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  if (showImage) {
    return (
      <img
        src={src}
        alt={name}
        className={`object-cover ${className} ${imgClassName}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center font-bold ${className} ${fallbackClassName}`}
    >
      {icon ? <FiUser className="h-1/2 w-1/2" /> : initial}
    </span>
  );
}