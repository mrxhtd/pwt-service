import { ACCENT, PARAMS } from '../constants';
import { getStatus } from '../lib/status';
import type { Client, Survey } from '../types';
import { Badge } from './Badge';

interface DashboardProps {
  clients: Client[];
  surveys: Survey[];
}

interface Alert {
  site: string;
  date: string;
  param: string;
  val: number | '';
  unit: string;
  min: number;
  max: number;
}

export function Dashboard({ clients, surveys }: DashboardProps) {
  const totalGallons = clients.reduce((a, c) => a + Number(c.gallons || 0), 0);

  const kpis = [
    { label: 'Total Clients',     val: clients.length,                                                   icon: '🏢', color: '#0ea5e9' },
    { label: 'Active Sites',      val: clients.filter((c) => c.status === 'Active').length,             icon: '✅', color: '#10b981' },
    { label: 'Follow-up Required',val: clients.filter((c) => c.status === 'Follow-up').length,          icon: '⚠️', color: '#f59e0b' },
    { label: 'Total Surveys',     val: surveys.length,                                                   icon: '🧪', color: '#8b5cf6' },
    { label: 'Total Gallons',     val: totalGallons.toLocaleString(),                                    icon: '💧', color: '#06b6d4' },
  ];

  const upcoming = [...clients]
    .filter((c) => c.nextVisit)
    .sort((a, b) => (a.nextVisit > b.nextVisit ? 1 : -1));

  const alerts: Alert[] = [];
  for (const s of surveys) {
    const client = clients.find((c) => c.id === s.clientId);
    for (const p of PARAMS) {
      if (getStatus(s[p.key], p.min, p.max) === 'out') {
        alerts.push({
          site: client?.name ?? s.clientId,
          date: s.date,
          param: p.label,
          val: s[p.key],
          unit: p.unit,
          min: p.min,
          max: p.max,
        });
      }
    }
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>📅 Upcoming Follow-ups</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {upcoming.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                <Badge status={c.status} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: ACCENT }}>{c.nextVisit}</span>
            </div>
          ))}
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={{ background: '#fff', border: '1.5px solid #fecaca', borderRadius: 14, padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#dc2626' }}>⚠️ Out of Range Alerts</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fef2f2', borderRadius: 10 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{a.site}</span>
                  <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>{a.date}</span>
                </div>
                <div style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>{a.param}:</span>
                  <span style={{ marginLeft: 4, fontWeight: 700 }}>{a.val} {a.unit}</span>
                  <span style={{ color: '#94a3b8', fontSize: 11, marginLeft: 6 }}>(range: {a.min}–{a.max})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
