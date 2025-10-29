import { Settings, XCircle } from "lucide-react";

export default function MessageConfigModal({ isOpen, onClose, apiName, config }) {
  if (!isOpen) return null;

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      const allPrimitive = value.every(
        (v) => typeof v !== "object" || v === null
      );

      // If it's a simple list like ["a", "b"]
      if (allPrimitive) {
        return (
          <span className="config-value">
            {value.join(", ")}
          </span>
        );
      }

      // If it's an array of objects
      return (
        <pre className="config-json-block">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    // Handle plain objects
    if (typeof value === "object" && value !== null) {
      return (
        <pre className="config-json-block">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    // Handle strings, numbers, booleans
    return <span className="config-value">{String(value)}</span>;
  };


  return (
    <div className="config-modal-overlay" onClick={onClose}>
      <div className="config-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="config-modal-header">
          <div className="config-modal-title">
            <Settings size={18} color="#007bff" />
            <span>{apiName} Configuration</span>
          </div>
          <button className="config-close-btn" onClick={onClose}>
            <XCircle size={20} />
          </button>
        </div>

        {/* Body */}
        {config && Object.keys(config).length > 0 ? (
          <div className="config-list">
            {Object.entries(config).map(([key, value]) => (
              <div className="config-item" key={key}>
                <span className="config-key">{key.replace(/_/g, " ")}</span>
                {renderValue(value)}
              </div>
            ))}
          </div>
        ) : (
          <p className="config-empty">No configuration applied</p>
        )}
      </div>
    </div>
  );
}
