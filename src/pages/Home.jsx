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
      <div className="navbar">
        <div className="navbar-left">
          <div className="app-name">
            <span className="brand-gradient">Smart</span>Lab
          </div>
        </div>

        <div className="navbar-left">
          <div className="mode-selector">
            <Button
              className={mode === "single" ? "mode-btn active" : "mode-btn"}
              onClick={() => setMode("single")}
            >
              Smart Prompt
            </Button>
            <Button
              className={mode === "hybrid" ? "mode-btn active" : "mode-btn"}
              onClick={() => setMode("hybrid")}
            >
              Smart Chain
            </Button>
            <Button
              className={mode === "chat" ? "mode-btn active" : "mode-btn"}
              onClick={() => setMode("chat")}
            >
              Smart Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
  );
}
