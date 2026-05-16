import { ACCENT, PARAMS } from '../constants';
import { getStatus } from '../lib/status';
import type { Client, Survey } from '../types';
import { SurveyForm, type SurveyDraft } from './SurveyForm';

interface SurveysTabProps {
  clients: Client[];
  surveys: Survey[];
  showForm: boolean;
  onShowForm: (show: boolean) => void;
  surveyDraft: SurveyDraft;
  onSurveyDraft: (d: SurveyDraft) => void;
  onSaveSurvey: () => void;
  onNewSurvey: () => void;
  surveyClient: Client | null;
}

export function SurveysTab({
  clients,
  surveys,
  showForm,
  onShowForm,
  surveyDraft,
  onSurveyDraft,
  onSaveSurvey,
  onNewSurvey,
  surveyClient,
}: SurveysTabProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Survey Log</h2>
        <button
          onClick={onNewSurvey}
          style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          + New Survey
        </button>
      </div>

      {showForm && (
        <SurveyForm
          draft={surveyDraft}
          onChange={onSurveyDraft}
          onSave={onSaveSurvey}
          onCancel={() => onShowForm(false)}
          clients={clients}
          surveyClient={surveyClient}
        />
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {[...surveys].reverse().map((s) => {
          const client = clients.find((c) => c.id === s.clientId);
          const outOfRange = PARAMS.filter((p) => getStatus(s[p.key], p.min, p.max) === 'out');
          return (
            <div key={s.id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{s.id}</span>
                  <span style={{ margin: '0 8px', color: '#e2e8f0' }}>|</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{client?.name ?? s.clientId}</span>
                  <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8 }}>{s.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {s.gallons !== '' && s.gallons !== 0 && (
                    <span style={{ fontSize: 12, color: '#64748b' }}>🪣 {Number(s.gallons).toLocaleString()} gal</span>
                  )}
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
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PARAMS.map((p) => {
                  const val = s[p.key];
                  if (val === '' || val === null || val === undefined) return null;
                  const st = getStatus(val, p.min, p.max);
                  const bg = st === 'out' ? '#fef2f2' : st === 'ok' ? '#f0fdf4' : '#f8fafc';
                  const border = st === 'out' ? '#fecaca' : st === 'ok' ? '#bbf7d0' : '#e2e8f0';
                  const color = st === 'out' ? '#dc2626' : st === 'ok' ? '#16a34a' : '#1e293b';
                  return (
                    <div key={p.key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '4px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{p.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color }}>
                        {val}
                        {p.unit && <span style={{ fontSize: 9, color: '#94a3b8' }}> {p.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {s.notes && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>📝 {s.notes}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
