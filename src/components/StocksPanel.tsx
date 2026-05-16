import { useState } from 'react';
import { ACCENT } from '../constants';
import type { Product, StockMap } from '../types';

interface StocksPanelProps {
  clientId: string;
  products: Product[];
  stocks: StockMap;
  onChange: (next: StockMap) => void;
}

export function StocksPanel({ clientId, products, stocks, onChange }: StocksPanelProps) {
  const setLevel = (productId: string, level: number) => {
    onChange({
      ...stocks,
      [clientId]: {
        ...(stocks[clientId] ?? {}),
        [productId]: level,
      },
    });
  };

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>📦 Product Stock</h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>{products.length} products</span>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {products.map((p) => {
          const level = stocks[clientId]?.[p.id] ?? 0;
          return <StockRow key={p.id} product={p} level={level} onChange={(v) => setLevel(p.id, v)} />;
        })}
      </div>
    </div>
  );
}

function StockRow({ product, level, onChange }: { product: Product; level: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(level));

  const startEdit = () => {
    setDraft(String(level));
    setEditing(true);
  };
  const commit = () => {
    const n = parseFloat(draft);
    onChange(Number.isFinite(n) && n >= 0 ? n : 0);
    setEditing(false);
  };
  const cancel = () => setEditing(false);

  const low = level <= 10;
  const empty = level <= 0;
  const accent = empty ? '#dc2626' : low ? '#f59e0b' : '#0ea5e9';
  const bg = empty ? '#fef2f2' : low ? '#fffbeb' : '#f8fafc';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: bg, borderRadius: 10, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{product.name}</div>
          {empty && <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Out of stock</div>}
          {!empty && low && <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Low stock</div>}
        </div>
      </div>
      {editing ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="number"
            min={0}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            style={{ width: 80, border: `1.5px solid ${ACCENT}`, borderRadius: 7, padding: '5px 8px', fontSize: 13, outline: 'none' }}
          />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{product.unit}</span>
          <button onClick={commit} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 7, padding: '5px 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Save</button>
          <button onClick={cancel} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '5px 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
        </div>
      ) : (
        <button
          onClick={startEdit}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 4, padding: 0 }}
        >
          <span style={{ fontSize: 18, fontWeight: 800, color: accent }}>{level.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{product.unit}</span>
          <span style={{ fontSize: 11, color: ACCENT, marginLeft: 6, fontWeight: 600 }}>Edit</span>
        </button>
      )}
    </div>
  );
}
