import { useState } from 'react';
import { ACCENT, STORAGE_KEYS } from '../constants';
import { DEFAULT_GEMINI_MODEL } from '../lib/gemini';
import { loadString, saveString } from '../lib/storage';

interface SettingsDialogProps {
  onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState(() => loadString(STORAGE_KEYS.apiKey));
  const [model, setModel] = useState(() => loadString(STORAGE_KEYS.model));
  const [reveal, setReveal] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    saveString(STORAGE_KEYS.apiKey, apiKey.trim());
    saveString(STORAGE_KEYS.model, model.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px', overflow: 'auto', zIndex: 250 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 22, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Settings</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
              Gemini API Key
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type={reveal ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza…"
                style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#1e293b', outline: 'none', fontFamily: 'ui-monospace, Consolas, monospace' }}
              />
              <button
                onClick={() => setReveal((r) => !r)}
                style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '0 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
              >
                {reveal ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
              Get one at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: ACCENT }}>aistudio.google.com/apikey</a>.
              Stored only in your browser's localStorage.
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
              Model (optional)
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={DEFAULT_GEMINI_MODEL}
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#1e293b', outline: 'none', fontFamily: 'ui-monospace, Consolas, monospace' }}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
              Defaults to <code>{DEFAULT_GEMINI_MODEL}</code> if blank.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18, alignItems: 'center' }}>
          {saved && <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 600 }}>Saved ✓</span>}
          <button onClick={onClose} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Close
          </button>
          <button onClick={save} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
