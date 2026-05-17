import { useState, useEffect } from 'react';
import { ACCENT } from '../constants';
import type { Client } from '../types';

interface StockForecastProps {
  client: Client;
  onSave: (updated: Pick<Client, 'currentStock' | 'avgDailyConsumption' | 'deliveryLeadTime'>) => void;
}

export function StockForecast({ client, onSave }: StockForecastProps) {
  const [currentStock, setCurrentStock] = useState(client.currentStock ?? 0);
  const [avgDaily, setAvgDaily] = useState(client.avgDailyConsumption ?? 0);
  const [leadTime, setLeadTime] = useState(client.deliveryLeadTime ?? 3);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset when client changes
  useEffect(() => {
    setCurrentStock(client.currentStock ?? 0);
    setAvgDaily(client.avgDailyConsumption ?? 0);
    setLeadTime(client.deliveryLeadTime ?? 3);
    setDirty(false);
    setSaved(false);
  }, [client.id, client.currentStock, client.avgDailyConsumption, client.deliveryLeadTime]);

  const daysRemaining = avgDaily > 0 ? Math.round((currentStock / avgDaily) * 10) / 10 : null;
  const needsReorder = daysRemaining !== null && daysRemaining <= leadTime;

  const handleSave = () => {
    onSave({ currentStock, avgDailyConsumption: avgDaily, deliveryLeadTime: leadTime });
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
    setSaved(false);
  };

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Stock Forecast</h3>
        {daysRemaining !== null && (
          <span
            style={{
              background: needsReorder ? 'linear-gradient(135deg, #f97316, #dc2626)' : '#dcfce7',
              color: needsReorder ? '#fff' : '#16a34a',
              borderRadius: 20,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {needsReorder ? `⚠️ Reorder Now` : `✅ ${daysRemaining}d remaining`}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <FieldRow
          label="Current Stock"
          unit="ton"
          value={currentStock}
          onChange={update(setCurrentStock)}
        />
        <FieldRow
          label="Avg. Daily Use"
          unit="ton/day"
          value={avgDaily}
          onChange={update(setAvgDaily)}
          step={0.1}
        />
        <FieldRow
          label="Delivery Lead Time"
          unit="days"
          value={leadTime}
          onChange={update(setLeadTime)}
          step={1}
          min={1}
        />
      </div>

      {/* Computed forecast bar */}
      {daysRemaining !== null && (
        <div style={{ marginTop: 14, background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Days Until Empty</span>
            <span style={{ fontWeight: 700, color: needsReorder ? '#dc2626' : '#16a34a' }}>{daysRemaining} days</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 3,
                width: `${Math.min(100, (daysRemaining / Math.max(leadTime * 3, 1)) * 100)}%`,
                background: needsReorder
                  ? 'linear-gradient(90deg, #dc2626, #f97316)'
                  : 'linear-gradient(90deg, #16a34a, #22c55e)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            {needsReorder
              ? `Stock will run out before delivery (lead time: ${leadTime}d)`
              : `Comfortable buffer above ${leadTime}-day lead time`}
          </div>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!dirty}
        style={{
          width: '100%',
          marginTop: 14,
          padding: '10px 16px',
          borderRadius: 9,
          border: 'none',
          background: dirty ? ACCENT : saved ? '#16a34a' : '#e2e8f0',
          color: dirty || saved ? '#fff' : '#94a3b8',
          fontSize: 13,
          fontWeight: 700,
          cursor: dirty ? 'pointer' : 'default',
          transition: 'background 0.2s',
        }}
      >
        {saved ? '✓ Saved' : dirty ? 'Save Changes' : 'No Changes'}
      </button>
    </div>
  );
}

function FieldRow({
  label,
  unit,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', flex: 1 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          style={{
            width: 70,
            border: '1.5px solid #e2e8f0',
            borderRadius: 8,
            padding: '7px 8px',
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
          }}
        />
        <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 40 }}>{unit}</span>
      </div>
    </div>
  );
}
