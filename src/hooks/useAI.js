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

  const callAI = async (apiName, text, options = {}, imageFile = null, audioFile = null) => {
    setError("");
    console.log('rk_aud', {apiName, options, imageFile})

    if (apiName.toLowerCase() === "multimodal" || imageFile !== null || audioFile !== null) {
      return handleFirebaseModel(text, imageFile, audioFile);
    }

    const APIClass = API_CLASSES[apiName];
    if (APIClass) {
      try {
        const availability = await APIClass.availability(options);
        if (availability === "unavailable") throw new Error("unavailable");

        let params = { ...options };
        if (availability === "downloadable") {
          setProgress(0);
          params.monitor = (event) => {
            if (event.type === "downloadprogress") {
              setProgress(event.loaded * 100);
            }
          };
        }

        const session = await APIClass.create(params);
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
        console.warn(`${apiName} Chrome API unavailable, falling back to Firebase.`, err);
      }
    }

    return handleFirebaseModel(text);
  };

  async function handleFirebaseModel(text, imageFile = null, audioFile = null) {
    try {
      setLoading(true);
      const model = firebaseGCM(ai, { model: "gemini-2.0-flash" });

      const inputParts = [];
      const userText = text?.trim() || "Describe this input.";
      inputParts.push({ text: userText });

      if (imageFile) {
        const imageBase64 = await fileToBase64(imageFile);
        inputParts.push({
          inlineData: {
            data: imageBase64.split(",")[1],
            mimeType: imageFile.type || "image/jpeg",
          },
        });
      }

      if (audioFile) {
        const audioBase64 = await fileToBase64(audioFile);
        inputParts.push({
          inlineData: {
            data: audioBase64.split(",")[1],
            mimeType: audioFile.type || "audio/mpeg",
          },
        });
      }

      const result = await model.generateContent(inputParts);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error("Firebase AI Error:", err);
      setError(err.message);
      return "";
    } finally {
      setLoading(false);
    }
  }

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
