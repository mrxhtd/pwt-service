import { useState } from 'react';
import { PARAMS, SEED_CLIENTS, SEED_SURVEYS } from './constants';
import type { Client, ParamKey, Survey } from './types';
import { ClientsTab } from './components/ClientsTab';
import { SurveysTab } from './components/SurveysTab';
import { Dashboard } from './components/Dashboard';
import { Header, type TabKey } from './components/Header';
import type { ClientDraft } from './components/ClientForm';
import type { SurveyDraft } from './components/SurveyForm';

type FilterStatus = 'All' | 'Active' | 'Follow-up' | 'Inactive';

function makeClientDraft(clientCount: number): ClientDraft {
  return {
    id: `CLT-${String(clientCount + 1).padStart(3, '0')}`,
    name: '',
    contact: '',
    phone: '',
    systemType: 'Cooling Tower',
    gallons: '',
    status: 'Active',
    lastVisit: '',
    nextVisit: '',
  };
}

function makeSurveyDraft(clientId: string, surveyCount: number): SurveyDraft {
  const base: Partial<SurveyDraft> = {
    id: `SRV-${String(surveyCount + 1).padStart(3, '0')}`,
    clientId,
    date: new Date().toISOString().slice(0, 10),
    gallons: '',
    notes: '',
  };
  for (const p of PARAMS) {
    (base as Record<string, string>)[p.key] = '';
  }
  return base as SurveyDraft;
}

function draftToSurvey(d: SurveyDraft): Survey {
  const out = {
    id: d.id,
    clientId: d.clientId,
    date: d.date,
    gallons: d.gallons === '' ? '' : Number(d.gallons),
    notes: d.notes,
  } as Survey;
  for (const p of PARAMS) {
    const v = d[p.key];
    (out as Record<ParamKey, number | ''>)[p.key] = v === '' ? '' : Number(v);
  }
  return out;
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('clients');
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
  const [surveys, setSurveys] = useState<Survey[]>(SEED_SURVEYS);

  const [showClientForm, setShowClientForm] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [surveyClient, setSurveyClient] = useState<Client | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');

  const [clientDraft, setClientDraft] = useState<ClientDraft>(() => makeClientDraft(clients.length));
  const [surveyDraft, setSurveyDraft] = useState<SurveyDraft>(() => makeSurveyDraft('', surveys.length));

  const saveClient = () => {
    if (!clientDraft.name) return;
    setClients((c) => [...c, clientDraft]);
    setClientDraft(makeClientDraft(clients.length + 1));
    setShowClientForm(false);
  };

  const saveSurvey = () => {
    if (!surveyDraft.clientId) return;
    const survey = draftToSurvey(surveyDraft);
    setSurveys((s) => [...s, survey]);
    setClients((cs) => cs.map((c) => (c.id === survey.clientId ? { ...c, lastVisit: survey.date } : c)));
    setSurveyDraft(makeSurveyDraft('', surveys.length + 1));
    setShowSurveyForm(false);
  };

  const openSurveyFor = (client: Client) => {
    setSurveyDraft(makeSurveyDraft(client.id, surveys.length));
    setSurveyClient(client);
    setShowSurveyForm(true);
    setTab('surveys');
  };

  const newSurveyFromTab = () => {
    setSurveyDraft(makeSurveyDraft(clients[0]?.id ?? '', surveys.length));
    setSurveyClient(null);
    setShowSurveyForm(true);
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f0f4f8', color: '#1e293b' }}>
      <Header
        tab={tab}
        onTab={setTab}
        clientCount={clients.length}
        surveyCount={surveys.length}
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {tab === 'clients' && (
          <ClientsTab
            clients={clients}
            surveys={surveys}
            filterStatus={filterStatus}
            onFilterStatus={setFilterStatus}
            showForm={showClientForm}
            onShowForm={setShowClientForm}
            clientDraft={clientDraft}
            onClientDraft={setClientDraft}
            onSaveClient={saveClient}
            onOpenSurveyFor={openSurveyFor}
          />
        )}

        {tab === 'surveys' && (
          <SurveysTab
            clients={clients}
            surveys={surveys}
            showForm={showSurveyForm}
            onShowForm={setShowSurveyForm}
            surveyDraft={surveyDraft}
            onSurveyDraft={setSurveyDraft}
            onSaveSurvey={saveSurvey}
            onNewSurvey={newSurveyFromTab}
            surveyClient={surveyClient}
          />
        )}

        {tab === 'dashboard' && <Dashboard clients={clients} surveys={surveys} />}
      </div>
    </div>
  );
}
