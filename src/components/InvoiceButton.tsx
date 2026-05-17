import { useState } from 'react';
import { ACCENT } from '../constants';
import type { Client, Product, StockMap } from '../types';
import { generateInvoice } from '../lib/pdfInvoice';

interface InvoiceButtonProps {
  client: Client;
  products: Product[];
  stocks: StockMap;
}

interface LineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceButton({ client, products, stocks }: InvoiceButtonProps) {
  const [open, setOpen] = useState(false);
  const clientStocks = stocks[client.id] ?? {};

  const lowProducts = products.filter((p) => (clientStocks[p.id] ?? 0) <= 10);

  const [items, setItems] = useState<LineItem[]>(() =>
    lowProducts.map((p) => ({
      productId: p.id,
      quantity: Math.max(1, 50 - (clientStocks[p.id] ?? 0)),
      unitPrice: 45,
    }))
  );

  const updateItem = (idx: number, field: 'quantity' | 'unitPrice', val: number) => {
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));
  };

  const handleGenerate = () => {
    const invoiceItems = items
      .filter((it) => it.quantity > 0)
      .map((it) => ({
        product: products.find((p) => p.id === it.productId)!,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      }));
    if (invoiceItems.length === 0) return;
    generateInvoice(client, invoiceItems);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: 9,
          padding: '8px 14px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          color: '#334155',
        }}
      >
        📄 Generate Quote
      </button>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 16, marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Quote Line Items</h4>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>×</button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((it, idx) => {
          const prod = products.find((p) => p.id === it.productId);
          if (!prod) return null;
          return (
            <div key={it.productId} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{prod.name}</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={it.quantity}
                onChange={(e) => updateItem(idx, 'quantity', Math.max(0, +e.target.value))}
                style={{ width: 55, border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 6px', fontSize: 12, textAlign: 'center' }}
              />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{prod.unit}</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>@EGP</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={it.unitPrice}
                onChange={(e) => updateItem(idx, 'unitPrice', Math.max(0, +e.target.value))}
                style={{ width: 55, border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 6px', fontSize: 12, textAlign: 'center' }}
              />
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 16 }}>
          No low-stock products to quote.
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={items.length === 0}
        style={{
          width: '100%',
          marginTop: 12,
          padding: '12px 16px',
          borderRadius: 10,
          border: 'none',
          background: items.length > 0 ? ACCENT : '#e2e8f0',
          color: items.length > 0 ? '#fff' : '#94a3b8',
          fontSize: 14,
          fontWeight: 700,
          cursor: items.length > 0 ? 'pointer' : 'default',
        }}
      >
        Download PDF Quote
      </button>
    </div>
  );
}
