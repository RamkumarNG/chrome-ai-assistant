import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  ApiOptionSelector,
  SelectDropdown,
  TextLoading,
} from "../../../components";
import { API_OPTIONS, API_CONFIGS, API_KEY_LABELS } from "../../constants";
import { useAI } from "../../../hooks/useAI";

const ChatAPI = () => {
  const { loading, progress, error, callAI } = useAI();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedAPI, setSelectedAPI] = useState("Proofreader");
  const [apiConfig, setApiConfig] = useState({});
  const [attachedImage, setAttachedImage] = useState(null);
  const [copyToast, setCopyToast] = useState(false);

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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({ top: chatWindowRef.current.scrollHeight, behavior: "smooth" });
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !attachedImage) return;

    const userMessage = { type: "user", text: inputText, image: attachedImage };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAttachedImage(null);
    resizeTextarea();
    scrollToBottom();

    const loadingMessage = { type: "bot", text: "", loading: true };
    setMessages((prev) => [...prev, loadingMessage]);
    scrollToBottom();

    const result = await callAI(selectedAPI, userMessage.text, apiConfig, userMessage.image);

    setMessages((prev) => {
      const updated = [...prev];
      const loadingIndex = updated.findIndex((m) => m.loading);
      if (loadingIndex !== -1) updated[loadingIndex] = { type: "bot", text: result };
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

  const handleClearAll = () => {
    setMessages([]);
    setInputText("");
    setAttachedImage(null);
    resizeTextarea();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 1500);
    });
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
    <div className="chat-page">
      {/* Sidebar */}
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
            className="btn-secondary"
            onClick={handleClearAll}
            disabled={loading}
          >
            🔄 Clear All Configs
          </Button>
        </div>
      </div>

      {/* Main Chat */}
      <main className="chat-main">
        <div className="chat-content">
          <div className="chat-window" ref={chatWindowRef}>
            {messages.length === 0 && <p className="empty-text">Start the conversation</p>}

            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.type}`}>
                {msg.type === "bot" && !msg.loading && (
                  <span className="chat-api-label">{selectedAPI}</span>
                )}
                {msg.loading ? (
                  <TextLoading />
                ) : (
                  <>
                    {msg.text && <div className="bubble">{msg.text}</div>}
                    {msg.image && (
                      <img src={URL.createObjectURL(msg.image)} alt="preview" className="msg-image"/>
                    )}
                    {msg.type === "bot" && !msg.loading && (
                      <button className="btn-copy" onClick={() => handleCopy(msg.text)}>📋</button>
                    )}
                  </>
                )}
              </div>
            ))}

            {progress !== null && <div className="progress-bar">{progress}%</div>}
            {copyToast && <div className="copy-toast">Copied!</div>}
          </div>

          {/* Chat Input */}
          <div className="chat-input">
            <div className="input-wrapper">
              {selectedAPI.toLowerCase() === "multimodal" && (
                <label className="btn-plus">
                  ➕
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setAttachedImage(e.target.files[0])}
                  />
                </label>
              )}

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); resizeTextarea(); }}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
              />

              {attachedImage && (
                <img src={URL.createObjectURL(attachedImage)} alt="preview" className="input-image-preview"/>
              )}

              <Button
                className="btn-send"
                onClick={handleSend}
                disabled={loading || (!inputText.trim() && !attachedImage)}
              >
                ➤
              </Button>
            </div>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
      </main>
    </div>
  );
};

export default ChatAPI;
