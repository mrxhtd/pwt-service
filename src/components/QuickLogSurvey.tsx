import { useState } from 'react';
import { ACCENT } from '../constants';
import type { Survey } from '../types';

interface QuickLogProps {
  clientId: string;
  surveyCount: number;
  onSubmit: (survey: Survey) => void;
  onCancel: () => void;
}

interface ParamConfig {
  key: string;
  label: string;
  unit: string;
  step: number;
  min: number;
  max: number;
  initial: number;
}

const QUICK_PARAMS: ParamConfig[] = [
  { key: 'ph', label: 'pH', unit: '', step: 0.1, min: 0, max: 14, initial: 7.0 },
  { key: 'tds', label: 'TDS', unit: 'ppm', step: 10, min: 0, max: 5000, initial: 200 },
  { key: 'totalHard', label: 'Hardness', unit: 'ppm', step: 5, min: 0, max: 2000, initial: 100 },
  { key: 'sulfite', label: 'Sulfite', unit: 'ppm', step: 1, min: 0, max: 100, initial: 10 },
];

export function QuickLogSurvey({ clientId, surveyCount, onSubmit, onCancel }: QuickLogProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(QUICK_PARAMS.map((p) => [p.key, p.initial]))
  );
  const [notes, setNotes] = useState('');

  const update = (key: string, delta: number, config: ParamConfig) => {
    setValues((v) => ({
      ...v,
      [key]: Math.min(config.max, Math.max(config.min, +(v[key] + delta).toFixed(2))),
    }));
  };

  const handleSubmit = () => {
    const survey: Survey = {
      id: `SRV-${String(surveyCount + 1).padStart(3, '0')}`,
      clientId,
      date: new Date().toISOString().slice(0, 10),
      notes,
      ...values,
    } as Survey;
    onSubmit(survey);
  };

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>⚡ Quick Log</h3>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {QUICK_PARAMS.map((p) => (
          <div key={p.key} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              {p.label} {p.unit && <span style={{ color: '#94a3b8' }}>({p.unit})</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => update(p.key, -p.step, p)}
                style={{
                  width: 48, height: 48,
                  borderRadius: 12,
                  border: '1.5px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#dc2626',
                  touchAction: 'manipulation',
                }}
              >
                −
              </button>
              <input
                type="text"
                inputMode="decimal"
                value={values[p.key]}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  if (Number.isFinite(n)) setValues((v) => ({ ...v, [p.key]: n }));
                }}
                style={{
                  width: 80,
                  textAlign: 'center',
                  fontSize: 22,
                  fontWeight: 800,
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '8px 4px',
                  outline: 'none',
                  color: '#1e293b',
                }}
              />
              <button
                onClick={() => update(p.key, p.step, p)}
                style={{
                  width: 48, height: 48,
                  borderRadius: 12,
                  border: '1.5px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#10b981',
                  touchAction: 'manipulation',
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: '100%',
            border: '1.5px solid #e2e8f0',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 13,
            resize: 'vertical',
            minHeight: 60,
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 10,
            border: '1.5px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            flex: 2,
            padding: '12px 16px',
            borderRadius: 10,
            border: 'none',
            background: ACCENT,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Save Reading
        </button>
      </div>
    </div>
  );
}
