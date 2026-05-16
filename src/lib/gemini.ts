import type { ParamKey } from '../types';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export type ExtractedSurvey = {
  date: string;
  notes: string;
} & { [K in ParamKey]: number | '' };

export type ExtractedClient = {
  name: string;
  contact: string;
  phone: string;
  systemType: string;
  date: string;
  notes: string;
} & { [K in ParamKey]: number | '' };

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') { reject(new Error('Unexpected reader result')); return; }
      const commaIdx = result.indexOf(',');
      const header = result.slice(0, commaIdx);
      const base64 = result.slice(commaIdx + 1);
      const mimeMatch = header.match(/data:([^;]+);/);
      resolve({ base64, mimeType: mimeMatch?.[1] ?? file.type ?? 'image/jpeg' });
    };
    reader.readAsDataURL(file);
  });
}

async function callExtractAPI(
  type: 'survey' | 'client',
  file: File,
  opts: { model?: string; signal?: AbortSignal },
): Promise<Record<string, unknown>> {
  const { base64, mimeType } = await fileToBase64(file);
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, base64, mimeType, model: opts.model }),
    signal: opts.signal,
  });
  const data = await res.json() as Record<string, unknown> & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
  return data;
}

import { PARAMS } from '../constants';

export async function extractSurveyFromImage(
  file: File,
  opts: { model?: string; signal?: AbortSignal },
): Promise<ExtractedSurvey> {
  const parsed = await callExtractAPI('survey', file, opts);
  const out: ExtractedSurvey = {
    date:  typeof parsed.date  === 'string' ? parsed.date  : '',
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

export async function extractClientFromImage(
  file: File,
  opts: { model?: string; signal?: AbortSignal },
): Promise<ExtractedClient> {
  const parsed = await callExtractAPI('client', file, opts);
  const out: ExtractedClient = {
    name:       typeof parsed.name       === 'string' ? parsed.name       : '',
    contact:    typeof parsed.contact    === 'string' ? parsed.contact    : '',
    phone:      typeof parsed.phone      === 'string' ? parsed.phone      : '',
    systemType: typeof parsed.systemType === 'string' ? parsed.systemType : 'Other',
    date:       typeof parsed.date       === 'string' ? parsed.date       : '',
    notes:      typeof parsed.notes      === 'string' ? parsed.notes      : '',
  } as ExtractedClient;
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
