import type { Client, Param, Status, Survey, SystemType } from './types';

export const ACCENT = '#0ea5e9';

export const PARAMS: Param[] = [
  { key: 'ph',          label: 'pH',              unit: '',      min: 6.5, max: 8.5  },
  { key: 'tds',         label: 'TDS',             unit: 'ppm',   min: 0,   max: 500  },
  { key: 'conductivity',label: 'Conductivity',    unit: 'µS/cm', min: 0,   max: 1200 },
  { key: 'totalHard',   label: 'Total Hardness',  unit: 'ppm',   min: 0,   max: 300  },
  { key: 'calciumHard', label: 'Calcium Hardness',unit: 'ppm',   min: 0,   max: 200  },
  { key: 'pAlka',       label: 'P-Alkalinity',    unit: 'ppm',   min: 0,   max: 100  },
  { key: 'mAlka',       label: 'M-Alkalinity',    unit: 'ppm',   min: 80,  max: 300  },
  { key: 'ohAlka',      label: 'OH-Alkalinity',   unit: 'ppm',   min: 0,   max: 50   },
  { key: 'chloride',    label: 'Chloride',        unit: 'ppm',   min: 0,   max: 100  },
  { key: 'iron',        label: 'Iron',            unit: 'ppm',   min: 0,   max: 0.5  },
  { key: 'phosphate',   label: 'Phosphate',       unit: 'ppm',   min: 2,   max: 8    },
  { key: 'sulfite',     label: 'Sulfite',         unit: 'ppm',   min: 0,   max: 20   },
  { key: 'tannin',      label: 'Tannin',          unit: 'ppm',   min: 0,   max: 5    },
  { key: 'chz',         label: 'CHZ',             unit: 'ppm',   min: 8,   max: 20   },
  { key: 'deha',        label: 'DEHA',            unit: 'ppm',   min: 3,   max: 10   },
  { key: 'silica',      label: 'Silica',          unit: 'ppm',   min: 0,   max: 30   },
];

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

export const SEED_CLIENTS: Client[] = [
  { id: 'CLT-001', name: 'Al-Nour Factory', contact: 'Ahmed Hassan', phone: '010-1234-5678', systemType: 'Cooling Tower', gallons: 50000, status: 'Active',    lastVisit: '2026-04-15', nextVisit: '2026-05-20' },
  { id: 'CLT-002', name: 'Blue Sky Hotels', contact: 'Sara Mahmoud', phone: '012-9876-5432', systemType: 'Boiler System', gallons: 15000, status: 'Active',    lastVisit: '2026-04-28', nextVisit: '2026-05-30' },
  { id: 'CLT-003', name: 'Delta Steel',     contact: 'Karim Fathy',  phone: '011-5555-0000', systemType: 'Closed Loop',   gallons: 80000, status: 'Follow-up', lastVisit: '2026-03-10', nextVisit: '2026-05-18' },
  { id: 'CLT-004', name: 'Oasis Resort',    contact: 'Nadia Aly',    phone: '010-2222-3333', systemType: 'Swimming Pool', gallons: 12000, status: 'Active',    lastVisit: '2026-05-01', nextVisit: '2026-06-01' },
  { id: 'CLT-005', name: 'Cairo Pharma',    contact: 'Dr. Youssef',  phone: '010-8888-7777', systemType: 'RO System',     gallons: 8000,  status: 'Inactive',  lastVisit: '2026-02-20', nextVisit: '2026-05-25' },
];

export const SEED_SURVEYS: Survey[] = [
  { id: 'SRV-001', clientId: 'CLT-001', date: '2026-04-15', gallons: 50000, ph: 7.2, tds: 320, conductivity: 680, totalHard: 250, calciumHard: 95,  pAlka: 45, mAlka: 180, ohAlka: 0, chloride: 85,  iron: 0.3, phosphate: 3.5, sulfite: 12, tannin: 0.2, chz: 12, deha: 5, silica: 18, notes: 'Slight pH drift.' },
  { id: 'SRV-002', clientId: 'CLT-002', date: '2026-04-28', gallons: 15000, ph: 7.8, tds: 210, conductivity: 450, totalHard: 180, calciumHard: 70,  pAlka: 30, mAlka: 120, ohAlka: 0, chloride: 60,  iron: 0.1, phosphate: 2.1, sulfite: 8,  tannin: 0.1, chz: 8,  deha: 3, silica: 12, notes: 'Within range.' },
  { id: 'SRV-003', clientId: 'CLT-003', date: '2026-03-10', gallons: 80000, ph: 6.9, tds: 410, conductivity: 890, totalHard: 310, calciumHard: 120, pAlka: 55, mAlka: 220, ohAlka: 0, chloride: 110, iron: 0.5, phosphate: 5.0, sulfite: 15, tannin: 0.4, chz: 15, deha: 7, silica: 25, notes: 'High hardness. Dosing increased.' },
];
