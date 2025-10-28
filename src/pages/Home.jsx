import { useState } from "react";
import { Button } from "../components";
import HybridWorkflow from "./containers/hybridApi";
import SingleAPI from "./containers/singleApi";
import ChatAPI from "./containers/chatApi";

export default function Home() {
  const [mode, setMode] = useState("chat");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const renderMainContent = () => {
    const componentMap = {
      single: (
        <SingleAPI
          inputText={inputText}
          setInputText={setInputText}
          outputText={outputText}
          setOutputText={setOutputText}
        />
      ),
      hybrid: (
        <HybridWorkflow
          inputText={inputText}
          setInputText={setInputText}
          outputText={outputText}
          setOutputText={setOutputText}
        />
      ),
      chat: (
        <ChatAPI
          inputText={inputText}
          setInputText={setInputText}
          outputText={outputText}
          setOutputText={setOutputText}
        />
      ),
    };

    return componentMap[mode] || null;
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <div className="navbar">
        <div className="app-name">AI Chat Assistant</div>

        <div className="mode-selector">
          <Button
            className={mode === "single" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("single")}
          >
            Single API
          </Button>

          <Button
            className={mode === "hybrid" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("hybrid")}
          >
            Hybrid Workflow
          </Button>
          <Button
            className={mode === "chat" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("chat")}
          >
            Chat API
          </Button>
        </div>
      </div>

      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
  );
}
