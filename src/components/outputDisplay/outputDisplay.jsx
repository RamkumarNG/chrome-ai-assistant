import { useState } from "react";

import Button from "../button";
import { copyToClipboard } from "../../utils/clipboard";
import { saveAsFile } from "../../utils/download";
import TextLoading from "../textLoading";
import Toast from "../toast";

const OutputDisplay = ({ text, loading, displayOutput = true }) => {

  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500); // hide after 1.5s
  };
  
  return (
    <div className="output-container">
      {displayOutput && <h3>Output:</h3>}
      {loading ? (
        <TextLoading/>
      ) : (
          <pre style={{ 
            whiteSpace: "pre-wrap",
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "5px",
            minHeight: "200px"
          }}>
            {text}
          </pre>
      )}
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <Button
          onClick={handleCopy}
          disabled={!text?.length || loading}
        >
          Copy
        </Button>
        <Button
          onClick={() => saveAsFile(text)}
          disabled={!text?.length || loading}
        >
          Save as .txt
        </Button>
      </div>
      <Toast message="💾 Template Saved!" show={showToast} bottom="10%" />
    </div>
  );
}

export default OutputDisplay;
