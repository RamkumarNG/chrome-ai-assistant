export async function summarizeText(text, style = "formal", onProgress) {
  if (!window.chromeAI?.Summarizer) throw new Error("Summarizer API not supported");
  const session = await window.chromeAI.Summarizer.create({ monitor: onProgress });
  while (!session.isReady) await new Promise((r) => setTimeout(r, 500));
  const result = await session.summarize({ text });
  return result.summary;
}
