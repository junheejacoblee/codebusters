import { useState } from 'react';

const GROUP_LABEL_COLOR = { regular: 'var(--text-3)', special: '#2d8a60', divb: '#b45309' };
const GROUP_LABELS = { regular: 'Regular', special: 'Special', divb: 'Div B Only' };

export default function CipherSelector({ cipherTypes, onSelect, onCancel }) {
  const [selected, setSelected] = useState(null);
  const groups = ['regular', 'special', 'divb'];

  return (
    <>
      <style>{`
        .cs-modal {
          width: 560px; max-width: 94vw; max-height: 88vh;
          border-radius: 6px; padding: 28px 28px 22px;
        }
        @media (max-width: 600px) {
          .cs-modal {
            position: fixed !important; inset: auto 0 0 0 !important;
            width: 100% !important; max-width: 100% !important;
            max-height: 85vh !important;
            border-radius: 12px 12px 0 0 !important;
            padding: 20px 16px 32px !important;
            transform: none !important;
          }
          .cs-overlay { align-items: flex-end !important; }
        }
      `}</style>

      <div
        className="cs-overlay"
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(3px)',
        }}
        onClick={e => e.target === e.currentTarget && onCancel?.()}
      >
        <div className="cs-modal" style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          overflowY: 'auto',
        }}>
          {/* Handle bar for mobile */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-2)', borderRadius: 2 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 500 }}>
              select cipher type
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', opacity: 0.6 }}>choose one to log your solve</span>
          </div>

          {groups.map((group, gi) => {
            const ciphers = cipherTypes.filter(c => c.group_name === group);
            if (!ciphers.length) return null;
            return (
              <div key={group}>
                {gi > 0 && <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />}
                <div style={{ marginBottom: 4 }}>
                  <div style={{
                    fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
                    fontWeight: 700, marginBottom: 8, color: GROUP_LABEL_COLOR[group],
                  }}>
                    {GROUP_LABELS[group]}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 5 }}>
                    {ciphers.map(cipher => (
                      <Chip
                        key={cipher.id} label={cipher.name}
                        active={selected?.id === cipher.id}
                        onClick={() => setSelected(cipher)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {selected ? <><span>selected </span><span style={{ color: 'var(--accent)' }}>{selected.name}</span></> : 'none selected'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <GhostBtn onClick={onCancel}>cancel</GhostBtn>
              <ConfirmBtn disabled={!selected} onClick={() => selected && onSelect?.(selected)}>confirm →</ConfirmBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Chip({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={label}
      style={{
        background: active ? 'var(--bg-3)' : hov ? 'var(--bg-2)' : 'var(--bg-2)',
        border: `1px solid ${active ? 'var(--accent)' : hov ? 'var(--border-2)' : 'var(--border)'}`,
        borderRadius: 3, padding: '10px 12px', fontSize: 12,
        color: active ? 'var(--accent)' : hov ? 'var(--text)' : 'var(--text-2)',
        cursor: 'pointer', textAlign: 'left', letterSpacing: '0.02em',
        transition: 'all 0.08s', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis',
        fontFamily: 'var(--mono)', lineHeight: 1,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  );
}

function GhostBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em',
      padding: '10px 18px', borderRadius: 3,
      background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)',
      touchAction: 'manipulation',
    }}>
      {children}
    </button>
  );
}

function ConfirmBtn({ disabled, onClick, children }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{
      fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em',
      padding: '10px 18px', borderRadius: 3,
      background: disabled ? 'var(--bg-3)' : 'var(--accent)',
      border: `1px solid ${disabled ? 'var(--border)' : 'var(--accent)'}`,
      color: disabled ? 'var(--text-3)' : 'var(--bg)',
      cursor: disabled ? 'default' : 'pointer',
      touchAction: 'manipulation',
    }}>
      {children}
    </button>
  );
}
