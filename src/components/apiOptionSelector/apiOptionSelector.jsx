import Tooltip from "../tooltip";

export default function ApiOptionSelector({ configKey, options, selectedValue, onChange, multi = false, tooltipContent = "" }) {
  const isSelected = (val) => multi
    ? Array.isArray(selectedValue) && selectedValue.includes(val)
    : selectedValue === val;

  const handleClick = (val) => {
    if (multi) {
      let newValue = Array.isArray(selectedValue) ? [...selectedValue] : [];
      if (newValue.includes(val)) {
        newValue = newValue.filter(v => v !== val);
      } else {
        newValue.push(val);
      }
      onChange(newValue);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="api-config-card">
      <div className="label-with-tooltip">
        <Tooltip content={tooltipContent}>
          <h4 style={{ display: "inline-block", marginBottom: '10px' }}>{configKey}</h4>
        </Tooltip>
      </div>
      <div className="chip-container">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`chip ${isSelected(opt.value) ? "active" : ""}`}
            onClick={() => handleClick(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
