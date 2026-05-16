import { useCallback, useEffect, useState } from 'react';
import { PARAMS, SEED_CLIENTS, SEED_PRODUCTS, SEED_STOCKS, SEED_SURVEYS } from './constants';
import type { Client, ParamKey, Product, StockMap, Survey } from './types';
import { ClientsTab } from './components/ClientsTab';
import { Dashboard } from './components/Dashboard';
import { Header, type TabKey } from './components/Header';
import { ClientDetail } from './components/ClientDetail';
import { PhotoSurveyDialog } from './components/PhotoSurveyDialog';
import { PhotoClientDialog } from './components/PhotoClientDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { Toast } from './components/Toast';
import { useOfflineSync } from './hooks/useOfflineSync';
import { useProximityAlert } from './hooks/useProximityAlert';
import { fetchClients, fetchSurveys, fetchProducts, fetchStocks, upsertClient, upsertStock } from './lib/db';
import type { ClientDraft } from './components/ClientForm';

const HAS_SUPABASE = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

type FilterStatus = 'All' | 'Active' | 'Follow-up' | 'Inactive';

function makeClientDraft(clientCount: number): ClientDraft {
  return {
    id: `CLT-${String(clientCount + 1).padStart(3, '0')}`,
    name: '',
    contact: '',
    phone: '',
    systemType: 'Cooling Tower',
    status: 'Active',
    lastVisit: '',
    nextVisit: '',
  };
}

function makeManualSurvey(clientId: string, surveyCount: number): Survey {
  const base = {
    id: `SRV-${String(surveyCount + 1).padStart(3, '0')}`,
    clientId,
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  } as Survey;
  for (const p of PARAMS) {
    (base as Record<ParamKey, number | ''>)[p.key] = '';
  }
  return base;
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<StockMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [clientDraft, setClientDraft] = useState<ClientDraft>(() => makeClientDraft(0));

  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoClientOpen, setPhotoClientOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedClient = selectedClientId ? clients.find((c) => c.id === selectedClientId) ?? null : null;

  // Offline sync hook
  const { isOnline, pendingCount, submitSurvey } = useOfflineSync();

  // Proximity alert hook
  const { nearbyClient, dismiss: dismissProximity } = useProximityAlert(clients);

  // Load all data from Supabase on mount (fall back to seed data if no env vars)
  useEffect(() => {
    async function load() {
      if (!HAS_SUPABASE) {
        setClients(SEED_CLIENTS);
        setSurveys(SEED_SURVEYS);
        setProducts(SEED_PRODUCTS);
        setStocks(SEED_STOCKS);
        setClientDraft(makeClientDraft(SEED_CLIENTS.length));
        setLoading(false);
        return;
      }
      try {
        const [c, s, p, st] = await Promise.all([fetchClients(), fetchSurveys(), fetchProducts(), fetchStocks()]);
        setClients(c);
        setSurveys(s);
        setProducts(p);
        setStocks(st);
        setClientDraft(makeClientDraft(c.length));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const saveClient = async () => {
    if (!clientDraft.name) return;
    const newClient = { ...clientDraft } as Client;
    setClients((c) => [...c, newClient]);
    setClientDraft(makeClientDraft(clients.length + 1));
    setShowClientForm(false);
    try { await upsertClient(newClient); } catch { /* optimistic */ }
  };

  const onSaveSurvey = useCallback(async (s: Survey) => {
    setSurveys((arr) => [...arr, s]);
    setClients((cs) => cs.map((c) => (c.id === s.clientId ? { ...c, lastVisit: s.date } : c)));
    setPhotoDialogOpen(false);
    await submitSurvey(s);
  }, [submitSurvey]);

  const openClient = (c: Client) => {
    setSelectedClientId(c.id);
    setTab('clients');
  };

  const saveClientFromPhoto = async (newClient: Client, newSurvey: Survey | null) => {
    setClients((cs) => [...cs, newClient]);
    if (newSurvey) {
      setSurveys((arr) => [...arr, newSurvey]);
      await submitSurvey(newSurvey);
    }
    setPhotoClientOpen(false);
    try { await upsertClient(newClient); } catch { /* optimistic */ }
  };

  const onNewManual = async () => {
    if (!selectedClient) return;
    const blank = makeManualSurvey(selectedClient.id, surveys.length);
    setSurveys((arr) => [...arr, blank]);
    setClients((cs) => cs.map((c) => (c.id === blank.clientId ? { ...c, lastVisit: blank.date } : c)));
    await submitSurvey(blank);
  };

  const handleStocksChange = async (next: StockMap) => {
    const prev = stocks;
    setStocks(next);
    // Diff and upsert changed entries
    for (const clientId of Object.keys(next)) {
      for (const productId of Object.keys(next[clientId] ?? {})) {
        const newLevel = next[clientId]?.[productId] ?? 0;
        const oldLevel = prev[clientId]?.[productId] ?? 0;
        if (newLevel !== oldLevel) {
          try { await upsertStock(clientId, productId, newLevel); } catch { /* optimistic */ }
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💧</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Loading PWT Service...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#dc2626', maxWidth: 400, padding: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Connection Error</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f0f4f8', color: '#1e293b' }}>
      <Header
        tab={tab}
        onTab={(t) => {
          setTab(t);
          if (t !== 'clients') setSelectedClientId(null);
        }}
        clientCount={clients.length}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Offline / pending indicator */}
      {(!isOnline || pendingCount > 0) && (
        <div style={{ background: !isOnline ? '#fef3c7' : '#e0f2fe', padding: '6px 16px', fontSize: 12, fontWeight: 600, textAlign: 'center', color: !isOnline ? '#92400e' : '#0369a1' }}>
          {!isOnline ? '📡 Offline — surveys will sync when connection returns' : `⏳ ${pendingCount} survey(s) pending sync`}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {tab === 'clients' && !selectedClient && (
          <ClientsTab
            clients={clients}
            surveys={surveys}
            products={products}
            stocks={stocks}
            filterStatus={filterStatus}
            onFilterStatus={setFilterStatus}
            showForm={showClientForm}
            onShowForm={setShowClientForm}
            clientDraft={clientDraft}
            onClientDraft={setClientDraft}
            onSaveClient={saveClient}
            onSelectClient={openClient}
            onAddFromPhoto={() => setPhotoClientOpen(true)}
          />
        )}

        {tab === 'clients' && selectedClient && (
          <ClientDetail
            client={selectedClient}
            products={products}
            stocks={stocks}
            onStocksChange={handleStocksChange}
            surveys={surveys}
            onBack={() => setSelectedClientId(null)}
            onNewSurveyFromPhoto={() => setPhotoDialogOpen(true)}
            onNewSurveyManual={onNewManual}
            onSubmitSurvey={onSaveSurvey}
            surveyCount={surveys.length}
          />
        )}

        {tab === 'dashboard' && (
          <Dashboard clients={clients} surveys={surveys} products={products} stocks={stocks} />
        )}
      </div>

      {photoDialogOpen && selectedClient && (
        <PhotoSurveyDialog
          client={selectedClient}
          surveyCount={surveys.length}
          onClose={() => setPhotoDialogOpen(false)}
          onSave={onSaveSurvey}
          onOpenSettings={() => {
            setPhotoDialogOpen(false);
            setSettingsOpen(true);
          }}
        />
      )}

      {photoClientOpen && (
        <PhotoClientDialog
          clientCount={clients.length}
          surveyCount={surveys.length}
          onClose={() => setPhotoClientOpen(false)}
          onSave={saveClientFromPhoto}
          onOpenSettings={() => { setPhotoClientOpen(false); setSettingsOpen(true); }}
        />
      )}

      {settingsOpen && <SettingsDialog onClose={() => setSettingsOpen(false)} />}

      {/* Proximity alert toast */}
      {nearbyClient && (
        <Toast
          message={`📍 You are near ${nearbyClient.name}. Open their boiler history?`}
          action="Open"
          onAction={() => {
            openClient(nearbyClient);
            dismissProximity();
          }}
          onDismiss={dismissProximity}
          variant="info"
        />
      )}
    </div>
  );
}
