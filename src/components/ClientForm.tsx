import { ACCENT, STATUSES, SYSTEM_TYPES } from '../constants';
import type { Client, Status, SystemType } from '../types';
import { Input } from './Input';
import { Select } from './Select';

export type ClientDraft = Omit<Client, 'gallons'> & { gallons: number | '' };

interface ClientFormProps {
  draft: ClientDraft;
  onChange: (draft: ClientDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ClientForm({ draft, onChange, onSave, onCancel }: ClientFormProps) {
  const set = <K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>New Client</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <Input label="Company Name" value={draft.name} onChange={(v) => set('name', v)} />
        <Input label="Contact Person" value={draft.contact} onChange={(v) => set('contact', v)} />
        <Input label="Phone" value={draft.phone} onChange={(v) => set('phone', v)} />
        <Select label="System Type" value={draft.systemType} onChange={(v) => set('systemType', v as SystemType)} options={SYSTEM_TYPES} />
        <Input label="Total Gallons" type="number" value={draft.gallons} onChange={(v) => set('gallons', v === '' ? '' : Number(v))} />
        <Select label="Status" value={draft.status} onChange={(v) => set('status', v as Status)} options={STATUSES} />
        <Input label="Next Follow-up" type="date" value={draft.nextVisit} onChange={(v) => set('nextVisit', v)} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={onSave} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
        <button onClick={onCancel} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}
