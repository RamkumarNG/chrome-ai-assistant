import { useState } from "react";
import { Button } from "../components";
import HybridWorkflow from "./containers/hybridApi";
import SingleAPI from "./containers/singleApi";
import ChatAPI from "./containers/chatApi";
import { useGlobalStore } from "../store/GlobalStore";

export default function Home() {
  const [mode, setMode] = useState("chat");

  const {
    // single workspace
    singleInput,
    setSingleInput,
    singleOutput,
    setSingleOutput,
    // hybrid workspace
    hybridInput,
    setHybridInput,
    hybridOutput,
    setHybridOutput,
    hybridWorkflow,
    setHybridWorkflow,
    hybridIntermediateOutputs,
    setHybridIntermediateOutputs,
    // chat workspace (persistent)
    chatInput,
    setChatInput,
    messages,
    setMessages,
    attachedImages,
    setAttachedImages,
    attachedAudios,
    setAttachedAudios,
    // shared
    selectedAPI,
    setSelectedAPI,
    apiConfig,
    setApiConfig,
  } = useGlobalStore();

  const renderMainContent = () => {
    const componentMap = {
      single: (
        <SingleAPI
          // inputText={singleInput}
          // setInputText={setSingleInput}
          // outputText={singleOutput}
          // setOutputText={setSingleOutput}
          // selectedAPI={selectedAPI}
          // setSelectedAPI={setSelectedAPI}
          // apiConfig={apiConfig}
          // setApiConfig={setApiConfig}
        />
      ),
      hybrid: (
        <HybridWorkflow
          inputText={hybridInput}
          setInputText={setHybridInput}
          outputText={hybridOutput}
          setOutputText={setHybridOutput}
          intermediateOutputs={hybridIntermediateOutputs}
          setIntermediateOutputs={setHybridIntermediateOutputs}
          workflow={hybridWorkflow}
          setWorkflow={setHybridWorkflow}
          selectedAPI={selectedAPI}
          setSelectedAPI={setSelectedAPI}
          apiConfig={apiConfig}
          setApiConfig={setApiConfig}
        />
      ),
      chat: (
        <ChatAPI
          inputText={chatInput}
          setInputText={setChatInput}
          messages={messages}
          setMessages={setMessages}
          attachedImages={attachedImages}
          setAttachedImages={setAttachedImages}
          attachedAudios={attachedAudios}
          setAttachedAudios={setAttachedAudios}
          selectedAPI={selectedAPI}
          setSelectedAPI={setSelectedAPI}
          apiConfig={apiConfig}
          setApiConfig={setApiConfig}
        />
      ),
    };

    return componentMap[mode] || null;
  };

  return (
    <div className="home-page">
      <div className="navbar">
        <div
          className="navbar-left"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <div className="app-name text-xl font-bold">
            <span className="brand-gradient">Smart</span>Lab
          </div>
          <div className="powered-tag">
            ⚡ Powered by <span className="chrome-text">Chrome AI</span>
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

      <div className="main-content">{renderMainContent()}</div>
    </div>
  );
}
