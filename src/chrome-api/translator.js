export async function translateText(text, targetLang = "es", onProgress) {
  if (!window.chromeAI?.Translator) throw new Error("Translator API not supported");
  const session = await window.chromeAI.Translator.create({ monitor: onProgress });
  while (!session.isReady) await new Promise((r) => setTimeout(r, 500));
  const result = await session.translate({ text, targetLang });
  return result.translation;
}
