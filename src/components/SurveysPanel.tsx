import { ACCENT, PARAMS } from '../constants';
import { getStatus } from '../lib/status';
import type { Survey } from '../types';

interface SurveysPanelProps {
  clientId: string;
  surveys: Survey[];
  onNewFromPhoto: () => void;
  onNewManual: () => void;
}

export function SurveysPanel({ clientId, surveys, onNewFromPhoto, onNewManual }: SurveysPanelProps) {
  const list = surveys
    .filter((s) => s.clientId === clientId)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🧪 Surveys</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onNewFromPhoto}
            style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            📷 From Photo
          </button>
          <button
            onClick={onNewManual}
            style={{ background: '#f1f5f9', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            + Manual
          </button>
        </div>
      </div>

      {list.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 10 }}>
          No surveys yet for this client. Take a photo of the handwritten sheet to get started.
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {list.map((s) => {
          const outOfRange = PARAMS.filter((p) => getStatus(s[p.key], p.min, p.max) === 'out');
          return (
            <div key={s.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{s.id}</span>
                  <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{s.date}</span>
                </div>
                {outOfRange.length > 0 ? (
                  <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                    ⚠ {outOfRange.length} out of range
                  </span>
                ) : (
                  <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                    ✓ All OK
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PARAMS.map((p) => {
                  const val = s[p.key];
                  if (val === '' || val === null || val === undefined) return null;
                  const st = getStatus(val, p.min, p.max);
                  const bg = st === 'out' ? '#fef2f2' : st === 'ok' ? '#f0fdf4' : '#fff';
                  const border = st === 'out' ? '#fecaca' : st === 'ok' ? '#bbf7d0' : '#e2e8f0';
                  const color = st === 'out' ? '#dc2626' : st === 'ok' ? '#16a34a' : '#1e293b';
                  return (
                    <div key={p.key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '4px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{p.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color }}>
                        {val}
                        {p.unit && <span style={{ fontSize: 9, color: '#94a3b8' }}> {p.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {s.notes && <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>📝 {s.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
