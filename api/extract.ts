import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PARAMS = [
  { key: 'ph',          label: 'pH',               unit: '',      min: 10.5, max: 12    },
  { key: 'tds',         label: 'TDS',              unit: 'ppm',   min: 0,    max: 3500, desc: 'TDS meaning Total Dissolved Solids, measured in ppm. This is NOT the same as conductivity. TDS is typically a larger number than conductivity on the sheet. Range 0–3500 ppm' },
  { key: 'conductivity',label: 'Conductivity',     unit: 'µS/cm', min: 0,    max: 7000, desc: 'Electrical conductivity measured in µS/cm or mS/cm. This is NOT the same as TDS. Look specifically for the label "Conductivity" or "EC" on the sheet. Range 0–7000 µS/cm' },
  { key: 'totalHard',   label: 'Total Hardness',   unit: 'ppm',   min: 0,    max: 5    },
  { key: 'calciumHard', label: 'Calcium Hardness', unit: 'ppm',   min: 0,    max: 2    },
  { key: 'pAlka',       label: 'P-Alkalinity',     unit: 'ppm',   min: 0,    max: 700  },
  { key: 'mAlka',       label: 'M-Alkalinity',     unit: 'ppm',   min: 0,    max: 1000 },
  { key: 'ohAlka',      label: 'OH-Alkalinity',    unit: 'ppm',   min: 350,  max: 500  },
  { key: 'chloride',    label: 'Chloride',         unit: 'ppm',   min: 0,    max: 800  },
  { key: 'iron',        label: 'Iron',             unit: 'ppm',   min: 0,    max: 0.5  },
  { key: 'phosphate',   label: 'Phosphate',        unit: 'ppm',   min: 30,   max: 60   },
  { key: 'sulfite',     label: 'Sulfite',          unit: 'ppm',   min: 30,   max: 70   },
  { key: 'tannin',      label: 'Tannin',           unit: 'ppm',   min: 120,  max: 160  },
  { key: 'chz',         label: 'CHZ',              unit: 'ppm',   min: 50,   max: 100  },
  { key: 'deha',        label: 'DEHA',             unit: 'ppm',   min: 100,  max: 500  },
  { key: 'silica',      label: 'Silica',           unit: 'ppm',   min: 0,    max: 30   },
];

const WATER_PARAMS = [
  { key: 'pH',              label: 'pH',               unit: ''      },
  { key: 'tds',             label: 'TDS',              unit: 'ppm'   },
  { key: 'conductivity',    label: 'Conductivity',     unit: 'µS/cm' },
  { key: 'totalHardness',   label: 'Total Hardness',   unit: 'ppm'   },
  { key: 'calciumHardness', label: 'Calcium Hardness', unit: 'ppm'   },
  { key: 'mAlkalinity',     label: 'M-Alkalinity',     unit: 'ppm'   },
  { key: 'chloride',        label: 'Chloride',         unit: 'ppm'   },
  { key: 'iron',            label: 'Iron',             unit: 'ppm'   },
];

const SYSTEM_TYPES = ['Cooling Tower', 'Boiler System', 'Closed Loop', 'Swimming Pool', 'RO System', 'Other'];
const DEFAULT_MODEL = 'gemini-2.5-flash';

// ─── Prompts ─────────────────────────────────────────────────────────────────

function sysParamLine(p: typeof SYSTEM_PARAMS[number]) {
  if (p.desc) return `- ${p.key}: ${p.desc}`;
  return `- ${p.key}: ${p.label}${p.unit ? ` (${p.unit})` : ''}, range ${p.min}–${p.max}`;
}

const TDS_CONDUCTIVITY_WARNING = 'IMPORTANT: Do NOT confuse TDS (ppm) with Conductivity (µS/cm or mS/cm). They are always separate labeled fields on the sheet. If you are uncertain which value belongs to which field, leave both as empty strings rather than guessing.';

function surveyPrompt() {
  const sysParams = SYSTEM_PARAMS.map(sysParamLine).join('\n');
  const waterParams = WATER_PARAMS.map((p) => `- ${p.key}: ${p.label}${p.unit ? ` (${p.unit})` : ''}`).join('\n');

  return [
    'You are reading a handwritten water-quality survey sheet from a field technician.',
    'The sheet typically has THREE columns of readings:',
    '  1. System/Circulating water (the treated water in the system)',
    '  2. Make-up water (raw incoming water, also called "Make Up" or "Makeup")',
    '  3. Feed water (pre-treated water entering the system, also called "Feed")',
    '',
    TDS_CONDUCTIVITY_WARNING,
    '',
    'Extract ALL columns. If a column is absent or a cell is unreadable, return an empty string for that field.',
    'Return ONLY a JSON object — no commentary, no markdown.',
    '',
    '── System/Circulating water fields (prefix: none) ──',
    sysParams,
    '',
    '── Make-up water fields (prefix: mu) ──',
    waterParams.replace(/- /g, '- mu'),
    '',
    '── Feed water fields (prefix: fw) ──',
    waterParams.replace(/- /g, '- fw'),
    '',
    'Also extract:',
    '- date: survey date as YYYY-MM-DD if visible, otherwise empty string',
    '- notes: any handwritten notes, otherwise empty string',
  ].join('\n');
}

function clientPrompt() {
  const sysParams = SYSTEM_PARAMS.map(sysParamLine).join('\n');
  const waterParams = WATER_PARAMS.map((p) => `- ${p.key}: ${p.label}${p.unit ? ` (${p.unit})` : ''}`).join('\n');

  return [
    'You are reading a handwritten water-quality survey sheet from a field technician.',
    'Extract the site header information AND all water quality readings.',
    'The sheet typically has THREE columns: System/Circulating, Make-up, and Feed water.',
    '',
    TDS_CONDUCTIVITY_WARNING,
    '',
    'Site fields:',
    '- name: company or site name',
    '- contact: contact person full name, or empty string',
    '- phone: phone number as written, or empty string',
    `- systemType: one of: ${SYSTEM_TYPES.map((s) => `"${s}"`).join(', ')}`,
    '- date: survey date as YYYY-MM-DD if visible, otherwise empty string',
    '- notes: any handwritten notes, otherwise empty string',
    '',
    '── System/Circulating water (prefix: none) ──',
    sysParams,
    '',
    '── Make-up water (prefix: mu) ──',
    waterParams.replace(/- /g, '- mu'),
    '',
    '── Feed water (prefix: fw) ──',
    waterParams.replace(/- /g, '- fw'),
    '',
    'Return ONLY a JSON object — no commentary, no markdown.',
  ].join('\n');
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

function surveySchema() {
  const props: Record<string, object> = { date: { type: 'string' }, notes: { type: 'string' } };
  for (const p of SYSTEM_PARAMS) props[p.key] = { type: 'string' };
  for (const p of WATER_PARAMS) {
    props[`mu${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`] = { type: 'string' };
    props[`fw${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`] = { type: 'string' };
  }
  return {
    type: 'object', properties: props,
    required: ['date', 'notes', ...SYSTEM_PARAMS.map((p) => p.key),
      ...WATER_PARAMS.map((p) => `mu${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`),
      ...WATER_PARAMS.map((p) => `fw${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`),
    ],
  };
}

function clientSchema() {
  const props: Record<string, object> = {
    name: { type: 'string' }, contact: { type: 'string' },
    phone: { type: 'string' }, systemType: { type: 'string' },
    date: { type: 'string' }, notes: { type: 'string' },
  };
  for (const p of SYSTEM_PARAMS) props[p.key] = { type: 'string' };
  for (const p of WATER_PARAMS) {
    props[`mu${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`] = { type: 'string' };
    props[`fw${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`] = { type: 'string' };
  }
  return {
    type: 'object', properties: props,
    required: ['name', 'contact', 'phone', 'systemType', 'date', 'notes',
      ...SYSTEM_PARAMS.map((p) => p.key),
      ...WATER_PARAMS.map((p) => `mu${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`),
      ...WATER_PARAMS.map((p) => `fw${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`),
    ],
  };
}

// Map API response keys → our ParamKey names
const KEY_MAP: Record<string, string> = {
  muPH: 'muPH', muTds: 'muTDS', muConductivity: 'muConductivity',
  muTotalHardness: 'muTotalHard', muCalciumHardness: 'muCalciumHard',
  muMAlkalinity: 'muMAlka', muChloride: 'muChloride', muIron: 'muIron',
  fwPH: 'fwPH', fwTds: 'fwTDS', fwConductivity: 'fwConductivity',
  fwTotalHardness: 'fwTotalHard', fwCalciumHardness: 'fwCalciumHard',
  fwMAlkalinity: 'fwMAlka', fwChloride: 'fwChloride', fwIron: 'fwIron',
};

function normaliseKeys(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[KEY_MAP[k] ?? k] = v;
  }
  return out;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });

  const { type, base64, mimeType, model: clientModel } = req.body as {
    type: 'survey' | 'client'; base64: string; mimeType: string; model?: string;
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
    const data = await geminiRes.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (!geminiRes.ok) return res.status(502).json({ error: data.error?.message || `Gemini error ${geminiRes.status}` });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(502).json({ error: 'No content returned from Gemini' });
    return res.status(200).json(normaliseKeys(JSON.parse(text) as Record<string, unknown>));
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
