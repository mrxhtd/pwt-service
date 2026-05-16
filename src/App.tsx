import { useState } from 'react';
import { PARAMS, SEED_CLIENTS, SEED_PRODUCTS, SEED_STOCKS, SEED_SURVEYS, STORAGE_KEYS } from './constants';
import type { Client, ParamKey, Product, StockMap, Survey } from './types';
import { ClientsTab } from './components/ClientsTab';
import { Dashboard } from './components/Dashboard';
import { Header, type TabKey } from './components/Header';
import { ClientDetail } from './components/ClientDetail';
import { PhotoSurveyDialog } from './components/PhotoSurveyDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { usePersistedState } from './lib/storage';
import type { ClientDraft } from './components/ClientForm';

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
  const [clients, setClients] = usePersistedState<Client[]>(STORAGE_KEYS.clients, SEED_CLIENTS);
  const [surveys, setSurveys] = usePersistedState<Survey[]>(STORAGE_KEYS.surveys, SEED_SURVEYS);
  const [products] = usePersistedState<Product[]>(STORAGE_KEYS.products, SEED_PRODUCTS);
  const [stocks, setStocks] = usePersistedState<StockMap>(STORAGE_KEYS.stocks, SEED_STOCKS);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [clientDraft, setClientDraft] = useState<ClientDraft>(() => makeClientDraft(clients.length));

  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedClient = selectedClientId ? clients.find((c) => c.id === selectedClientId) ?? null : null;

  const saveClient = () => {
    if (!clientDraft.name) return;
    setClients((c) => [...c, clientDraft]);
    setClientDraft(makeClientDraft(clients.length + 1));
    setShowClientForm(false);
  };

  const onSaveSurvey = (s: Survey) => {
    setSurveys((arr) => [...arr, s]);
    setClients((cs) => cs.map((c) => (c.id === s.clientId ? { ...c, lastVisit: s.date } : c)));
    setPhotoDialogOpen(false);
  };

  const openClient = (c: Client) => {
    setSelectedClientId(c.id);
    setTab('clients');
  };

  const onNewManual = () => {
    if (!selectedClient) return;
    const blank = makeManualSurvey(selectedClient.id, surveys.length);
    onSaveSurvey(blank);
  };

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
          />
        )}

        {tab === 'clients' && selectedClient && (
          <ClientDetail
            client={selectedClient}
            products={products}
            stocks={stocks}
            onStocksChange={setStocks}
            surveys={surveys}
            onBack={() => setSelectedClientId(null)}
            onNewSurveyFromPhoto={() => setPhotoDialogOpen(true)}
            onNewSurveyManual={onNewManual}
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

      {settingsOpen && <SettingsDialog onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
