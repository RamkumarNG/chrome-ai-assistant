import { useState, useRef } from "react";

export default function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  const showTooltip = () => {
    if (!ref.current) return; // <-- Safeguard

    const rect = ref.current.getBoundingClientRect();
    const tooltipWidth = 250;
    let top = rect.top - 40;
    let left = rect.left;

    // Keep tooltip inside viewport
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 10;
    }
    if (top < 0) top = rect.bottom + 10;

    setPosition({ top, left });
    setVisible(true);
  };

  const hideTooltip = () => setVisible(false);

  return (
    <span
      ref={ref}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      style={{ display: "inline-block", position: "relative" }}
    >
      {children}
      {visible && (
        <div
          className="tooltip-box"
          style={{
            position: "fixed", // fixed to avoid layout shifts
            top: position.top,
            left: position.left,
            width: 250,
            zIndex: 9999,
          }}
        >
          {content}
        </div>
      )}
    </span>
  );
}
