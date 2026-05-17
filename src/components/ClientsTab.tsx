import { ACCENT } from '../constants';
import type { Client, Product, StockMap, Survey } from '../types';
import { Badge } from './Badge';
import { ClientForm, type ClientDraft } from './ClientForm';

type FilterStatus = 'All' | 'Active' | 'Follow-up' | 'Inactive';

interface ClientsTabProps {
  clients: Client[];
  surveys: Survey[];
  products: Product[];
  stocks: StockMap;
  filterStatus: FilterStatus;
  onFilterStatus: (f: FilterStatus) => void;
  showForm: boolean;
  onShowForm: (show: boolean) => void;
  clientDraft: ClientDraft;
  onClientDraft: (d: ClientDraft) => void;
  onSaveClient: () => void;
  onSelectClient: (client: Client) => void;
  onAddFromPhoto: () => void;
}

const FILTERS: FilterStatus[] = ['All', 'Active', 'Follow-up', 'Inactive'];

export function ClientsTab({
  clients,
  surveys,
  products,
  stocks,
  filterStatus,
  onFilterStatus,
  showForm,
  onShowForm,
  clientDraft,
  onClientDraft,
  onSaveClient,
  onSelectClient,
  onAddFromPhoto,
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onAddFromPhoto}
            style={{ background: '#f1f5f9', color: '#334155', border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            📋 From Photo
          </button>
          <button
            onClick={() => onShowForm(true)}
            style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            + Add Client
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
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
          const surveyCount = surveys.filter((s) => s.clientId === c.id).length;
          const clientStocks = stocks[c.id] ?? {};
          const totalStock = Object.values(clientStocks).reduce((a, b) => a + (b || 0), 0);
          const lowProducts = products.filter((p) => (clientStocks[p.id] ?? 0) <= 10).length;
          return (
            <button
              key={c.id}
              onClick={() => onSelectClient(c)}
              style={{ all: 'unset', cursor: 'pointer', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', flexWrap: 'wrap', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = ACCENT;
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(14, 165, 233, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏭</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{c.contact} · {c.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <Stat label="SYSTEM" value={c.systemType} />
                <Stat label="STOCK" value={`${totalStock.toLocaleString()} ton`} />
                {lowProducts > 0 && <Stat label="LOW" value={String(lowProducts)} warn />}
                <Stat label="SURVEYS" value={String(surveyCount)} />
                <Stat label="NEXT VISIT" value={c.nextVisit || '—'} accent />
                <Badge status={c.status} />
                {(() => {
                  const daysRemaining = c.avgDailyConsumption && c.avgDailyConsumption > 0
                    ? (c.currentStock ?? 0) / c.avgDailyConsumption
                    : null;
                  const needsReorder = daysRemaining !== null && daysRemaining <= (c.deliveryLeadTime ?? 3);
                  return needsReorder ? (
                    <span style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      ⚠️ Low Stock / Send Proposal
                    </span>
                  ) : null;
                })()}
                <span style={{ color: ACCENT, fontWeight: 700, fontSize: 16 }}>›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false, warn = false }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  const color = warn ? '#dc2626' : accent ? ACCENT : undefined;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color }}>{value}</div>
    </div>
  );
}
