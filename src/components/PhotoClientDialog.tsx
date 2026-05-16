import { useEffect, useRef, useState } from 'react';
import { ACCENT, PARAMS, STATUSES, STORAGE_KEYS, SYSTEM_TYPES } from '../constants';
import { getStatus } from '../lib/status';
import { extractClientFromImage } from '../lib/gemini';
import { loadString } from '../lib/storage';
import type { Client, ParamKey, Status, Survey, SystemType } from '../types';

interface PhotoClientDialogProps {
  clientCount: number;
  surveyCount: number;
  onClose: () => void;
  onSave: (client: Client, survey: Survey | null) => void;
  onOpenSettings: () => void;
}

type ClientDraft = {
  name: string;
  contact: string;
  phone: string;
  systemType: SystemType;
  status: Status;
  nextVisit: string;
};

type SurveyDraft = { date: string; notes: string } & { [K in ParamKey]: string };

function emptyClientDraft(): ClientDraft {
  return { name: '', contact: '', phone: '', systemType: 'Cooling Tower', status: 'Active', nextVisit: '' };
}

function emptySurveyDraft(): SurveyDraft {
  const d: Partial<SurveyDraft> = { date: new Date().toISOString().slice(0, 10), notes: '' };
  for (const p of PARAMS) (d as Record<string, string>)[p.key] = '';
  return d as SurveyDraft;
}

function makeSurvey(d: SurveyDraft, clientId: string, surveyCount: number): Survey {
  const s = { id: `SRV-${String(surveyCount + 1).padStart(3, '0')}`, clientId, date: d.date || new Date().toISOString().slice(0, 10), notes: d.notes } as Survey;
  for (const p of PARAMS) {
    const v = d[p.key];
    (s as Record<ParamKey, number | ''>)[p.key] = v === '' ? '' : Number(v);
  }
  return s;
}

export function PhotoClientDialog({ clientCount, surveyCount, onClose, onSave, onOpenSettings }: PhotoClientDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ClientDraft>(emptyClientDraft);
  const [survey, setSurvey] = useState<SurveyDraft>(emptySurveyDraft);
  const [includeSurvey, setIncludeSurvey] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      abortRef.current?.abort();
    };
  }, [previewUrl]);

  const onPick = (f: File | null) => {
    setError(null);
    setExtracted(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!f) { setFile(null); setPreviewUrl(null); return; }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onExtract = async () => {
    if (!file) return;
    const apiKey = loadString(STORAGE_KEYS.apiKey);
    if (!apiKey) { setError('Add your Gemini API key in Settings first.'); return; }
    setError(null);
    setExtracting(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const model = loadString(STORAGE_KEYS.model) || undefined;
      const ex = await extractClientFromImage(file, { apiKey, model, signal: ctrl.signal });
      setClient({
        name: ex.name,
        contact: ex.contact,
        phone: ex.phone,
        systemType: (SYSTEM_TYPES.includes(ex.systemType as SystemType) ? ex.systemType : 'Other') as SystemType,
        status: 'Active',
        nextVisit: '',
      });
      const sd: Partial<SurveyDraft> = { date: ex.date || new Date().toISOString().slice(0, 10), notes: ex.notes };
      for (const p of PARAMS) (sd as Record<string, string>)[p.key] = ex[p.key] === '' ? '' : String(ex[p.key]);
      setSurvey(sd as SurveyDraft);
      setExtracted(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!ctrl.signal.aborted) setError(msg);
    } finally {
      if (!ctrl.signal.aborted) setExtracting(false);
    }
  };

  const setC = <K extends keyof ClientDraft>(k: K, v: ClientDraft[K]) => setClient((c) => ({ ...c, [k]: v }));
  const setS = <K extends keyof SurveyDraft>(k: K, v: SurveyDraft[K]) => setSurvey((s) => ({ ...s, [k]: v }));

  const save = () => {
    const newId = `CLT-${String(clientCount + 1).padStart(3, '0')}`;
    const newClient: Client = {
      id: newId,
      name: client.name.trim() || 'Unnamed Site',
      contact: client.contact,
      phone: client.phone,
      systemType: client.systemType,
      status: client.status,
      lastVisit: includeSurvey ? (survey.date || new Date().toISOString().slice(0, 10)) : '',
      nextVisit: client.nextVisit,
    };
    const newSurvey = includeSurvey ? makeSurvey(survey, newId, surveyCount) : null;
    onSave(newClient, newSurvey);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflow: 'auto', zIndex: 200 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 22, width: '100%', maxWidth: 760, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Add New Site from Photo</h3>
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>Upload a survey sheet — AI extracts site info + first readings</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Upload area */}
        {!file && (
          <label style={{ display: 'block', padding: '32px 20px', border: '2px dashed #cbd5e1', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: '#f8fafc', marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Take or upload a photo of the survey sheet</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>JPG / PNG / HEIC — site header + readings will be extracted</div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
          </label>
        )}

        {file && previewUrl && (
          <>
            {/* Image + extract button */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap' }}>
              <img src={previewUrl} alt="Survey sheet" style={{ width: 140, borderRadius: 10, border: '1.5px solid #e2e8f0', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button onClick={() => onPick(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '6px 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Replace
                  </button>
                  {!extracted && (
                    <button onClick={onExtract} disabled={extracting} style={{ background: extracting ? '#cbd5e1' : ACCENT, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: extracting ? 'default' : 'pointer' }}>
                      {extracting ? 'Extracting…' : '✨ Extract with AI'}
                    </button>
                  )}
                  {extracted && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, alignSelf: 'center' }}>✓ Extracted — review below</span>}
                </div>
                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 12px', borderRadius: 8, fontSize: 12 }}>
                    <strong>Failed:</strong> {error}{' '}
                    <button onClick={onOpenSettings} style={{ background: 'transparent', border: 'none', color: '#991b1b', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 12 }}>Open settings</button>
                  </div>
                )}
              </div>
            </div>

            {/* Site Info */}
            <Section title="Site Information">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
                <Field label="Company / Site Name" value={client.name} onChange={(v) => setC('name', v)} placeholder="e.g. Al-Nour Factory" />
                <Field label="Contact Person" value={client.contact} onChange={(v) => setC('contact', v)} placeholder="Full name" />
                <Field label="Phone" value={client.phone} onChange={(v) => setC('phone', v)} placeholder="010-xxx-xxxx" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={labelStyle}>System Type</label>
                  <select value={client.systemType} onChange={(e) => setC('systemType', e.target.value as SystemType)} style={inputStyle}>
                    {SYSTEM_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={labelStyle}>Status</label>
                  <select value={client.status} onChange={(e) => setC('status', e.target.value as Status)} style={inputStyle}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <Field label="Next Follow-up" type="date" value={client.nextVisit} onChange={(v) => setC('nextVisit', v)} />
              </div>
            </Section>

            {/* First Survey toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
              <input type="checkbox" id="inc-survey" checked={includeSurvey} onChange={(e) => setIncludeSurvey(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="inc-survey" style={{ fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                Also save the readings as this site's first survey
              </label>
            </div>

            {includeSurvey && (
              <Section title="First Survey Readings">
                <div style={{ marginBottom: 10 }}>
                  <Field label="Date" type="date" value={survey.date} onChange={(v) => setS('date', v)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8, marginBottom: 10 }}>
                  {PARAMS.map((p) => {
                    const val = survey[p.key];
                    const st = getStatus(val, p.min, p.max);
                    const borderColor = st === 'out' ? '#ef4444' : st === 'ok' ? '#10b981' : '#e2e8f0';
                    const bg = st === 'out' ? '#fef2f2' : st === 'ok' ? '#f0fdf4' : '#fff';
                    return (
                      <div key={p.key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <label style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                          {p.label}{p.unit && <span style={{ color: '#94a3b8' }}> ({p.unit})</span>}
                        </label>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => setS(p.key, e.target.value)}
                          placeholder={`${p.min}–${p.max}`}
                          style={{ border: `1.5px solid ${borderColor}`, borderRadius: 6, padding: '5px 7px', fontSize: 12, color: '#1e293b', outline: 'none', background: bg }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea value={survey.notes} onChange={(e) => setS('notes', e.target.value)} rows={2}
                    style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: '#1e293b', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </Section>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={save} disabled={!file || !client.name.trim()}
            style={{ background: (file && client.name.trim()) ? ACCENT : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: (file && client.name.trim()) ? 'pointer' : 'default' }}>
            Save Site{includeSurvey ? ' + Survey' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle} />
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 };
const inputStyle: React.CSSProperties = { border: '1.5px solid #e2e8f0', borderRadius: 7, padding: '6px 9px', fontSize: 13, color: '#1e293b', outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' };
