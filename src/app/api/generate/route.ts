import { NextRequest, NextResponse } from 'next/server';

// Server-side Gemini text generation. API key stays on the server,
// never exposed to the browser. Key rotation: GEMINI_API_KEY_1, _2, ...
// (same pattern as MajelisKu OCR). 429 without "per day" = per-minute
// throttle -> wait & retry same key; daily 429 -> rotate to next key.

function loadKeys(): string[] {
  const keys: string[] = [];
  for (const name of ['GEMINI_API_KEY_1', 'GEMINI_API_KEY_2', 'GEMINI_API_KEY']) {
    const v = process.env[name];
    if (v && !keys.includes(v)) keys.push(v);
  }
  return keys;
}

const MODEL = 'gemini-3.8-flash';
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function isDailyQuota(payload: unknown): boolean {
  try {
    const err = (payload as { error?: { code?: unknown; message?: unknown } })
      ?.error;
    const code = String(err?.code ?? '');
    const msg = String(err?.message ?? '').toLowerCase();
    return (
      code.includes('429') &&
      (msg.includes('per day') || msg.includes('daily') || msg.includes('per_day'))
    );
  } catch {
    return false;
  }
}

async function callGemini(key: string, prompt: string): Promise<unknown> {
  const res = await fetch(`${API}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4000 },
    }),
  });
  return res.json();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'prompt wajib diisi' }, { status: 400 });
  }

  const keys = loadKeys();
  if (keys.length === 0) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY belum dikonfigurasi di server' },
      { status: 500 }
    );
  }

  let lastErr = 'unknown';
  for (let ki = 0; ki < keys.length; ki++) {
    const key = keys[ki];
    for (let att = 0; att < 3; att++) {
      try {
        const data = await callGemini(key, prompt);
        const d = data as {
          error?: { message?: string };
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        if (d.error) {
          lastErr = d.error.message || 'api error';
          if (isDailyQuota(data)) break; // rotate to next key
          await sleep(20000 * (att + 1)); // per-minute throttle: backoff & retry
          continue;
        }
        const text =
          d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
        if (!text) {
          lastErr = 'empty response';
          continue;
        }
        return NextResponse.json({ text });
      } catch (e) {
        lastErr = e instanceof Error ? e.message : 'fetch failed';
        await sleep(10000);
      }
    }
  }
  return NextResponse.json(
    { error: `Gemini gagal: ${lastErr}` },
    { status: 502 }
  );
}
