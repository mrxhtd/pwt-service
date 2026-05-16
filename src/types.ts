export type Status = 'Active' | 'Follow-up' | 'Inactive';

export type SystemType =
  | 'Cooling Tower'
  | 'Boiler System'
  | 'Closed Loop'
  | 'Swimming Pool'
  | 'RO System'
  | 'Other';

export type ParamKey =
  | 'ph'
  | 'tds'
  | 'conductivity'
  | 'totalHard'
  | 'calciumHard'
  | 'pAlka'
  | 'mAlka'
  | 'ohAlka'
  | 'chloride'
  | 'iron'
  | 'phosphate'
  | 'sulfite'
  | 'tannin'
  | 'chz'
  | 'deha'
  | 'silica';

export interface Param {
  key: ParamKey;
  label: string;
  unit: string;
  min: number;
  max: number;
}

export type ParamStatus = 'ok' | 'out' | 'empty';

export interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  systemType: SystemType;
  status: Status;
  lastVisit: string;
  nextVisit: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
}

export type StockMap = Record<string, Record<string, number>>;

export type Survey = {
  id: string;
  clientId: string;
  date: string;
  notes: string;
} & { [K in ParamKey]: number | '' };
