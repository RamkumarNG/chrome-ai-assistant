import Button from "../button";
import { copyToClipboard } from "../../utils/clipboard";
import { saveAsFile } from "../../utils/download";
import TextLoading from "../textLoading";

export default function OutputDisplay({ text, loading, displayOutput = true }) {
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
          onClick={() => copyToClipboard(text)}
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
    </div>
  );
}
