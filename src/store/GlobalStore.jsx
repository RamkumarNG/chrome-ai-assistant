import React, { createContext, useContext, useState } from "react";

const GlobalContext = createContext(null);

export const GlobalProvider = ({ children }) => {
  // Per-workspace inputs/outputs (so switching doesn't clobber other workspace content)
  const [singleInput, setSingleInput] = useState("");
  const [singleOutput, setSingleOutput] = useState("");

  const [hybridInput, setHybridInput] = useState("");
  const [hybridOutput, setHybridOutput] = useState("");

  // Chat-specific state — messages + attachments MUST persist across workspace switches
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachedImages, setAttachedImages] = useState([]);
  const [attachedAudios, setAttachedAudios] = useState([]);

  // Shared settings (APIs, configs, prefs)
  const [selectedAPI, setSelectedAPI] = useState("Proofreader");
  const [apiConfig, setApiConfig] = useState({});

  const value = {
    // single
    singleInput,
    setSingleInput,
    singleOutput,
    setSingleOutput,
    // hybrid
    hybridInput,
    setHybridInput,
    hybridOutput,
    setHybridOutput,
    // chat (persistent)
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
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalStore = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobalStore must be used within GlobalProvider");
  return ctx;
};