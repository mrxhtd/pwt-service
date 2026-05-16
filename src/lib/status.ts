import type { ParamStatus } from '../types';

export function getStatus(val: number | string | '' | null | undefined, min: number, max: number): ParamStatus {
  if (val === '' || val === null || val === undefined) return 'empty';
  const n = typeof val === 'number' ? val : parseFloat(val);
  if (Number.isNaN(n)) return 'empty';
  if (n < min || n > max) return 'out';
  return 'ok';
}
