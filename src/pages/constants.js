export const API_OPTIONS = [
  { value: "Proofreader", label: "Proof Reader" },
  { value: "Writer", label: "Writer" },
  { value: "Rewriter", label: "Rewriter" },
  { value: "Summarizer", label: "Summarizer" },
  { value: "Translator", label: "Translator" },
  { value: "multiModal", label: "MultiModal" },
];

export const API_KEY_LABELS = {
  includeCorrectionTypes: "Include Correction Types",
  includeCorrectionExplanations: "Include Correction Explanations",
  correctionExplanationLanguage: "Correction Explanation Language",
  expectedInputLanguages: "Expected Input Languages",
  tone: "Tone",
  style: "Style",
  type: "Summary Type",
  length: "Summary Length",
  format: "Summary Format",
  sourceLanguage: "Source Language",
  targetLanguage: "Target Language",
  multiModal: "MultiModal",
};

export const API_CONFIGS = {
  Proofreader: {
    includeCorrectionTypes: { 
      options: [
        { value: true, label: "Enable" },
        { value: false, label: "Disable" },
      ], 
      multi: false,
      tooltipContent: "Enable or disable correction types in the proofreader output"
    },

    includeCorrectionExplanations: { 
      options: [
        { value: true, label: "Enable" },
        { value: false, label: "Disable" },
      ], 
      multi: false,
      tooltipContent: "Show detailed explanations for each correction"
    },

    correctionExplanationLanguage: { 
      options: [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
      ], 
      multi: false,
      tooltipContent: "Language used for correction explanations"
    },

    expectedInputLanguages: { 
      options: [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
      ], 
      multi: true,
      tooltipContent: "Allowed input languages for the proofreader"
    },
  },

  Writer: {
    tone: { 
      options: [
        { value: "formal", label: "Formal" },
        { value: "casual", label: "Casual" },
        { value: "neutral", label: "Neutral" },
      ], 
      multi: false,
      tooltipContent: "Select the tone for the generated text"
    },

    format: { 
      options: [
        { value: "plain-text", label: "Plain Text" },
        { value: "markdown", label: "Markdown" },
      ], 
      multi: false,
      tooltipContent: "Choose the output text format"
    },

    length: { 
      options: [
        { value: "short", label: "Short" },
        { value: "medium", label: "Medium" },
        { value: "long", label: "Long" },
      ], 
      multi: false,
      tooltipContent: "Specify the length of the generated text"
    },
  },

  Rewriter: {
    style: { 
      options: [
        { value: "formal", label: "Formal" },
        { value: "casual", label: "Casual" },
        { value: "concise", label: "Concise" },
      ], 
      multi: false,
      tooltipContent: "Select the style for rewriting text"
    },

    format: { 
      options: [
        { value: "plain-text", label: "Plain Text" },
        { value: "markdown", label: "Markdown" },
      ], 
      multi: false,
      tooltipContent: "Output format of the rewritten text"
    },

    length: { 
      options: [
        { value: "shorter", label: "Short" },
        { value: "as-is", label: "As-Is" },
        { value: "longer", label: "Long" },
      ], 
      multi: false,
      tooltipContent: "Specify the length relative to the input text"
    },
  },

  Summarizer: {
    type: { 
      options: [
        { value: "tldr", label: "TL;DR" },
        { value: "key-points", label: "Key Points" },
        { value: "teaser", label: "Teaser" },
        { value: "headline", label: "Headline" }
      ], 
      multi: false,
      tooltipContent: "Choose the summarization type"
    },

    length: { 
      options: [
        { value: "short", label: "Short" },
        { value: "medium", label: "Medium" },
        { value: "long", label: "Long" },
      ], 
      multi: false,
      tooltipContent: "Select the length of the summary"
    },

    format: { 
      options: [
        { value: "plain-text", label: "Plain Text" },
        { value: "markdown", label: "Markdown" },
      ], 
      multi: false,
      tooltipContent: "Output format for the summary"
    },
  },

  Translator: {
    sourceLanguage: { 
      options: [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
      ], 
      multi: false,
      tooltipContent: "Select the source language of the text"
    },

    targetLanguage: { 
      options: [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
      ], 
      multi: false,
      tooltipContent: "Select the target language for translation"
    },
  },
  multiModal: {
    Type: {
      options: [
        { value: "Photos", label: "Photos" },
        // { value: "audio", label: "Audio" },
      ], 
      multi: false,
    }
  },
};

export const USECASE_CONTEXTS = {
  "Email Improve": "Improve this email for clarity, tone, and professionalism.",
  "Simplify Text": "Simplify this text to a middle-school reading level.",
  "Summarize": "Summarize the content concisely in 3 short bullet points.",
  "Translate to English": "Translate the following text into English, keeping natural phrasing.",
  "Polite Reply": "Generate a polite and friendly reply based on this input.",
  "Default": "",
};
