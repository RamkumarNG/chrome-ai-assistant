import { useState } from "react";
import { HelpCircle } from "lucide-react";

import { Button, SimpleTour } from "../components";
import HybridWorkflow from "./containers/hybridApi";
import SingleAPI from "./containers/singleApi";
import ChatAPI from "./containers/chatApi";
import { useGlobalStore } from "../store/GlobalStore";
import { SAMPLE_WORKFLOW, TOUR_STEPS } from "./constants";

export default function Home() {
  const [mode, setMode] = useState("chat");
  const [startTour, setStartTour] = useState(false);

  const {
    // single
    singleInput, setSingleInput,
    singleOutput, setSingleOutput,
    // hybrid
    hybridInput, setHybridInput,
    hybridOutput, setHybridOutput,
    hybridWorkflow, setHybridWorkflow,
    hybridIntermediateOutputs, setHybridIntermediateOutputs,
    // chat
    chatInput, setChatInput,
    messages, setMessages,
    attachedImages, setAttachedImages,
    attachedAudios, setAttachedAudios,
    // shared
    selectedAPI, setSelectedAPI,
    apiConfig, setApiConfig,
  } = useGlobalStore();

  const handleHelpTour = async () => {
    const inputExamples = {
      chat: "Explain how Chrome AI enhances everyday workflows.",
      single: "Summarize this text into one line.",
      hybrid: "Translate this to French and summarize it.",
    };

    let sendDivElement = "";

    if (mode === "chat") {
      sendDivElement = ".btn-send";
      setChatInput(inputExamples.chat);
    }
    if (mode === "single") {
      sendDivElement = ".single-api-send-btn";
      setSingleInput(inputExamples.single);
    }
    if (mode === "hybrid") {
      sendDivElement = ".hybrid-send-btn";
      const withConnections = SAMPLE_WORKFLOW.map((step, i) => ({
        ...step,
        connectedTo: i < SAMPLE_WORKFLOW.length - 1 ? SAMPLE_WORKFLOW[i + 1].id : null,
      }));

      setHybridWorkflow(withConnections);
      setHybridInput(inputExamples.hybrid);
    }

    setTimeout(() => {
      const sendBtn = document.querySelector(sendDivElement);
      if (sendBtn) sendBtn.click();
    }, 800);

    setTimeout(() => setStartTour(true), 1600);
  };

  // ✅ Mode-based tour steps
  const getTourSteps = () => {
    switch (mode) {
      case "chat":
        return TOUR_STEPS["chat"]
      case "hybrid":
        return TOUR_STEPS["hybrid"]
      case "single":
        return TOUR_STEPS["single"]
      default:
        return [];
    }
  };

  const renderMainContent = () => {
    const componentMap = {
      single: (
        <SingleAPI
          inputText={singleInput}
          setInputText={setSingleInput}
          outputText={singleOutput}
          setOutputText={setSingleOutput}
          selectedAPI={selectedAPI}
          setSelectedAPI={setSelectedAPI}
          apiConfig={apiConfig}
          setApiConfig={setApiConfig}
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

    return (
      <>
        <SimpleTour
          steps={getTourSteps()}
          isOpen={startTour}
          onClose={() => {
            setStartTour(false);
          }}
        />
        {componentMap[mode]}
      </>
    );
  };

  return (
    <div className="home-page">
      <div className="navbar">
        <div className="navbar-left" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div className="app-name text-xl font-bold">
            <span className="brand-gradient">Smart</span>Lab
          </div>
          <div className="powered-tag">
            ⚡ Powered by <span className="chrome-text">Chrome AI</span>
          </div>
        </div>

        <div className="navbar-left">
          <div className="mode-selector">
            <Button className={mode === "single" ? "mode-btn active" : "mode-btn"} onClick={() => setMode("single")}>Smart Prompt</Button>
            <Button className={mode === "hybrid" ? "mode-btn active" : "mode-btn"} onClick={() => setMode("hybrid")}>Smart Chain</Button>
            <Button className={mode === "chat" ? "mode-btn active" : "mode-btn"} onClick={() => setMode("chat")}>Smart Chat</Button>
          </div>

          <button onClick={handleHelpTour} className="tour-btn" title="Take a guided tour">
            <HelpCircle size={22} />
          </button>
        </div>
      </div>

      <div className="main-content">{renderMainContent()}</div>
    </div>
  );
}
