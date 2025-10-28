import React, { useState } from "react";
import {
  OutputDisplay,
  Button,
  ApiOptionSelector,
  DownloadLoader,
  TextArea,
  TextLoading,
  ImageUploader,
} from "../../../components";
import {
  API_OPTIONS,
  API_CONFIGS,
  API_KEY_LABELS,
} from "../../constants";
import { useAI } from "../../../hooks/useAI";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ArrowRight } from "lucide-react";

// Executes workflow in order
const executeHybridWorkflow = async (inputText, workflow, callAI, setIntermediateOutputs) => {
  let currentText = inputText;
  const outputs = [];

  for (const step of workflow) {
    // pass step.imageFile along with config
    currentText = await callAI(step.api, currentText, step.config, step.imageFile);
    outputs.push({ api: step.api, text: currentText });
    setIntermediateOutputs([...outputs]);
  }

  return currentText;
};

const HybridWorkflow = ({ inputText, setInputText, outputText, setOutputText }) => {
  const { loading, progress, error, callAI } = useAI();
  const [workflow, setWorkflow] = useState([]);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [intermediateOutputs, setIntermediateOutputs] = useState([]);

  const getDefaultConfig = (api) => {
    const defaultConfig = {};
    Object.entries(API_CONFIGS[api]).forEach(([key, { options, multi }]) => {
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

  const handleRunHybrid = async () => {
    setOutputText("");
    setIntermediateOutputs([]);
    const result = await executeHybridWorkflow(inputText, workflow, callAI, setIntermediateOutputs);
    setOutputText(result);
  };

  // Drag-and-drop handler
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

      {/* Render all API config options */}
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

      {/* If step is multimodal, show image uploader */}
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
    <div className="hybrid-wrapper">
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
            <TextArea
              value={inputText}
              onChange={setInputText}
              label="Enter your input prompt..."
            />
            <div className="action-buttons">
              <Button
                className="btn-primary"
                onClick={handleRunHybrid}
                disabled={!inputText || workflow.length === 0 || loading}
              >
                🚀 Run Workflow
              </Button>
              <Button className="btn-secondary" onClick={handleClear} disabled={loading}>
                🧹 Clear
              </Button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>

        <div className="middle-section">
          {progress !== null && <DownloadLoader progress={progress} />}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="workflow" direction="horizontal">
              {(provided) => (
                <div className="workflow-visual" ref={provided.innerRef} {...provided.droppableProps}>
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
                              className={`workflow-node ${selectedStepIndex === index ? "selected" : ""}`}
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

            <div className="card">
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
    </div>
  );
}

export default HybridWorkflow;
