import React, { useState } from "react";
import {
  OutputDisplay,
  Button,
  ApiOptionSelector,
  TextArea,
  TextLoading,
  ImageUploader,
  DownloadLoader,
  Toast,
} from "../../../components";
import {
  API_OPTIONS,
  API_CONFIGS,
  API_KEY_LABELS,
} from "../../constants";
import { executeHybridWorkflow, useAI } from "../../../hooks/useAI";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ArrowRight, Save, XCircle } from "lucide-react";

const TemplateModal = ({ isOpen, onClose, onSave }) => {
  const [templateName, setTemplateName] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!templateName.trim()) return;
    onSave(templateName);
    setTemplateName("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <Save size={22} />
          <h3>Save Template</h3>
          <button className="close-btn" onClick={onClose}>
            <XCircle size={20} />
          </button>
        </div>
        <p className="modal-desc">Give your workflow a clear and memorable name.</p>
        <input
          className="modal-input"
          placeholder="e.g. Blog Summary Workflow"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        <div className="modal-actions">
          <Button className="btn-secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button className="btn-primary" onClick={handleSave}>
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
};

const HybridWorkflow = (props) => {
  const {
    inputText,
    setInputText,
    outputText,
    setOutputText,
    workflow: propWorkflow,
    setWorkflow: propSetWorkflow,
    intermediateOutputs: propIntermediateOutputs,
    setIntermediateOutputs: propSetIntermediateOutputs,
  } = props || {};

  const [localWorkflow, setLocalWorkflow] = useState([]);
  const workflow = propWorkflow ?? localWorkflow;
  const setWorkflow = propSetWorkflow ?? setLocalWorkflow;

  const [localIntermediateOutputs, setLocalIntermediateOutputs] = useState([]);
  const intermediateOutputs = propIntermediateOutputs ?? localIntermediateOutputs;
  const setIntermediateOutputs = propSetIntermediateOutputs ?? setLocalIntermediateOutputs;

  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { loading, progress, error, callAI } = useAI();

  const getDefaultConfig = (api) => {
    const defaultConfig = {};
    Object.entries(API_CONFIGS[api] || {}).forEach(([key, { options, multi }]) => {
      defaultConfig[key] = multi ? [options[0].value] : options[0].value;
    });
    return defaultConfig;
  };

  const addStep = (api) => {
    setWorkflow([...workflow, { api, config: getDefaultConfig(api) }]);
    setSelectedStepIndex(workflow.length);
  };

  const updateStepConfig = (index, newConfig) => {
    const newWorkflow = [...workflow];
    newWorkflow[index].config = newConfig;
    setWorkflow(newWorkflow);
  };

  const removeStep = (index) => {
    const newWorkflow = [...workflow];
    newWorkflow.splice(index, 1);
    setWorkflow(newWorkflow);
    if (selectedStepIndex === index) {
      setSelectedStepIndex(null);
    } else if (selectedStepIndex > index) {
      setSelectedStepIndex(selectedStepIndex - 1);
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  const handleSaveTemplate = (name) => {
    const existing = JSON.parse(localStorage.getItem("hybridTemplates") || "[]");
    const newTemplate = {
      name,
      workflow,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("hybridTemplates", JSON.stringify([...existing, newTemplate]));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
    setShowTemplateModal(false);
  };

  const handleRunHybrid = async () => {
    setOutputText("");
    setIntermediateOutputs([]);
    const result = await executeHybridWorkflow(
      inputText,
      workflow,
      callAI,
      setIntermediateOutputs
    );
    setOutputText(result);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newWorkflow = Array.from(workflow);
    const [moved] = newWorkflow.splice(result.source.index, 1);
    newWorkflow.splice(result.destination.index, 0, moved);
    setWorkflow(newWorkflow);
  };

  const renderConfigPanel = () => {
    if (selectedStepIndex === null || selectedStepIndex >= workflow.length) {
      return <p className="empty-config">Select a step to configure</p>;
    }

    const step = workflow[selectedStepIndex];
    const config = API_CONFIGS[step.api] || {};

    return (
      <div className="config-panel">
        <h4>{step.api} Settings</h4>
        {Object.entries(config).map(([key, { options, multi, tooltipContent }]) => {
          const label = API_KEY_LABELS[key] || key;
          return (
            <ApiOptionSelector
              key={key}
              configKey={label}
              options={options}
              selectedValue={step.config[key]}
              onChange={(val) =>
                updateStepConfig(selectedStepIndex, { ...step.config, [key]: val })
              }
              multi={multi}
              tooltipContent={tooltipContent}
            />
          );
        })}
        {step.api.toLowerCase() === "multimodal" && (
          <div className="image-upload-section">
            <h5>Upload Image (optional)</h5>
            <ImageUploader
              selectedImage={step.imageFile || null}
              onChange={(file) => {
                const newWorkflow = [...workflow];
                newWorkflow[selectedStepIndex].imageFile = file;
                setWorkflow(newWorkflow);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="hybrid-wrapper dark-mode">
      <aside className="sidebar">
        <h3>Available APIs</h3>

        <div className="api-list">
          {API_OPTIONS.map(({ value, label }) => (
            <div key={value} className="api-card" onClick={() => addStep(value)}>
              <span>{label}</span>
              <span>➕</span>
            </div>
          ))}
        </div>
        {workflow.length > 0 && (
          <div className="config-panel-container">{renderConfigPanel()}</div>
        )}
      </aside>

      <main className="main-section">
        <div className="top-bar">
          <div className="card">
            <div className="text-area-container">
              <TextArea
                value={inputText}
                onChange={setInputText}
                label="Enter your input prompt..."
              />
            </div>

            <div className="action-buttons">
              <Button
                className="btn-primary hybrid-send-btn"
                onClick={handleRunHybrid}
                disabled={!inputText || workflow.length === 0 || loading}
              >
                🚀 Run Workflow
              </Button>
              <Button
                className="btn-secondary"
                onClick={handleClear}
                disabled={loading}
              >
                🧹 Clear
              </Button>
              <Button
                className="btn-tertiary"
                onClick={() => setShowTemplateModal(true)}
                disabled={workflow.length === 0}
              >
                💾 Save as Template
              </Button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>

        <div className="middle-section">
          {progress !== null && progress !== 0 && <DownloadLoader progress={progress} />}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="workflow" direction="horizontal">
              {(provided) => (
                <div
                  className="workflow-visual"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {workflow.length === 0 ? (
                    <p className="empty-text">Select APIs from the left panel</p>
                  ) : (
                    workflow.map((step, index) => (
                      <React.Fragment key={index}>
                        <Draggable draggableId={String(index)} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`workflow-node ${
                                selectedStepIndex === index ? "selected" : ""
                              }`}
                              onClick={() => setSelectedStepIndex(index)}
                            >
                              <span>{step.api}</span>
                              <button
                                className="btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStep(index);
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </Draggable>
                        {index < workflow.length - 1 && (
                          <div className="arrow">
                            <ArrowRight size={18} />
                          </div>
                        )}
                      </React.Fragment>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="outputs-grid">
            <div className="intermediate">
              <h4>Intermediate Outputs</h4>
              <div className="output-list">
                {loading && intermediateOutputs.length === 0 ? (
                  <TextLoading />
                ) : (
                  intermediateOutputs.map((out, i) => (
                    <div key={i} className="output-card">
                      <strong>{out.api}</strong>
                      <p>{out.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card hybrid-output-card">
              <h4>Final Output</h4>
              <OutputDisplay
                text={outputText}
                loading={loading}
                displayOutput={false}
              />
            </div>
          </div>
        </div>
      </main>

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSave={handleSaveTemplate}
      />
      <Toast message="💾 Template Saved!" show={showToast} />
    </div>
  );
};

export default HybridWorkflow;
