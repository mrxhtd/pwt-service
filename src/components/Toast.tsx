import { useEffect } from 'react';

interface ToastProps {
  message: string;
  action?: string;
  onAction?: () => void;
  onDismiss: () => void;
  variant?: 'info' | 'warning';
}

export function Toast({ message, action, onAction, onDismiss, variant = 'info' }: ToastProps) {
  useEffect(() => {
    if (!action) {
      const t = setTimeout(onDismiss, 6000);
      return () => clearTimeout(t);
    }
  }, [action, onDismiss]);

  const bg = variant === 'warning'
    ? 'linear-gradient(135deg, #f97316, #dc2626)'
    : 'linear-gradient(135deg, #0ea5e9, #0284c7)';

  return (
    <>
      <style>{`
        @keyframes toast-slide-up {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: bg,
          color: '#fff',
          borderRadius: 14,
          padding: '14px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: 'calc(100vw - 32px)',
          animation: 'toast-slide-up 0.3s ease-out',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{message}</span>
        {action && (
          <button
            onClick={onAction}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {action}
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: '0 4px', opacity: 0.7 }}
        >
          ×
        </button>
      </div>
    </>
  );
}
