import { useState } from "react";

const TextArea = ({
  value,
  onChange,
  placeholder = "",
  label,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`text-area-container ${isFocused || value ? "focused" : ""}`}>
      {label && <label className="floating-label">{label}</label>}
      <textarea
        id="text-area-box"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      <div className="inner-glow"></div>
    </div>
  );
};

export default TextArea;
