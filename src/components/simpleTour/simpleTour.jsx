import { useRef, useState, useEffect } from "react";

const SimpleTour = ({ steps = [], isOpen, onClose }) => {
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(null);
  const tooltipRef = useRef(null);

  const computePosition = (step) => {
    if (!step) return setPos(null);
    const el = document.querySelector(step.selector);
    if (!el) return setPos(null);

    const r = el.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || 0;

    const tooltipW = 340;
    const tooltipH = 120;
    const margin = 12;

    const spaceAbove = r.top;
    const spaceBelow = viewportH - r.bottom;

    let top;
    let placement = "top";
    if (spaceAbove > tooltipH + margin) {
      top = r.top + scrollY - margin;
      placement = "top";
    } else if (spaceBelow > tooltipH + margin) {
      top = r.bottom + scrollY + margin;
      placement = "bottom";
    } else {
      top = Math.max(margin, scrollY + viewportH / 2);
      placement = "center";
    }

    // Calculate preferred left centered on element
    const preferredLeft = r.left + scrollX + r.width / 2;

    // Properly clamp tooltip inside viewport with safe padding
    const pad = 30;
    const clampedLeft = Math.min(
      Math.max(preferredLeft, pad + tooltipW / 2),
      viewportW - pad - tooltipW / 2
    );

    setPos({ left: clampedLeft, top, placement, targetRect: r });
  };

  useEffect(() => {
    if (!isOpen) return;
    // small delay to allow layout / rendering of elements
    const id = setTimeout(() => computePosition(steps[index]), 80);

    // update position on resize/scroll so tooltip stays near target
    const onResize = () => computePosition(steps[index]);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });

    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [isOpen, index, steps]);

  useEffect(() => {
    if (!isOpen) setIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;
  const step = steps[index];
  if (!step) return null;

  const next = () => {
    if (index < steps.length - 1) setIndex(index + 1);
    else onClose();
  };
  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };
  const skip = () => onClose();

  const left = pos ? pos.left : window.innerWidth / 2;
  const top = pos ? pos.top : window.innerHeight / 2;
  const placement = pos ? pos.placement : "center";

  const transform =
    placement === "top"
      ? "translate(-50%, -100%)"
      : placement === "bottom"
      ? "translate(-50%, 0%)"
      : "translate(-50%, -50%)";

  return (
    <>
      <div className="simple-tour-backdrop" onClick={skip} />

      <div
        ref={tooltipRef}
        className={`simple-tour-tooltip simple-tour-${placement}`}
        style={{
          top,
          left,
          transform,
        }}
      >
        <div className="simple-tour-content">{step.content}</div>

        <div className="simple-tour-footer">
          <div className="simple-tour-steps">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`simple-tour-step-dot ${i === index ? "active" : ""}`}
                aria-hidden
              />
            ))}
          </div>

          <div className="simple-tour-controls">
            <button
              className="simple-tour-btn simple-tour-prev"
              onClick={prev}
              disabled={index === 0}
            >
              Prev
            </button>
            <button className="simple-tour-btn simple-tour-skip" onClick={skip}>
              Skip
            </button>
            <button className="simple-tour-btn simple-tour-next" onClick={next}>
              {index === steps.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </div>

        <div
          className="simple-tour-arrow"
          style={
            placement === "bottom"
              ? { top: -7, transform: "translateX(-50%) rotate(45deg)" }
              : { left: "50%", transform: "translateX(-50%) rotate(45deg)" }
          }
        />
      </div>
    </>
  );
};

export default SimpleTour;
