import React, { useState, useEffect, useRef } from "react";
import { Mic, Plus, RotateCcw, XCircle, Eye, Workflow  } from "lucide-react";
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

const ChatAPI = (props) => {
  const { loading, progress, error, callAI } = useAI();

  const {
    messages: propMessages,
    setMessages: propSetMessages,
    inputText: propInputText,
    setInputText: propSetInputText,
    selectedAPI: propSelectedAPI,
    setSelectedAPI: propSetSelectedAPI,
    apiConfig: propApiConfig,
    setApiConfig: propSetApiConfig,
    attachedImages: propAttachedImages,
    setAttachedImages: propSetAttachedImages,
    attachedAudios: propAttachedAudios,
    setAttachedAudios: propSetAttachedAudios,
  } = props || {};

  const [localMessages, setLocalMessages] = useState([]);
  const [localInputText, setLocalInputText] = useState("");
  const [localSelectedAPI, setLocalSelectedAPI] = useState("Proofreader");
  const [localApiConfig, setLocalApiConfig] = useState({});
  const [localAttachedImages, setLocalAttachedImages] = useState([]);
  const [localAttachedAudios, setLocalAttachedAudios] = useState([]);

  const messages = propMessages ?? localMessages;
  const setMessages = propSetMessages ?? setLocalMessages;

  const inputText = propInputText ?? localInputText;
  const setInputText = propSetInputText ?? setLocalInputText;

  const selectedAPI = propSelectedAPI ?? localSelectedAPI;
  const setSelectedAPI = propSetSelectedAPI ?? setLocalSelectedAPI;

  const apiConfig = propApiConfig ?? localApiConfig;
  const setApiConfig = propSetApiConfig ?? setLocalApiConfig;

  const attachedImages = propAttachedImages ?? localAttachedImages;
  const setAttachedImages = propSetAttachedImages ?? setLocalAttachedImages;

  const attachedAudios = propAttachedAudios ?? localAttachedAudios;
  const setAttachedAudios = propSetAttachedAudios ?? setLocalAttachedAudios;

  // local-only UI state
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

  useEffect(() => {
    setApiConfig(getDefaultConfig(selectedAPI));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAPI]);

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
    if (!inputText.trim() && attachedImages.length === 0 && attachedAudios.length === 0) return;
    const userMessage = {
      type: "user",
      text: inputText,
      images: attachedImages,
      audios: attachedAudios,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAttachedImages([]);
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
      result = await callAI(selectedAPI, contextualInput, apiConfig, attachedImages, attachedAudios);
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
    setAttachedImages([]);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachedImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveAudio = (index) => {
    setAttachedAudios((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
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
            <div className="api-config-scroll">
              <div className="api-config-container">{renderAPIOptions()}</div>
            </div>
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
        <div
          className="usecase-selector"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            margin: "10px 0",
          }}
        >
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
          {hybridWorkflow && (
            <button
              className="workflow-preview-btn"
              onClick={() => setShowHybrid(true)}
              title="View Workflow Preview"
            >
              <Workflow size={20} strokeWidth={2} />
            </button>
          )}
        </div>

        {showHybrid && (
          <div className="modal-overlay" onClick={() => setShowHybrid(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()} // prevent close on content click
            >
              <button
                className="close-template-btn"
                onClick={() => setShowHybrid(false)}
                title="Close Template"
              >
                <XCircle size={20} />
              </button>

              <h4 style={{ color: "black" }}>🚀 Hybrid Workflow Preview</h4>

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
          </div>
        )}
        <div className="chatapi-input-container">
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
                    {msg.images &&
                      msg.images.map((img, i) => (
                        <img
                          key={i}
                          src={URL.createObjectURL(img)}
                          alt={`preview-${i}`}
                          className="chat-image"
                        />
                    ))}
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
            {progress !== null && progress !== 0  && <div className="progress-bar">{progress}%</div>}
            <Toast message="✅ Copied!" show={copyToast} />
          </div>

          {[...attachedImages, ...attachedAudios].length > 0 && (
            <div className="media-preview-container">
              {[...attachedImages.map((file) => ({ type: "image", file })), 
                ...attachedAudios.map((file) => ({ type: "audio", file }))
              ].map((item, index) => (
                <div key={index} className="media-card">
                  {item.type === "image" ? (
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt={`preview-${index}`}
                      className="media-preview-image"
                    />
                  ) : (
                    <div className="media-audio-wrapper">
                      <div className="media-filename">{item.file.name}</div>
                      <audio
                        controls
                        src={item.file.id ?? URL.createObjectURL(item.file)}
                        className="media-audio"
                      />
                    </div>
                  )}

                  <button
                    className="remove-media-card"
                    onClick={() =>
                      item.type === "image"
                        ? handleRemoveImage(attachedImages.indexOf(item.file))
                        : handleRemoveAudio(attachedAudios.indexOf(item.file))
                    }
                  >
                    ×
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
                multiple
                style={{ display: "none" }}
                onChange={handleImageUpload}
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

            <Button
              className="btn-send"
              onClick={handleSend}
              disabled={
                loading || (!inputText.trim() && !attachedImages && attachedAudios.length === 0)
              }
              style={{ marginLeft: "100px" }}
            >
              ➤
            </Button>
          </div>

          {error && <p className="error-text">{error}</p>}
        </div>
      </main>
    </div>
  );
};

export default ChatAPI;
