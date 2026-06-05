import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = themes.find(t => t.id === theme) || themes[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="change theme"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px solid var(--border)', borderRadius: 3,
          padding: '4px 10px', color: 'var(--text-3)', fontSize: 11,
          letterSpacing: '0.06em', transition: 'all 0.1s', fontFamily: 'var(--mono)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-2)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-3)'; }}
      >
        <Swatch bg={current.bg} accent={current.accent} />
        {current.label}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)',
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 4, padding: 6,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 2, width: 280, zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          maxHeight: '70vh', overflowY: 'auto',
        }}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: theme === t.id ? 'var(--bg-3)' : hovered === t.id ? 'var(--bg-3)' : 'none',
                border: `1px solid ${theme === t.id ? 'var(--border-2)' : 'transparent'}`,
                borderRadius: 3, padding: '7px 10px',
                color: theme === t.id ? 'var(--accent)' : 'var(--text-2)',
                fontSize: 11, letterSpacing: '0.04em', textAlign: 'left',
                width: '100%', fontFamily: 'var(--mono)', transition: 'all 0.08s',
                cursor: 'pointer',
              }}
            >
              <Swatch bg={t.bg} accent={t.accent} size={14} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.label}
              </span>
              {theme === t.id && <span style={{ marginLeft: 'auto', fontSize: 10, flexShrink: 0 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Swatch({ bg, accent, size = 12 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 2, flexShrink: 0,
      background: bg, border: `2px solid ${accent}`,
    }} />
  );
}
