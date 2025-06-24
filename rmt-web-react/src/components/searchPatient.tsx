import React, { useState, useRef, useEffect } from "react";
import styles from "../CSS/searchPatient.module.css"; // you’ll add CSS here

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "",
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // filter options by search term
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // display label for current value
  const displayLabel =
    options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className={styles.container} ref={containerRef}>
      <label className={styles.label}>
        {label} {required && "*"}
      </label>
      <div
        className={styles.control}
        onClick={() => setOpen((o) => !o)}
      >
        <input
          type="text"
          className={styles.input}
          placeholder={displayLabel || placeholder}
          value={open ? search : displayLabel}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          readOnly={!open}
        />
        <span className={styles.arrow}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <ul className={styles.options}>
          {filtered.map((opt) => (
            <li
              key={opt.value}
              className={`${styles.option} ${
                opt.value === value ? styles.selected : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                setSearch("");
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
