export async function proofreadText(text, style = "formal", onProgress) {
  if (!window.chromeAI?.Proofreader) {
    throw new Error("Proofreader API not supported in this Chrome version");
  }

  // 1️⃣ Check availability
  const available = await window.chromeAI.Proofreader.availability();

  if (available === "downloadable") {
    console.log("Proofreader runtime needs to be downloaded...");
    // 2️⃣ Create session to download runtime
    const session = await window.chromeAI.Proofreader.create({ monitor: onProgress });

    // Wait for runtime download
    while (!session.isReady) {
      await new Promise((r) => setTimeout(r, 500));
    }

    // 3️⃣ Call the API
    const result = await session.check({ text, style });
    return result.correctedText;
  } else if (available === "supported") {
    // Runtime already available
    const session = await window.chromeAI.Proofreader.create({ monitor: onProgress });
    while (!session.isReady) {
      await new Promise((r) => setTimeout(r, 500));
    }
    const result = await session.check({ text, style });
    return result.correctedText;
  } else {
    throw new Error("Proofreader API not supported or unavailable");
  }
}
