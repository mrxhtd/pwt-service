import { useState } from 'react';
import { ACCENT } from '../constants';
import type { Client, Product, StockMap, Survey } from '../types';
import { Badge } from './Badge';
import { StocksPanel } from './StocksPanel';
import { SurveysPanel } from './SurveysPanel';
import { StockForecast } from './StockForecast';
import { QuickLogSurvey } from './QuickLogSurvey';
import { WhatsAppButton } from './WhatsAppButton';
import { InvoiceButton } from './InvoiceButton';

interface ClientDetailProps {
  client: Client;
  products: Product[];
  stocks: StockMap;
  onStocksChange: (next: StockMap) => void;
  surveys: Survey[];
  onBack: () => void;
  onNewSurveyFromPhoto: () => void;
  onNewSurveyManual: () => void;
  onSubmitSurvey: (s: Survey) => void;
  surveyCount: number;
  onUpdateClient: (updated: Client) => void;
}

export function ClientDetail({
  client,
  products,
  stocks,
  onStocksChange,
  surveys,
  onBack,
  onNewSurveyFromPhoto,
  onNewSurveyManual,
  onSubmitSurvey,
  surveyCount,
  onUpdateClient,
}: ClientDetailProps) {
  const [showQuickLog, setShowQuickLog] = useState(false);
  const clientSurveys = surveys.filter((s) => s.clientId === client.id);
  const latestSurvey = clientSurveys[0] ?? null;

  return (
    <div>
      <button
        onClick={onBack}
        style={{ background: 'transparent', border: 'none', color: ACCENT, fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 14 }}
      >
        ← All clients
      </button>

      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏭</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{client.name}</div>
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{client.contact} · {client.phone}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Meta label="SYSTEM" value={client.systemType} />
          <Meta label="LAST VISIT" value={client.lastVisit || '—'} />
          <Meta label="NEXT VISIT" value={client.nextVisit || '—'} accent />
          <Badge status={client.status} />
        </div>
      </div>

      {/* Action bar: Quick Log + WhatsApp + Invoice */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowQuickLog(true)}
          style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          ⚡ Quick Log
        </button>
        {latestSurvey && (
          <WhatsAppButton
            phone={client.phone}
            contactName={client.contact}
            companyName={client.name}
            survey={latestSurvey}
          />
        )}
        <InvoiceButton client={client} products={products} stocks={stocks} />
      </div>

      {showQuickLog && (
        <div style={{ marginBottom: 16 }}>
          <QuickLogSurvey
            clientId={client.id}
            surveyCount={surveyCount}
            onSubmit={(s) => {
              onSubmitSurvey(s);
              setShowQuickLog(false);
            }}
            onCancel={() => setShowQuickLog(false)}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <StockForecast
          client={client}
          stocks={stocks}
          products={products}
          onSave={(fields) => {
            onUpdateClient({ ...client, ...fields });
          }}
        />
        <StocksPanel
          clientId={client.id}
          products={products}
          stocks={stocks}
          onChange={onStocksChange}
        />
        <SurveysPanel
          clientId={client.id}
          surveys={surveys}
          onNewFromPhoto={onNewSurveyFromPhoto}
          onNewManual={onNewSurveyManual}
        />
      </div>
    </div>
  );
}

function Meta({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: accent ? ACCENT : undefined }}>{value}</div>
    </div>
  );
}
