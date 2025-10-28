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
  console.log('rk_neo', API_CLASSES['Proofreader'])
  console.log('rk_neo', API_CLASSES['Writer'])
  console.log('rk_neo', API_CLASSES['Rewriter'])
  console.log('rk_neo', API_CLASSES['Summarizer'])
  console.log('rk_neo', API_CLASSES['Translator'])
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const callAI = async (apiName, text, options = {}, imageFile = null, audioFiles = []) => {
    setError("");

    let extractedText = text || "";

    if (imageFile || (audioFiles && audioFiles.length > 0)) {
      extractedText = await extractTextFromInput(text, imageFile, audioFiles);
    }

    const APIClass = API_CLASSES[apiName];
    if (APIClass && Object.keys(options).length > 0) {
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
        setLoading(true);

        let result = "";
        switch (apiName) {
          case "Proofreader":
            console.log('rk_neo --> proofread got triggerd', )
            result = await session.proofread(extractedText);
            return result.correctedInput;
          case "Writer":
            console.log('rk_neo --> Writer got triggerd', )
            result = await session.write(extractedText);
            return result;
          case "Rewriter":
            console.log('rk_neo --> Rewriter got triggerd', )
            result = await session.rewrite(extractedText);
            return result;
          case "Summarizer":
            console.log('rk_neo --> Summarizer got triggerd', )
            result = await session.summarize(extractedText);
            return result;
          case "Translator":
            console.log('rk_neo --> Translator got triggerd', )
            result = await session.translate(extractedText);
            return result;
          default:
            return extractedText;
        }
      } catch (err) {
        console.warn(`${apiName} Chrome API unavailable, falling back to Firebase.`, err);
      } finally {
        setLoading(false);
      }
    }

    // Fallback to Firebase Gemini model
    return extractTextFromInput(text, imageFile, audioFiles);
  };

  async function extractTextFromInput(text, imageFile = null, audioFiles = []) {
    try {
      console.log('rk_neo --> firebaseGCM got triggerd', )
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

      if (audioFiles && audioFiles.length > 0) {
        for (const audioFile of audioFiles) {
          const audioBase64 = await fileToBase64(audioFile);
          inputParts.push({
            inlineData: {
              data: audioBase64.split(",")[1],
              mimeType: audioFile.type || "audio/mpeg",
            },
          });
        }
      }

      const result = await model.generateContent(inputParts);
      const response = await result.response;
      const outputText = response.text();
      return outputText || "";
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
