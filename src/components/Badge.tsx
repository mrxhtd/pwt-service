import { STATUS_COLORS } from '../constants';
import type { Status } from '../types';

export function Badge({ status }: { status: Status }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS['Active'];
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}
