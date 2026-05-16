import { useEffect, useRef, useState } from 'react';
import { ACCENT, PARAMS, STORAGE_KEYS } from '../constants';
import { getStatus } from '../lib/status';
import { extractSurveyFromImage, type ExtractedSurvey } from '../lib/gemini';
import { loadString } from '../lib/storage';
import type { Client, ParamKey, Survey } from '../types';
// apiKey is now server-side; only model override is read from localStorage

interface PhotoSurveyDialogProps {
  client: Client;
  surveyCount: number;
  onClose: () => void;
  onSave: (survey: Survey) => void;
  onOpenSettings: () => void;
}

type Draft = {
  date: string;
  notes: string;
} & { [K in ParamKey]: string };

function emptyDraft(): Draft {
  const d: Partial<Draft> = {
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  };
  for (const p of PARAMS) (d as Record<string, string>)[p.key] = '';
  return d as Draft;
}

function extractedToDraft(ex: ExtractedSurvey): Draft {
  const d: Partial<Draft> = {
    date: ex.date || new Date().toISOString().slice(0, 10),
    notes: ex.notes || '',
  };
  for (const p of PARAMS) {
    const v = ex[p.key];
    (d as Record<string, string>)[p.key] = v === '' ? '' : String(v);
  }
  return d as Draft;
}

function draftToSurvey(d: Draft, clientId: string, surveyCount: number): Survey {
  const out = {
    id: `SRV-${String(surveyCount + 1).padStart(3, '0')}`,
    clientId,
    date: d.date || new Date().toISOString().slice(0, 10),
    notes: d.notes,
  } as Survey;
  for (const p of PARAMS) {
    const v = d[p.key];
    (out as Record<ParamKey, number | ''>)[p.key] = v === '' ? '' : Number(v);
  }
  return out;
}

export function PhotoSurveyDialog({ client, surveyCount, onClose, onSave, onOpenSettings }: PhotoSurveyDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [extracted, setExtracted] = useState(false);
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
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onExtract = async () => {
    if (!file) return;
    setError(null);
    setExtracting(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const model = loadString(STORAGE_KEYS.model) || undefined;
      const ex = await extractSurveyFromImage(file, { model, signal: ctrl.signal });
      setDraft(extractedToDraft(ex));
      setExtracted(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!ctrl.signal.aborted) setError(msg);
    } finally {
      if (!ctrl.signal.aborted) setExtracting(false);
    }
  };

  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    const s = draftToSurvey(draft, client.id, surveyCount);
    onSave(s);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflow: 'auto', zIndex: 200 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 22, width: '100%', maxWidth: 720, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>New Survey from Photo</h3>
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>{client.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {!file && (
          <label style={{ display: 'block', padding: '32px 20px', border: '2px dashed #cbd5e1', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Take or upload a photo of the survey sheet</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>JPG / PNG / HEIC</div>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </label>
        )}

        {file && previewUrl && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 260px) 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <img src={previewUrl} alt="Survey sheet" style={{ width: '100%', borderRadius: 10, border: '1.5px solid #e2e8f0', objectFit: 'cover' }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button
                  onClick={() => onPick(null)}
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '5px 10px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                >
                  Replace
                </button>
                {!extracted && (
                  <button
                    onClick={onExtract}
                    disabled={extracting}
                    style={{ background: extracting ? '#cbd5e1' : ACCENT, color: '#fff', border: 'none', borderRadius: 7, padding: '5px 12px', fontWeight: 700, fontSize: 12, cursor: extracting ? 'default' : 'pointer' }}
                  >
                    {extracting ? 'Extracting…' : '✨ Extract with AI'}
                  </button>
                )}
              </div>
            </div>
            <div>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
                  <strong>Extraction failed:</strong> {error}
                  {' '}
                  <button onClick={onOpenSettings} style={{ background: 'transparent', border: 'none', color: '#991b1b', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 12 }}>
                    Open settings
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginBottom: 12 }}>
                <FormField label="Date" type="date" value={draft.date} onChange={(v) => setField('date', v)} />
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Water Quality Parameters {extracted && <span style={{ color: ACCENT }}>· auto-filled, review below</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8 }}>
                  {PARAMS.map((p) => {
                    const val = draft[p.key];
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
                          onChange={(e) => setField(p.key, e.target.value)}
                          placeholder={`${p.min}–${p.max}`}
                          style={{ border: `1.5px solid ${borderColor}`, borderRadius: 6, padding: '5px 7px', fontSize: 12, color: '#1e293b', outline: 'none', background: bg }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={2}
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: '#1e293b', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!file}
            style={{ background: file ? ACCENT : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: file ? 'pointer' : 'default' }}
          >
            Save Survey
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <label style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ border: '1.5px solid #e2e8f0', borderRadius: 7, padding: '6px 9px', fontSize: 12, color: '#1e293b', outline: 'none', background: '#fff' }}
      />
    </div>
  );
}
