import type { Client, Param, Product, Status, StockMap, Survey, SystemType } from './types';

export const ACCENT = '#0ea5e9';

export const PARAMS: Param[] = [
  // ── System / Circulating water ─────────────────────────────────────────────
  { key: 'ph',          label: 'pH',              unit: '',      min: 10.5, max: 12,    group: 'system' },
  { key: 'tds',         label: 'TDS',             unit: 'ppm',   min: 0,    max: 3500,  group: 'system' },
  { key: 'conductivity',label: 'Conductivity',    unit: 'µS/cm', min: 0,    max: 7000,  group: 'system' },
  { key: 'totalHard',   label: 'Total Hardness',  unit: 'ppm',   min: 0,    max: 5,     group: 'system' },
  { key: 'calciumHard', label: 'Calcium Hardness',unit: 'ppm',   min: 0,    max: 2,     group: 'system' },
  { key: 'pAlka',       label: 'P-Alkalinity',    unit: 'ppm',   min: 0,    max: 700,   group: 'system' },
  { key: 'mAlka',       label: 'M-Alkalinity',    unit: 'ppm',   min: 0,    max: 1000,  group: 'system' },
  { key: 'ohAlka',      label: 'OH-Alkalinity',   unit: 'ppm',   min: 350,  max: 500,   group: 'system' },
  { key: 'chloride',    label: 'Chloride',        unit: 'ppm',   min: 0,    max: 800,   group: 'system' },
  { key: 'iron',        label: 'Iron',            unit: 'ppm',   min: 0,    max: 0.5,   group: 'system' },
  { key: 'phosphate',   label: 'Phosphate',       unit: 'ppm',   min: 30,   max: 60,    group: 'system' },
  { key: 'sulfite',     label: 'Sulfite',         unit: 'ppm',   min: 30,   max: 70,    group: 'system' },
  { key: 'tannin',      label: 'Tannin',          unit: 'ppm',   min: 120,  max: 160,   group: 'system' },
  { key: 'chz',         label: 'CHZ',             unit: 'ppm',   min: 50,   max: 100,   group: 'system' },
  { key: 'deha',        label: 'DEHA',            unit: 'ppm',   min: 100,  max: 500,   group: 'system' },
  { key: 'silica',      label: 'Silica',          unit: 'ppm',   min: 0,    max: 30,    group: 'system' },
  // ── Make-up water ──────────────────────────────────────────────────────────
  { key: 'muPH',          label: 'pH',              unit: '',      min: 6.5, max: 8.5,  group: 'makeup' },
  { key: 'muTDS',         label: 'TDS',             unit: 'ppm',   min: 0,   max: 500,  group: 'makeup' },
  { key: 'muConductivity',label: 'Conductivity',    unit: 'µS/cm', min: 0,   max: 1200, group: 'makeup' },
  { key: 'muTotalHard',   label: 'Total Hardness',  unit: 'ppm',   min: 0,   max: 300,  group: 'makeup' },
  { key: 'muCalciumHard', label: 'Calcium Hardness',unit: 'ppm',   min: 0,   max: 200,  group: 'makeup' },
  { key: 'muMAlka',       label: 'M-Alkalinity',    unit: 'ppm',   min: 80,  max: 300,  group: 'makeup' },
  { key: 'muChloride',    label: 'Chloride',        unit: 'ppm',   min: 0,   max: 100,  group: 'makeup' },
  { key: 'muIron',        label: 'Iron',            unit: 'ppm',   min: 0,   max: 0.5,  group: 'makeup' },
  // ── Feed water ─────────────────────────────────────────────────────────────
  { key: 'fwPH',          label: 'pH',              unit: '',      min: 6.5, max: 8.5,  group: 'feedwater' },
  { key: 'fwTDS',         label: 'TDS',             unit: 'ppm',   min: 0,   max: 500,  group: 'feedwater' },
  { key: 'fwConductivity',label: 'Conductivity',    unit: 'µS/cm', min: 0,   max: 1200, group: 'feedwater' },
  { key: 'fwTotalHard',   label: 'Total Hardness',  unit: 'ppm',   min: 0,   max: 300,  group: 'feedwater' },
  { key: 'fwCalciumHard', label: 'Calcium Hardness',unit: 'ppm',   min: 0,   max: 200,  group: 'feedwater' },
  { key: 'fwMAlka',       label: 'M-Alkalinity',    unit: 'ppm',   min: 80,  max: 300,  group: 'feedwater' },
  { key: 'fwChloride',    label: 'Chloride',        unit: 'ppm',   min: 0,   max: 100,  group: 'feedwater' },
  { key: 'fwIron',        label: 'Iron',            unit: 'ppm',   min: 0,   max: 0.5,  group: 'feedwater' },
];

export const PARAM_GROUP_LABELS: Record<string, string> = {
  system:    '🔵 System Water',
  makeup:    '🟡 Make-up Water',
  feedwater: '🟢 Feed Water',
};

export const STATUS_COLORS: Record<Status, { bg: string; text: string; dot: string }> = {
  'Active':    { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  'Follow-up': { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  'Inactive':  { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

export const SYSTEM_TYPES: SystemType[] = [
  'Cooling Tower',
  'Boiler System',
  'Closed Loop',
  'Swimming Pool',
  'RO System',
  'Other',
];

export const STATUSES: Status[] = ['Active', 'Follow-up', 'Inactive'];

export const SEED_PRODUCTS: Product[] = [
  { id: 'PRD-001', name: 'Corrosion Inhibitor', unit: 'ton' },
  { id: 'PRD-002', name: 'Scale Inhibitor',     unit: 'ton' },
  { id: 'PRD-003', name: 'Biocide',             unit: 'ton' },
  { id: 'PRD-004', name: 'Oxygen Scavenger',    unit: 'ton' },
  { id: 'PRD-005', name: 'pH Adjuster',         unit: 'ton' },
];

export const SEED_CLIENTS: Client[] = [
  { id: 'CLT-001', name: 'Al-Nour Factory', contact: 'Ahmed Hassan', phone: '010-1234-5678', systemType: 'Cooling Tower', status: 'Active',    lastVisit: '2026-04-15', nextVisit: '2026-05-20' },
  { id: 'CLT-002', name: 'Blue Sky Hotels', contact: 'Sara Mahmoud', phone: '012-9876-5432', systemType: 'Boiler System', status: 'Active',    lastVisit: '2026-04-28', nextVisit: '2026-05-30' },
  { id: 'CLT-003', name: 'Delta Steel',     contact: 'Karim Fathy',  phone: '011-5555-0000', systemType: 'Closed Loop',   status: 'Follow-up', lastVisit: '2026-03-10', nextVisit: '2026-05-18' },
  { id: 'CLT-004', name: 'Oasis Resort',    contact: 'Nadia Aly',    phone: '010-2222-3333', systemType: 'Swimming Pool', status: 'Active',    lastVisit: '2026-05-01', nextVisit: '2026-06-01' },
  { id: 'CLT-005', name: 'Cairo Pharma',    contact: 'Dr. Youssef',  phone: '010-8888-7777', systemType: 'RO System',     status: 'Inactive',  lastVisit: '2026-02-20', nextVisit: '2026-05-25' },
];

export const SEED_STOCKS: StockMap = {
  'CLT-001': { 'PRD-001': 120, 'PRD-002': 45,  'PRD-003': 30,  'PRD-004': 60,  'PRD-005': 15 },
  'CLT-002': { 'PRD-001': 50,  'PRD-002': 20,  'PRD-003': 15,  'PRD-004': 25,  'PRD-005': 8  },
  'CLT-003': { 'PRD-001': 200, 'PRD-002': 80,  'PRD-003': 60,  'PRD-004': 90,  'PRD-005': 25 },
  'CLT-004': { 'PRD-001': 35,  'PRD-002': 18,  'PRD-003': 12,  'PRD-004': 20,  'PRD-005': 5  },
  'CLT-005': { 'PRD-001': 0,   'PRD-002': 0,   'PRD-003': 0,   'PRD-004': 0,   'PRD-005': 0  },
};

export const SEED_SURVEYS: Survey[] = [
  { id: 'SRV-001', clientId: 'CLT-001', date: '2026-04-15', ph: 7.2, tds: 320, conductivity: 680, totalHard: 250, calciumHard: 95,  pAlka: 45, mAlka: 180, ohAlka: 0, chloride: 85,  iron: 0.3, phosphate: 3.5, sulfite: 12, tannin: 0.2, chz: 12, deha: 5, silica: 18, notes: 'Slight pH drift.' },
  { id: 'SRV-004', clientId: 'CLT-001', date: '2026-03-18', ph: 7.5, tds: 295, conductivity: 640, totalHard: 230, calciumHard: 88,  pAlka: 40, mAlka: 165, ohAlka: 0, chloride: 78,  iron: 0.4, phosphate: 4.2, sulfite: 10, tannin: 0.3, chz: 14, deha: 6, silica: 15, notes: 'Baseline reading.' },
  { id: 'SRV-002', clientId: 'CLT-002', date: '2026-04-28', ph: 7.8, tds: 210, conductivity: 450, totalHard: 180, calciumHard: 70,  pAlka: 30, mAlka: 120, ohAlka: 0, chloride: 60,  iron: 0.1, phosphate: 2.1, sulfite: 8,  tannin: 0.1, chz: 8,  deha: 3, silica: 12, notes: 'Within range.' },
  { id: 'SRV-003', clientId: 'CLT-003', date: '2026-03-10', ph: 6.9, tds: 410, conductivity: 890, totalHard: 310, calciumHard: 120, pAlka: 55, mAlka: 220, ohAlka: 0, chloride: 110, iron: 0.5, phosphate: 5.0, sulfite: 15, tannin: 0.4, chz: 15, deha: 7, silica: 25, notes: 'High hardness. Dosing increased.' },
];

export const STORAGE_KEYS = {
  clients:  'aquatrack:v1:clients',
  surveys:  'aquatrack:v1:surveys',
  products: 'aquatrack:v1:products',
  stocks:   'aquatrack:v1:stocks',
  apiKey:   'aquatrack:v1:gemini-api-key',
  model:    'aquatrack:v1:gemini-model',
} as const;
