import { useState, useEffect, useRef } from "react";

export default function SelectDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find(opt => opt.value === value)?.label || "";

  return (
    <div className="select-dropdown" ref={dropdownRef}>
      <label>{label}</label>
      <div
        className={`dropdown-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLabel || "Select an option"}
        <span className="arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="dropdown-list">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dropdown-search"
          />
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={`dropdown-item ${value === opt.value ? "active" : ""}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(""); }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="dropdown-item disabled">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
