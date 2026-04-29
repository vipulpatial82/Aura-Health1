import { AppError } from '../middleware/errorMiddleware.js';

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const callGemini = async (contents, generationConfig = {}, apiKey) => {
  const keys = [...new Set([apiKey, process.env.GEMINI_API_KEY].filter(Boolean))];
  if (!keys.length) throw new AppError('AI service not configured', 503);

  let lastError = '';

  for (const key of keys) {
    let keyInvalid = false;
    for (const model of MODELS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const data = await res.json();

        if (data.error) {
          lastError = data.error.message || 'Unknown error';
          console.error(`[Gemini] key=...${key.slice(-6)} model=${model} error ${data.error.code}: ${lastError}`);
          // Invalid/expired key — skip all remaining models for this key
          if (data.error.code === 400 || data.error.code === 403) {
            keyInvalid = true;
            break;
          }
          await sleep(data.error.code === 429 ? 3000 : 500);
          continue;
        }

        const parts = data.candidates?.[0]?.content?.parts;
        const text = parts?.find(p => p.text && !p.thought)?.text || parts?.[0]?.text;
        if (!text) { lastError = 'No response from model'; continue; }

        return text;
      } catch (err) {
        clearTimeout(timeout);
        lastError = err.name === 'AbortError' ? `Model ${model} timed out` : `Network error: ${err.message}`;
        console.error(`[Gemini] key=...${key.slice(-6)} model=${model}: ${lastError}`);
        continue;
      }
    }
    if (keyInvalid) continue;
  }

  console.error(`[Gemini] All keys/models exhausted. Last error: ${lastError}`);
  throw new AppError(`AI unavailable: ${lastError}`, 503);
};
