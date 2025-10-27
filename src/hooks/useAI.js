import { useState } from "react";
import { ai, firebaseGCM } from "../firebaseconifg";

const API_CLASSES = {
  Proofreader: window.Proofreader,
  Writer: window.Writer,
  Rewriter: window.Rewriter,
  Summarizer: window.Summarizer,
  Translator: window.Translator,
};

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const callAI = async (apiName, text, options = {}, imageFile = null) => {
    setError("");

    if (apiName.toLowerCase() === "multimodal") {
      try {
        setLoading(true);

        const modelName = "gemini-2.0-flash";
        const model = firebaseGCM(ai, { model: modelName });

        const inputParts = [];

        // Add text if provided
        if (text && text.trim() !== "") inputParts.push({ text });

        // Add image if provided
        if (imageFile) {
          const imageBase64 = await fileToBase64(imageFile);
          inputParts.push({
            inlineData: {
              data: imageBase64.split(",")[1],
              mimeType: imageFile.type || "image/jpeg",
            },
          });
        }

        inputParts.push({
          text:
            imageFile && text
              ? `${text}\n\nAdditionally, describe what is visible in the image in context.`
              : imageFile
              ? "Describe what is happening in this image in a natural, detailed way."
              : "Analyze, summarize, or expand on the given text in detail.",
        });

        const result = await model.generateContent(inputParts);
        const response = await result.response;
        const output = response.text();

        return output;
      } catch (err) {
        console.error("Multimodal Error:", err);
        setError(err.message);
        return "";
      } finally {
        setLoading(false);
      }
    }

    const APIClass = API_CLASSES[apiName];
    if (!APIClass) {
      setLoading(false);
      setError(`${apiName} API not supported in this Chrome version`);
      return "";
    }

    try {
      const availability = await APIClass.availability(options);
      console.log("availability:", { availability, options, text });

      if (availability === "unavailable") {
        throw new Error(`${apiName} API is unsupported`);
      }

      let params;
      if (availability === "available") {
        params = { ...options };
      } else if (availability === "downloadable") {
        setProgress(0);
        params = {
          ...options,
          monitor: (event) => {
            if (event.type === "downloadprogress") {
              setProgress(event.loaded * 100);
            }
          },
        };
      }

      const session = await APIClass.create({ ...params });
      if (availability === "downloadable") {
        setProgress(100);
        setTimeout(() => setProgress(null), 500);
      }

      setLoading(true);
      let result = "";

      switch (apiName) {
        case "Proofreader":
          result = await session.proofread(text);
          return result.correctedInput;

        case "Writer":
          result = await session.write(text);
          return result;

        case "Rewriter":
          result = await session.rewrite(text);
          return result;

        case "Summarizer":
          result = await session.summarize(text);
          return result;

        case "Translator":
          result = await session.translate(text);
          return result;

        default:
          return text;
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      return "";
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(null), 500);
    }
  };

  return { loading, progress, error, callAI };
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
