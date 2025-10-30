import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

import {
  TextArea,
  OutputDisplay,
  SelectDropdown,
  ApiOptionSelector,
  Button,
  DownloadLoader,
  ImageUploader,
} from "../../../components";
import { useAI } from "../../../hooks/useAI";
import { API_CONFIGS, API_OPTIONS, API_KEY_LABELS } from "../../constants";

const SingleAPI = (props) => {
  const {
    inputText: propInputText,
    setInputText: propSetInputText,
    outputText: propOutputText,
    setOutputText: propSetOutputText,
    selectedAPI: propSelectedAPI,
    setSelectedAPI: propSetSelectedAPI,
    apiConfig: propApiConfig,
    setApiConfig: propSetApiConfig,
  } = props || {};
  const { loading, progress, error, callAI } = useAI();

  const [localInputText, setLocalInputText] = useState("");
  const [localOutputText, setLocalOutputText] = useState("");
  const [localSelectedAPI, setLocalSelectedAPI] = useState("Proofreader");
  const [localApiConfig, setLocalApiConfig] = useState({});

  const [selectedImage, setSelectedImage] = useState(null);

  const inputText = propInputText ?? localInputText;
  const setOutputText = propSetInputText ?? setLocalInputText;

  const outputText = propOutputText ?? localOutputText;
  const setInputText = propSetOutputText ?? setLocalOutputText;

  const selectedAPI = propSelectedAPI ?? localSelectedAPI;
  const setSelectedAPI = propSetSelectedAPI ?? setLocalSelectedAPI;

  const apiConfig = propApiConfig ?? localApiConfig;
  const setApiConfig = propSetApiConfig ?? setLocalApiConfig;

  const getDefaultConfig = (api) => {
    const defaultConfig = {};
    Object.entries(API_CONFIGS[api]).forEach(([key, { options, multi }]) => {
      defaultConfig[key] = multi ? [options[0].value] : options[0].value;
    });
    return defaultConfig;
  };

  const handleAPIChange = (api) => {
    setSelectedAPI(api);
    const defaultConfig = {};
    Object.entries(API_CONFIGS[api]).forEach(([key, values]) => {
      defaultConfig[key] = values[0];
    });
    setApiConfig(defaultConfig);
  };

  const renderAPIOptions = () => {
    const config = API_CONFIGS[selectedAPI];
    return Object.entries(config).map(([key, { options, multi, tooltipContent }]) => {
      const displayLabel = API_KEY_LABELS[key] || key;
      return (
        <ApiOptionSelector
          key={key}
          configKey={displayLabel}
          options={options}
          selectedValue={apiConfig[key]}
          onChange={(val) => setApiConfig({ ...apiConfig, [key]: val })}
          multi={multi}
          tooltipContent={tooltipContent}
        />
      );
    });
  };

  const handleRunAI = async () => {
    const result = await callAI(selectedAPI, inputText, apiConfig, selectedImage);
    setOutputText(result);
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setSelectedImage(null);
  };

  const handleClearAll = () => {
    setApiConfig(getDefaultConfig(selectedAPI));
  };

  useEffect(() => setApiConfig(getDefaultConfig(selectedAPI)), [selectedAPI]);

  return (
    <div className="single-page">
      <div className="content">
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
              style={{
                display: "flex",
                gap: "8px"
              }}
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

        <div className="main-content">
          <div className="card">
            {selectedAPI !== "multiModal" ? (
              <TextArea
                value={inputText}
                onChange={setInputText}
                label="Enter your input prompt..."
              />
            ):(
              <ImageUploader
                selectedImage={selectedImage}
                onChange={setSelectedImage}
              />
            )}
            
            <div className="action-buttons">
              <Button
                className="btn-primary single-api-send-btn"
                onClick={handleRunAI}
                disabled={!inputText && !selectedImage || loading}
              >
                🚀 Run AI
              </Button>
              <Button className="btn-secondary" onClick={handleClear} disabled={loading}>
                🧹 Clear
              </Button>
            </div>

            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="card single-api-output">
            <h4>Final Output</h4>
            <OutputDisplay
              text={outputText}
              loading={loading}
              displayOutput={false}
            />
          </div>

          {progress !== null && <DownloadLoader progress={progress} />}
        </div>
      </div>
    </div>
  );
};

export default SingleAPI;
