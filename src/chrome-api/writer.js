export async function writeText(text, style = "formal", onProgress) {
  if (!window.chromeAI?.Writer) throw new Error("Writer API not supported");
  const session = await window.chromeAI.Writer.create({ monitor: onProgress });
  while (!session.isReady) await new Promise((r) => setTimeout(r, 500));
  const result = await session.write({ text, style });
  return result.outputText;
}
