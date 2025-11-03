import { useRef, useState, useEffect } from "react";

const SimpleTour = ({ steps = [], isOpen, onClose, disableBlur = false }) => {
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

    const preferredLeft = r.left + scrollX + r.width / 2;
    const pad = 30;
    const clampedLeft = Math.min(
      Math.max(preferredLeft, pad + tooltipW / 2),
      viewportW - pad - tooltipW / 2
    );

    setPos({ left: clampedLeft, top, placement, targetRect: r });
  };

  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => computePosition(steps[index]), 80);
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
  const prev = () => index > 0 && setIndex(index - 1);
  const skip = () => onClose();

  const left = pos ? pos.left : window.innerWidth / 2;
  const top = pos ? pos.top : window.innerHeight / 2;
  const placement = pos ? pos.placement : "center";
  const arrowAlign = step.arrowAlign || "center"; // 👈 default config

  const transform =
    placement === "top"
      ? "translate(-50%, -100%)"
      : placement === "bottom"
      ? "translate(-50%, 0%)"
      : "translate(-50%, -50%)";

  const arrowPos = {
    left:
      arrowAlign === "left"
        ? "20%"
        : arrowAlign === "right"
        ? "95%"
        : "50%",
    transform: "translateX(-50%) rotate(45deg)",
  };

  return (
    <>
      {!disableBlur && (
        <div
          className="simple-tour-backdrop"
          onClick={skip}
        />
      )}

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
              />
            ))}
          </div>

          <div className="simple-tour-controls">
            {steps?.length !== 1 && (
              <>
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
              </>
            )}
            <button className="simple-tour-btn simple-tour-next" onClick={next}>
              {index === steps.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </div>

        <div
          className="simple-tour-arrow"
          style={
            placement === "bottom"
              ? { top: -7, ...arrowPos }
              : { top: "100%", ...arrowPos }
          }
        />
      </div>
    </>
  );
};

export default SimpleTour;
