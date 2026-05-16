import { supabase } from './supabase';
import type { Client, ParamKey, Product, StockMap, Survey } from '../types';

// ── Column mapping: camelCase ↔ snake_case ──────────────────────────────────

const PARAM_TO_COL: Record<ParamKey, string> = {
  ph: 'ph', tds: 'tds', conductivity: 'conductivity',
  totalHard: 'total_hard', calciumHard: 'calcium_hard',
  pAlka: 'p_alka', mAlka: 'm_alka', ohAlka: 'oh_alka',
  chloride: 'chloride', iron: 'iron', phosphate: 'phosphate',
  sulfite: 'sulfite', tannin: 'tannin', chz: 'chz', deha: 'deha', silica: 'silica',
  muPH: 'mu_ph', muTDS: 'mu_tds', muConductivity: 'mu_conductivity',
  muTotalHard: 'mu_total_hard', muCalciumHard: 'mu_calcium_hard',
  muMAlka: 'mu_m_alka', muChloride: 'mu_chloride', muIron: 'mu_iron',
  fwPH: 'fw_ph', fwTDS: 'fw_tds', fwConductivity: 'fw_conductivity',
  fwTotalHard: 'fw_total_hard', fwCalciumHard: 'fw_calcium_hard',
  fwMAlka: 'fw_m_alka', fwChloride: 'fw_chloride', fwIron: 'fw_iron',
};

const COL_TO_PARAM: Record<string, ParamKey> = Object.fromEntries(
  Object.entries(PARAM_TO_COL).map(([k, v]) => [v, k as ParamKey])
) as Record<string, ParamKey>;

// ── Conversion helpers ──────────────────────────────────────────────────────

function clientFromDb(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    contact: row.contact as string,
    phone: row.phone as string,
    systemType: row.system_type as Client['systemType'],
    status: row.status as Client['status'],
    lastVisit: (row.last_visit as string) || '',
    nextVisit: (row.next_visit as string) || '',
    avgDailyConsumption: row.avg_daily_consumption as number | undefined,
    deliveryLeadTime: row.delivery_lead_time as number | undefined,
    currentStock: row.current_stock as number | undefined,
    lat: row.location ? (row.location as { coordinates: number[] }).coordinates?.[1] ?? null : null,
    lng: row.location ? (row.location as { coordinates: number[] }).coordinates?.[0] ?? null : null,
  };
}

function clientToDb(c: Client): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: c.id,
    name: c.name,
    contact: c.contact,
    phone: c.phone,
    system_type: c.systemType,
    status: c.status,
    last_visit: c.lastVisit,
    next_visit: c.nextVisit,
    avg_daily_consumption: c.avgDailyConsumption ?? 0,
    delivery_lead_time: c.deliveryLeadTime ?? 3,
    current_stock: c.currentStock ?? 0,
  };
  if (c.lat != null && c.lng != null) {
    row.location = `SRID=4326;POINT(${c.lng} ${c.lat})`;
  }
  return row;
}

function surveyFromDb(row: Record<string, unknown>): Survey {
  const s: Survey = {
    id: row.id as string,
    clientId: row.client_id as string,
    date: row.date as string,
    notes: (row.notes as string) || '',
  };
  for (const [col, key] of Object.entries(COL_TO_PARAM)) {
    const val = row[col];
    (s as Record<string, unknown>)[key] = val != null ? Number(val) : '';
  }
  return s;
}

function surveyToDb(s: Survey): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: s.id,
    client_id: s.clientId,
    date: s.date,
    notes: s.notes,
  };
  for (const [key, col] of Object.entries(PARAM_TO_COL)) {
    const val = (s as Record<string, unknown>)[key];
    row[col] = val === '' || val == null ? null : Number(val);
  }
  return row;
}

// ── CRUD operations ─────────────────────────────────────────────────────────

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(clientFromDb);
}

export async function upsertClient(client: Client): Promise<void> {
  const { error } = await supabase.from('clients').upsert(clientToDb(client));
  if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase.from('surveys').select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(surveyFromDb);
}

export async function upsertSurvey(survey: Survey): Promise<void> {
  const { error } = await supabase.from('surveys').upsert(surveyToDb(survey));
  if (error) throw error;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name, unit: r.unit }));
}

export async function fetchStocks(): Promise<StockMap> {
  const { data, error } = await supabase.from('stocks').select('*');
  if (error) throw error;
  const map: StockMap = {};
  for (const row of data ?? []) {
    if (!map[row.client_id]) map[row.client_id] = {};
    map[row.client_id][row.product_id] = Number(row.level);
  }
  return map;
}

export async function upsertStock(clientId: string, productId: string, level: number): Promise<void> {
  const { error } = await supabase.from('stocks').upsert({ client_id: clientId, product_id: productId, level });
  if (error) throw error;
}
