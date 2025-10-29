import React, { useState, useEffect, useRef } from "react";
import { Mic, Plus, RotateCcw, XCircle } from "lucide-react";
import {
  Button,
  ApiOptionSelector,
  SelectDropdown,
  TextLoading,
  Toast,
} from "../../../components";
import {
  API_OPTIONS,
  API_CONFIGS,
  API_KEY_LABELS,
  USECASE_CONTEXTS,
} from "../../constants";
import { executeHybridWorkflow, useAI } from "../../../hooks/useAI";

const ChatAPI = () => {
  const { loading, progress, error, callAI } = useAI();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedAPI, setSelectedAPI] = useState("Proofreader");
  const [apiConfig, setApiConfig] = useState({});
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedAudios, setAttachedAudios] = useState([]);
  const [copyToast, setCopyToast] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState("Default");
  const [hybridWorkflow, setHybridWorkflow] = useState(null);
  const [showHybrid, setShowHybrid] = useState(false);

  const chatWindowRef = useRef(null);
  const textareaRef = useRef(null);

  const getDefaultConfig = (api) => {
    const defaultConfig = {};
    Object.entries(API_CONFIGS[api] || {}).forEach(([key, { options, multi }]) => {
      defaultConfig[key] = multi ? [options[0].value] : options[0].value;
    });
    return defaultConfig;
  };

  useEffect(() => setApiConfig(getDefaultConfig(selectedAPI)), [selectedAPI]);

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => scrollToBottom(), [messages]);

  const handleUseCaseChange = (e) => {
    const useCase = e.target.value;
    setSelectedUseCase(useCase);

    if (useCase.startsWith("template:")) {
      const templateName = useCase.replace("template:", "");
      const savedTemplates = JSON.parse(localStorage.getItem("hybridTemplates") || "[]");
      const selectedTemplate = savedTemplates.find((t) => t.name === templateName);

      if (selectedTemplate && Array.isArray(selectedTemplate.workflow)) {
        console.log("Loaded Hybrid Template:", selectedTemplate.workflow);
        setHybridWorkflow(selectedTemplate.workflow);
        setShowHybrid(true);
        return;
      }
    }

    setHybridWorkflow(null);
    setShowHybrid(false);
    switch (useCase) {
      case "Email Improve":
        setSelectedAPI("Writer");
        break;
      case "Simplify Text":
        setSelectedAPI("Rewriter");
        break;
      case "Summarize":
        setSelectedAPI("Summarizer");
        break;
      case "Translate to English":
        setSelectedAPI("Translator");
        break;
      case "Polite Reply":
        setSelectedAPI("Writer");
        break;
      default:
        setSelectedAPI("Proofreader");
        break;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !attachedImage && attachedAudios.length === 0) return;

    const userMessage = {
      type: "user",
      text: inputText,
      image: attachedImage,
      audios: attachedAudios,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAttachedImage(null);
    setAttachedAudios([]);
    resizeTextarea();
    scrollToBottom();

    const loadingMessage = { type: "bot", text: "", loading: true };
    setMessages((prev) => [...prev, loadingMessage]);

    const useCaseContext = USECASE_CONTEXTS[selectedUseCase] || "";
    const contextualInput = useCaseContext
      ? `${useCaseContext}\n\nUser Input:\n${inputText}`
      : inputText;

    let result;
    if (hybridWorkflow) {
      result = await executeHybridWorkflow(contextualInput, hybridWorkflow, callAI);
    } else {
      result = await callAI(selectedAPI, contextualInput, apiConfig, attachedImage, attachedAudios);
    }

    setMessages((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((m) => m.loading);
      if (idx !== -1) updated[idx] = { type: "bot", text: result };
      return updated;
    });

    scrollToBottom();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAPIChange = (api) => {
    setSelectedAPI(api);
    setApiConfig(getDefaultConfig(api));
    setAttachedImage(null);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 1500);
    });
  };

  const handleAudioUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachedAudios((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveAudio = (index) => {
    setAttachedAudios((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setApiConfig(getDefaultConfig(selectedAPI));
  };

  const renderAPIOptions = () => {
    const config = API_CONFIGS[selectedAPI] || {};
    return Object.entries(config).map(([key, { options, multi, tooltipContent }]) => {
      const label = API_KEY_LABELS[key] || key;
      return (
        <ApiOptionSelector
          key={key}
          configKey={label}
          options={options}
          selectedValue={apiConfig[key]}
          onChange={(val) => setApiConfig({ ...apiConfig, [key]: val })}
          multi={multi}
          tooltipContent={tooltipContent}
        />
      );
    });
  };

  return (
    <div className="chatapi-layout">
      <div className="content">
        {hybridWorkflow ? (
          <div className="sidebar hybrid-mode">
            <p style={{ fontStyle: "italic", color: "#888", margin: "12px" }}>
              ⚙️ Hybrid template in use — configs auto-applied.
            </p>
          </div>
        ) : (
          <div className="sidebar">
            <SelectDropdown
              label="Select API"
              options={API_OPTIONS}
              value={selectedAPI}
              onChange={handleAPIChange}
            />
            <div className="api-config-container">{renderAPIOptions()}</div>
            <div className="sidebar-actions">
              <Button
                className="mode-btn apply-default-btn"
                style={{ display: "flex", gap: "8px" }}
                onClick={handleClearAll}
                disabled={loading}
              >
                <RotateCcw
                  size={15}
                  className="icon"
                />
                Apply Default Settings
              </Button>
            </div>
          </div>
        )}
      </div>

      <main className="chatapi-main">
        <div className="usecase-selector" style={{ margin: "10px 0", textAlign: "center" }}>
          <label style={{ fontWeight: "600", marginRight: "8px" }}>Use Case:</label>
          <select
            value={selectedUseCase}
            onChange={handleUseCaseChange}
            className="usecase-dropdown"
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="Default">Default</option>
            <option value="Email Improve">✉️ Improve My Email</option>
            <option value="Simplify Text">🧑‍🎓 Simplify My Text</option>
            <option value="Summarize">📰 Summarize This</option>
            <option value="Translate to English">🌍 Translate to English</option>
            <option value="Polite Reply">💬 Polite Response</option>
            <option disabled>──────────────</option>
            {(() => {
              const saved = JSON.parse(localStorage.getItem("hybridTemplates") || "[]");
              return saved.length > 0 ? (
                <>
                  <option disabled>💾 Saved Templates</option>
                  {saved.map((t) => (
                    <option key={t.name} value={`template:${t.name}`}>
                      📁 {t.name}
                    </option>
                  ))}
                </>
              ) : (
                <option disabled>No Templates Saved</option>
              );
            })()}
          </select>
        </div>

        {showHybrid && (
          <div className="template-preview-container">
            <button
              className="close-template-btn"
              onClick={() => setShowHybrid(null)}
              title="Close Template"
            >
              <XCircle size={20} />
            </button>

            <h4>🚀 Hybrid Workflow Preview</h4>

            <div className="workflow-preview">
              {hybridWorkflow.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="workflow-node-readonly">{step.api}</div>
                  {index < hybridWorkflow.length - 1 && <span className="workflow-arrow">→</span>}
                </React.Fragment>
              ))}
            </div>

            <p className="template-preview-note">
              This template is in read-only mode. You can run it directly or create a new workflow
              from Hybrid Workspace.
            </p>
          </div>
        )}

        <div className="chatapi-messages" ref={chatWindowRef}>
          {messages.length === 0 && <p className="empty-state">Start a conversation...</p>}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.type}`}
            >
              {msg.loading ? (
                <TextLoading />
              ) : (
                <>
                  {msg.text && <div className="chat-bubble">{msg.text}</div>}
                  {msg.image && (
                    <img
                      src={URL.createObjectURL(msg.image)}
                      alt="preview"
                      className="chat-image"
                    />
                  )}
                  {msg.audios &&
                    msg.audios.map((audio, aidx) => (
                      <div
                        key={aidx}
                        className="audio-card"
                      >
                        <div className="audio-filename">{audio.name}</div>
                        <audio controls>
                          <source src={URL.createObjectURL(audio)} />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                    ))}
                  {msg.type === "bot" && msg.text && (
                    <button
                      className="btn-copy"
                      onClick={() => handleCopy(msg.text)}
                    >
                      <span className="copy-icon">📋</span>
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          {progress !== null && <div className="progress-bar">{progress}%</div>}
          <Toast message="✅ Copied!" show={copyToast} />
        </div>

        {attachedAudios.length > 0 && (
          <div className="audio-preview-container">
            {attachedAudios.map((audio, index) => (
              <div
                key={audio.id}
                className="audio-card"
              >
                <div className="audio-filename">{audio.name}</div>
                <audio controls src={audio.id}></audio>
                <button
                  className="remove-audio-card"
                  onClick={() => handleRemoveAudio(index)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}


        <div className="chatapi-input">
          <label className="btn-plus">
            <Plus size={20} />
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setAttachedImage(e.target.files[0])}
            />
          </label>

          <label className="btn-plus">
            <Mic size={20} />
            <input
              type="file"
              accept="audio/*"
              multiple
              style={{ display: "none" }}
              onChange={handleAudioUpload}
            />
          </label>

          <div className="input-box">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                resizeTextarea();
              }}
              onKeyPress={(e) => {
                handleKeyPress(e);
                textareaRef.current.style.height = "auto";
              }}
              placeholder="Type your message..."
              rows={1}
            />
          </div>

          {attachedImage && (
            <div className="image-preview">
              <img
                className="image-dis"
                src={URL.createObjectURL(attachedImage)}
                alt="preview"
              />
              <button
                className="remove-img"
                onClick={() => setAttachedImage(null)}
                type="button"
              >
                <XCircle size={24} strokeWidth={2.5} />
              </button>
            </div>
          )}

          <Button
            className="btn-send"
            onClick={handleSend}
            disabled={
              loading || (!inputText.trim() && !attachedImage && attachedAudios.length === 0)
            }
            style={{ marginLeft: "100px" }}
          >
            ➤
          </Button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </main>
    </div>
  );
};

export default ChatAPI;
