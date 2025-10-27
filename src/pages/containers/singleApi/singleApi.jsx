import { useEffect, useState } from "react";
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

const SingleAPI = () => {
  const { loading, progress, error, callAI } = useAI();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedAPI, setSelectedAPI] = useState("Proofreader");
  const [apiConfig, setApiConfig] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

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
                className="btn-primary"
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

          <div className="card">
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
