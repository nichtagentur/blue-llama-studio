const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export async function startGeneration(prompt: string, aspectRatio = "16:9") {
  const res = await fetch(
    `${BASE_URL}/models/veo-3.1-fast-generate-preview:predictLongRunning`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { aspectRatio },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Veo API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.name as string; // operation name for polling
}

export async function pollStatus(operationName: string) {
  const res = await fetch(`${BASE_URL}/${operationName}`, {
    headers: {
      "x-goog-api-key": process.env.GEMINI_API_KEY!,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Veo poll error (${res.status}): ${err}`);
  }

  const data = await res.json();

  if (data.done) {
    const samples = data.response?.generateVideoResponse?.generatedSamples;
    if (samples && samples.length > 0) {
      return { done: true, videoUri: samples[0].video.uri as string };
    }
    throw new Error("Generation completed but no video returned");
  }

  return { done: false, videoUri: null };
}
