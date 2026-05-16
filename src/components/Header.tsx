import { ACCENT } from '../constants';

export type TabKey = 'clients' | 'dashboard';

interface NavItem {
  key: TabKey;
  label: string;
  badge: number | null;
}

interface HeaderProps {
  tab: TabKey;
  onTab: (t: TabKey) => void;
  clientCount: number;
  onOpenSettings: () => void;
}

export function Header({ tab, onTab, clientCount, onOpenSettings }: HeaderProps) {
  const nav: NavItem[] = [
    { key: 'clients',   label: '🏢 Clients',   badge: clientCount },
    { key: 'dashboard', label: '📊 Dashboard', badge: null },
  ];

  return (
    <div style={{ background: '#0f172a', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>💧</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>PWT Service</span>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {nav.map((n) => (
          <button
            key={n.key}
            onClick={() => onTab(n.key)}
            style={{ background: tab === n.key ? ACCENT : 'transparent', color: tab === n.key ? '#fff' : '#94a3b8', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {n.label}
            {n.badge !== null && (
              <span style={{ background: tab === n.key ? 'rgba(255,255,255,0.25)' : '#1e293b', color: tab === n.key ? '#fff' : '#94a3b8', borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>
                {n.badge}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{ background: 'transparent', color: '#94a3b8', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}
        >
          ⚙
        </button>
      </div>
    </div>
  );
}
