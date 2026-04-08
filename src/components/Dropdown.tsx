import { useState, useRef, useEffect } from "react";

type DropdownProps<T> = {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => string | number;
  defaultValue?: string;
  className?: string;
  openClassName?: string;
};

export default function Dropdown<T>({
  items,
  value,
  onChange,
  getLabel,
  getKey,
  defaultValue,
  className,
  openClassName,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------- CLICK OUTSIDE ----------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex justify-center items-center ${open ? openClassName : className}`}
    >
      {/* Selected value with arrow */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full text-center px-2 py-1 text-xs md:text-lg cursor-pointer flex justify-center items-center gap-2"
      >
        {/* label */}
        <div
          className={`flex flex-1 ${getLabel(value) ? "text-sowma-blue" : "text-sowma-light-gray"} font-medium`}
        >
          {getLabel(value) || defaultValue || ""}
        </div>
        {/* Arrow (rotates when open) */}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full w-full bg-white border border-sowma-lighter-gray shadow-md rounded-b-md z-10">
          {items.map((item) => (
            <div
              key={getKey(item)}
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className={`px-3 py-2 text-center cursor-pointer ${getKey(item) === getLabel(value) ? "bg-sowma-lightest-blue hover:bg-sowma-lighter-blue" : "hover:bg-sowma-lighter-gray"}`}
            >
              {getLabel(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
