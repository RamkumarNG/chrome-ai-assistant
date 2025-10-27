export async function rewriteText(text, style = "formal", onProgress) {
  if (!window.chromeAI?.Rewriter) throw new Error("Rewriter API not supported");
  const session = await window.chromeAI.Rewriter.create({ monitor: onProgress });
  while (!session.isReady) await new Promise((r) => setTimeout(r, 500));
  const result = await session.rewrite({ text, style });
  return result.outputText;
}
