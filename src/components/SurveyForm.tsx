import { ACCENT, PARAMS } from '../constants';
import { getStatus } from '../lib/status';
import type { Client, ParamKey } from '../types';
import { Input } from './Input';
import { Select } from './Select';

export type SurveyDraft = {
  id: string;
  clientId: string;
  date: string;
  gallons: string;
  notes: string;
} & { [K in ParamKey]: string };

interface SurveyFormProps {
  draft: SurveyDraft;
  onChange: (draft: SurveyDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  clients: Client[];
  surveyClient: Client | null;
}

export function SurveyForm({ draft, onChange, onSave, onCancel, clients, surveyClient }: SurveyFormProps) {
  const set = <K extends keyof SurveyDraft>(key: K, value: SurveyDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>
        New Survey {surveyClient ? `— ${surveyClient.name}` : ''}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
        <Select label="Client" value={draft.clientId} onChange={(v) => set('clientId', v)} options={clients.map((c) => c.id)} />
        <Input label="Date" type="date" value={draft.date} onChange={(v) => set('date', v)} />
        <Input label="Gallons on Stock" type="number" value={draft.gallons} onChange={(v) => set('gallons', v)} />
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Water Quality Parameters</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
          {PARAMS.map((p) => {
            const val = draft[p.key];
            const st = getStatus(val, p.min, p.max);
            const borderColor = st === 'out' ? '#ef4444' : st === 'ok' ? '#10b981' : '#e2e8f0';
            const bg = st === 'out' ? '#fef2f2' : st === 'ok' ? '#f0fdf4' : '#fff';
            return (
              <div key={p.key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {p.label} {p.unit && <span style={{ color: '#94a3b8' }}>({p.unit})</span>}
                </label>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => set(p.key, e.target.value)}
                  placeholder={`${p.min}–${p.max}`}
                  style={{ border: `1.5px solid ${borderColor}`, borderRadius: 7, padding: '6px 8px', fontSize: 13, color: '#1e293b', outline: 'none', background: bg }}
                />
                {st === 'out' && <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 600 }}>Out of range</span>}
              </div>
            );
          })}
        </div>
      </div>

      <Input label="Notes" value={draft.notes} onChange={(v) => set('notes', v)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={onSave} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Save Survey</button>
        <button onClick={onCancel} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}
