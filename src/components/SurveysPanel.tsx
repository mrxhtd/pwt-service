import { useEffect, useState } from 'react';
import { ACCENT, PARAMS } from '../constants';
import { getStatus } from '../lib/status';
import type { Survey } from '../types';

interface SurveysPanelProps {
  clientId: string;
  surveys: Survey[];
  onNewFromPhoto: () => void;
  onNewManual: () => void;
}

const CELL_W = 110;

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export function SurveysPanel({ clientId, surveys, onNewFromPhoto, onNewManual }: SurveysPanelProps) {
  const isMobile = useIsMobile();

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

      {list.length > 0 && (isMobile ? (
        <MobileCards list={list} />
      ) : (
        <DesktopTable list={list} />
      ))}
    </div>
  );
}

function DesktopTable({ list }: { list: Survey[] }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1.5px solid #e2e8f0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 160 + list.length * CELL_W }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={{ width: 160, minWidth: 160, padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1.5px solid #e2e8f0', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1 }}>
              Parameter
            </th>
            {list.map((s) => {
              const outCount = PARAMS.filter((p) => getStatus(s[p.key], p.min, p.max) === 'out').length;
              return (
                <th key={s.id} style={{ width: CELL_W, minWidth: CELL_W, padding: '10px 12px', textAlign: 'center', borderBottom: '1.5px solid #e2e8f0', borderLeft: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>{s.id}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginTop: 2 }}>{s.date}</div>
                  <div style={{ marginTop: 5 }}>
                    {outCount > 0 ? (
                      <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                        ⚠ {outCount} out
                      </span>
                    ) : (
                      <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                        ✓ OK
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {PARAMS.map((p, rowIdx) => (
            <tr key={p.key} style={{ background: rowIdx % 2 === 0 ? '#fff' : '#fafbfc' }}>
              <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', position: 'sticky', left: 0, background: rowIdx % 2 === 0 ? '#fff' : '#fafbfc', zIndex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{p.label}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                  {p.unit ? `${p.unit} · ` : ''}{p.min}–{p.max}
                </div>
              </td>
              {list.map((s, idx) => {
                const val = s[p.key];
                const prev = list[idx + 1];
                const prevVal = prev?.[p.key];
                const st = getStatus(val, p.min, p.max);
                const cellBg = st === 'out' ? '#fff5f5' : st === 'ok' ? '#f6fef9' : 'transparent';
                const valColor = st === 'out' ? '#dc2626' : st === 'ok' ? '#16a34a' : '#64748b';
                const trend = getTrend(val, prevVal);
                return (
                  <td key={s.id} style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9', background: cellBg }}>
                    {val === '' || val == null ? (
                      <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: valColor }}>{val}</span>
                        {trend && <span style={{ fontSize: 11, fontWeight: 800, color: trend.color }}>{trend.arrow}</span>}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr style={{ background: '#f8fafc' }}>
            <td style={{ padding: '8px 14px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Notes</div>
            </td>
            {list.map((s) => (
              <td key={s.id} style={{ padding: '8px 12px', textAlign: 'center', borderLeft: '1px solid #f1f5f9', fontSize: 11, color: '#64748b', fontStyle: s.notes ? 'italic' : 'normal' }}>
                {s.notes || <span style={{ color: '#cbd5e1' }}>—</span>}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function MobileCards({ list }: { list: Survey[] }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {list.map((s, idx) => {
        const prev = list[idx + 1];
        const outCount = PARAMS.filter((p) => getStatus(s[p.key], p.min, p.max) === 'out').length;
        const filledParams = PARAMS.filter((p) => s[p.key] !== '' && s[p.key] != null);
        return (
          <div key={s.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{s.id}</span>
                <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{s.date}</span>
                {prev && <span style={{ marginLeft: 6, fontSize: 11, color: '#94a3b8' }}>vs {prev.date}</span>}
              </div>
              {outCount > 0 ? (
                <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                  ⚠ {outCount} out
                </span>
              ) : (
                <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                  ✓ OK
                </span>
              )}
            </div>

            {/* 2-column parameter grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e2e8f0' }}>
              {filledParams.map((p) => {
                const val = s[p.key];
                const prevVal = prev?.[p.key];
                const st = getStatus(val, p.min, p.max);
                const cellBg = st === 'out' ? '#fff5f5' : st === 'ok' ? '#f6fef9' : '#fff';
                const valColor = st === 'out' ? '#dc2626' : st === 'ok' ? '#16a34a' : '#475569';
                const trend = getTrend(val, prevVal);
                return (
                  <div key={p.key} style={{ background: cellBg, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: '#cbd5e1' }}>{p.min}–{p.max}{p.unit ? ` ${p.unit}` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, textAlign: 'right' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: valColor }}>{val}</span>
                      {p.unit && <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.unit}</span>}
                      {trend && <span style={{ fontSize: 12, fontWeight: 800, color: trend.color }}>{trend.arrow}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {s.notes && (
              <div style={{ padding: '8px 14px', fontSize: 12, color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #f1f5f9' }}>
                📝 {s.notes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getTrend(val: number | '', prevVal: number | '' | undefined): { arrow: string; color: string } | null {
  if (val === '' || val == null || prevVal === '' || prevVal == null) return null;
  const diff = (val as number) - (prevVal as number);
  if (Math.abs(diff) < 0.001) return { arrow: '=', color: '#cbd5e1' };
  return diff > 0 ? { arrow: '↑', color: '#f59e0b' } : { arrow: '↓', color: '#60a5fa' };
}
