import { ACCENT } from '../constants';
import type { Client, Survey } from '../types';
import { Badge } from './Badge';
import { ClientForm, type ClientDraft } from './ClientForm';

type FilterStatus = 'All' | 'Active' | 'Follow-up' | 'Inactive';

interface ClientsTabProps {
  clients: Client[];
  surveys: Survey[];
  filterStatus: FilterStatus;
  onFilterStatus: (f: FilterStatus) => void;
  showForm: boolean;
  onShowForm: (show: boolean) => void;
  clientDraft: ClientDraft;
  onClientDraft: (d: ClientDraft) => void;
  onSaveClient: () => void;
  onOpenSurveyFor: (client: Client) => void;
}

const FILTERS: FilterStatus[] = ['All', 'Active', 'Follow-up', 'Inactive'];

export function ClientsTab({
  clients,
  surveys,
  filterStatus,
  onFilterStatus,
  showForm,
  onShowForm,
  clientDraft,
  onClientDraft,
  onSaveClient,
  onOpenSurveyFor,
}: ClientsTabProps) {
  const filtered = filterStatus === 'All' ? clients : clients.filter((c) => c.status === filterStatus);
  const counts = {
    Active:      clients.filter((c) => c.status === 'Active').length,
    'Follow-up': clients.filter((c) => c.status === 'Follow-up').length,
    Inactive:    clients.filter((c) => c.status === 'Inactive').length,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Client Registry</h2>
        <button
          onClick={() => onShowForm(true)}
          style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          + Add Client
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => onFilterStatus(s)}
            style={{ background: filterStatus === s ? ACCENT : '#fff', color: filterStatus === s ? '#fff' : '#64748b', border: `1.5px solid ${filterStatus === s ? ACCENT : '#e2e8f0'}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            {s} {s !== 'All' && `(${counts[s]})`}
          </button>
        ))}
      </div>

      {showForm && (
        <ClientForm
          draft={clientDraft}
          onChange={onClientDraft}
          onSave={onSaveClient}
          onCancel={() => onShowForm(false)}
        />
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map((c) => {
          const clientSurveys = surveys.filter((s) => s.clientId === c.id);
          return (
            <div key={c.id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏭</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{c.contact} · {c.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <Stat label="SYSTEM" value={c.systemType} />
                <Stat label="GALLONS" value={Number(c.gallons || 0).toLocaleString()} />
                <Stat label="SURVEYS" value={String(clientSurveys.length)} />
                <Stat label="NEXT VISIT" value={c.nextVisit || '—'} accent />
                <Badge status={c.status} />
                <button
                  onClick={() => onOpenSurveyFor(c)}
                  style={{ background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                >
                  + Survey
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: accent ? ACCENT : undefined }}>{value}</div>
    </div>
  );
}
