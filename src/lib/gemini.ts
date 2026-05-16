import { PARAMS } from '../constants';
import type { ParamKey } from '../types';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export type ExtractedSurvey = {
  date: string;
  notes: string;
} & { [K in ParamKey]: number | '' };

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unexpected reader result'));
        return;
      }
      const commaIdx = result.indexOf(',');
      const header = result.slice(0, commaIdx);
      const base64 = result.slice(commaIdx + 1);
      const mimeMatch = header.match(/data:([^;]+);/);
      resolve({ base64, mimeType: mimeMatch?.[1] ?? file.type ?? 'image/jpeg' });
    };
    reader.readAsDataURL(file);
  });
}

function buildPrompt(): string {
  const paramList = PARAMS.map(
    (p) => `- ${p.key}: ${p.label}${p.unit ? ` (${p.unit})` : ''}, typical range ${p.min}–${p.max}`,
  ).join('\n');

  return [
    'You are reading a handwritten water-quality survey sheet from a field technician.',
    'Extract the numeric values for each of the following parameters from the image.',
    'If a value is unreadable or not present, return an empty string for that field.',
    'Return ONLY a JSON object matching the requested schema — no commentary, no markdown.',
    '',
    'Parameters:',
    paramList,
    '',
    'Also extract:',
    '- date: the survey date in ISO format (YYYY-MM-DD) if visible, otherwise empty string',
    '- notes: any free-text notes written on the sheet, otherwise empty string',
  ].join('\n');
}

function buildResponseSchema() {
  const properties: Record<string, { type: string; description?: string }> = {
    date:  { type: 'string', description: 'ISO date YYYY-MM-DD or empty string' },
    notes: { type: 'string', description: 'Free-text notes or empty string' },
  };
  for (const p of PARAMS) {
    properties[p.key] = {
      type: 'string',
      description: `${p.label}${p.unit ? ' in ' + p.unit : ''}; numeric as string, or empty string if unreadable`,
    };
  }
  return {
    type: 'object',
    properties,
    required: ['date', 'notes', ...PARAMS.map((p) => p.key)],
  };
}

export async function extractSurveyFromImage(
  file: File,
  opts: { apiKey: string; model?: string; signal?: AbortSignal },
): Promise<ExtractedSurvey> {
  const model = opts.model || DEFAULT_GEMINI_MODEL;
  const { base64, mimeType } = await fileToBase64(file);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const body = {
    contents: [
      {
        parts: [
          { text: buildPrompt() },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: buildResponseSchema(),
      temperature: 0,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  const data: GeminiResponse = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini request failed (${res.status})`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini');

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error('Gemini returned non-JSON output');
  }

  const out: ExtractedSurvey = {
    date: typeof parsed.date === 'string' ? parsed.date : '',
    notes: typeof parsed.notes === 'string' ? parsed.notes : '',
  } as ExtractedSurvey;

  for (const p of PARAMS) {
    const raw = parsed[p.key];
    if (raw === '' || raw === null || raw === undefined) {
      (out as Record<string, number | ''>)[p.key] = '';
    } else {
      const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
      (out as Record<string, number | ''>)[p.key] = Number.isFinite(n) ? n : '';
    }
  }
  return out;
}
