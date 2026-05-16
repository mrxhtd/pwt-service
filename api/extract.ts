import type { VercelRequest, VercelResponse } from '@vercel/node';

const PARAMS = [
  { key: 'ph',          label: 'pH',               unit: '',      min: 6.5, max: 8.5  },
  { key: 'tds',         label: 'TDS',              unit: 'ppm',   min: 0,   max: 500  },
  { key: 'conductivity',label: 'Conductivity',     unit: 'µS/cm', min: 0,   max: 1200 },
  { key: 'totalHard',   label: 'Total Hardness',   unit: 'ppm',   min: 0,   max: 300  },
  { key: 'calciumHard', label: 'Calcium Hardness', unit: 'ppm',   min: 0,   max: 200  },
  { key: 'pAlka',       label: 'P-Alkalinity',     unit: 'ppm',   min: 0,   max: 100  },
  { key: 'mAlka',       label: 'M-Alkalinity',     unit: 'ppm',   min: 80,  max: 300  },
  { key: 'ohAlka',      label: 'OH-Alkalinity',    unit: 'ppm',   min: 0,   max: 50   },
  { key: 'chloride',    label: 'Chloride',         unit: 'ppm',   min: 0,   max: 100  },
  { key: 'iron',        label: 'Iron',             unit: 'ppm',   min: 0,   max: 0.5  },
  { key: 'phosphate',   label: 'Phosphate',        unit: 'ppm',   min: 2,   max: 8    },
  { key: 'sulfite',     label: 'Sulfite',          unit: 'ppm',   min: 0,   max: 20   },
  { key: 'tannin',      label: 'Tannin',           unit: 'ppm',   min: 0,   max: 5    },
  { key: 'chz',         label: 'CHZ',              unit: 'ppm',   min: 8,   max: 20   },
  { key: 'deha',        label: 'DEHA',             unit: 'ppm',   min: 3,   max: 10   },
  { key: 'silica',      label: 'Silica',           unit: 'ppm',   min: 0,   max: 30   },
];

const SYSTEM_TYPES = ['Cooling Tower', 'Boiler System', 'Closed Loop', 'Swimming Pool', 'RO System', 'Other'];

const DEFAULT_MODEL = 'gemini-2.5-flash';

function surveyPrompt() {
  const paramList = PARAMS.map(
    (p) => `- ${p.key}: ${p.label}${p.unit ? ` (${p.unit})` : ''}, typical range ${p.min}–${p.max}`,
  ).join('\n');
  return [
    'You are reading a handwritten water-quality survey sheet from a field technician.',
    'Extract the numeric values for each parameter from the image.',
    'If a value is unreadable or not present return an empty string for that field.',
    'Return ONLY a JSON object — no commentary, no markdown.',
    '', 'Parameters:', paramList, '',
    'Also extract:',
    '- date: survey date as YYYY-MM-DD if visible, otherwise empty string',
    '- notes: any free-text notes on the sheet, otherwise empty string',
  ].join('\n');
}

function clientPrompt() {
  const paramList = PARAMS.map(
    (p) => `- ${p.key}: ${p.label}${p.unit ? ` (${p.unit})` : ''}, typical range ${p.min}–${p.max}`,
  ).join('\n');
  return [
    'You are reading a handwritten water-quality survey sheet from a field technician.',
    'Extract both the site header information AND the water quality readings.',
    '', 'Site fields:',
    '- name: company or site name',
    '- contact: contact person full name, or empty string',
    '- phone: phone number as written, or empty string',
    `- systemType: one of: ${SYSTEM_TYPES.map((s) => `"${s}"`).join(', ')}`,
    '- date: survey date as YYYY-MM-DD if visible, otherwise empty string',
    '- notes: any handwritten notes, otherwise empty string',
    '', 'Water quality parameters (numeric as string, empty string if not present):', paramList,
    '', 'Return ONLY a JSON object — no commentary, no markdown.',
  ].join('\n');
}

function surveySchema() {
  const props: Record<string, object> = {
    date:  { type: 'string' },
    notes: { type: 'string' },
  };
  for (const p of PARAMS) props[p.key] = { type: 'string' };
  return { type: 'object', properties: props, required: ['date', 'notes', ...PARAMS.map((p) => p.key)] };
}

function clientSchema() {
  const props: Record<string, object> = {
    name: { type: 'string' }, contact: { type: 'string' },
    phone: { type: 'string' }, systemType: { type: 'string' },
    date: { type: 'string' }, notes: { type: 'string' },
  };
  for (const p of PARAMS) props[p.key] = { type: 'string' };
  return { type: 'object', properties: props, required: ['name', 'contact', 'phone', 'systemType', 'date', 'notes', ...PARAMS.map((p) => p.key)] };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });

  const { type, base64, mimeType, model: clientModel } = req.body as {
    type: 'survey' | 'client';
    base64: string;
    mimeType: string;
    model?: string;
  };

  if (!base64 || !mimeType || !type) {
    return res.status(400).json({ error: 'Missing required fields: type, base64, mimeType' });
  }

  const model = clientModel || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ parts: [
      { text: type === 'survey' ? surveyPrompt() : clientPrompt() },
      { inline_data: { mime_type: mimeType, data: base64 } },
    ]}],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: type === 'survey' ? surveySchema() : clientSchema(),
      temperature: 0,
    },
  };

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await geminiRes.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    if (!geminiRes.ok) return res.status(502).json({ error: data.error?.message || `Gemini error ${geminiRes.status}` });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(502).json({ error: 'No content returned from Gemini' });
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
