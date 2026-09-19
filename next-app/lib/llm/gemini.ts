export function isMockMode(): boolean {
  return process.env.MOCK_MODE === "true" || !process.env.GEMINI_API_KEY;
}

const MOCK_STREAM = [
  "Payment confirmed. ",
  "Unlocking your request… ",
  "Thinking through the prompt… ",
  "Here is a concise answer: arcdot. lets agents pay a few cents in USDC, ",
  "reach gated APIs instantly, and keep going without human checkout friction.",
];

export async function* mockStreamReply(prompt: string): AsyncGenerator<string> {
  yield `Received: "${truncate(prompt, 80)}"\n\n`;
  for (const chunk of MOCK_STREAM) {
    await sleep(40);
    yield chunk;
  }
}

export async function mockCompleteReply(prompt: string): Promise<string> {
  let out = "";
  for await (const chunk of mockStreamReply(prompt)) out += chunk;
  return out;
}

/**
 * Call Gemini Flash. Falls back to mock when MOCK_MODE or missing key.
 * Uses the Generative Language REST API (no extra SDK required for v1).
 */
export async function completeWithGemini(prompt: string): Promise<{
  text: string;
  mock: boolean;
}> {
  if (isMockMode()) {
    return { text: await mockCompleteReply(prompt), mock: true };
  }

  const key = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Gemini error", res.status, errText);
    if (process.env.MOCK_MODE_ON_ERROR === "true") {
      return { text: await mockCompleteReply(prompt), mock: true };
    }
    throw new Error(`Gemini request failed (${res.status})`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
    "";

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return { text, mock: false };
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
