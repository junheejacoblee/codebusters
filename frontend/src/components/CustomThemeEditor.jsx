import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const FIELDS = [
  { key: 'bg',      label: 'background',     desc: 'main page bg' },
  { key: 'bg2',     label: 'background 2',   desc: 'cards, inputs' },
  { key: 'bg3',     label: 'background 3',   desc: 'hover, selected' },
  { key: 'border',  label: 'border',         desc: 'subtle dividers' },
  { key: 'border2', label: 'border 2',       desc: 'hover borders' },
  { key: 'text',    label: 'text',           desc: 'primary text' },
  { key: 'text2',   label: 'text 2',         desc: 'secondary text' },
  { key: 'text3',   label: 'text 3',         desc: 'muted text' },
  { key: 'accent',  label: 'accent',         desc: 'buttons, highlights' },
];

export default function CustomThemeEditor({ onClose }) {
  const { customVars, setCustomVars, setTheme } = useTheme();
  const [local, setLocal] = useState({ ...customVars });

  const update = (key, val) => {
    const next = { ...local, [key]: val };
    setLocal(next);
    setCustomVars(next); // live preview
    setTheme('custom');
  };

  const reset = () => {
    const defaults = { bg:'#0e0e0d', bg2:'#141413', bg3:'#1a1a18', border:'#252522', border2:'#2f2f2c', text:'#d4cfca', text2:'#888880', text3:'#555550', accent:'#e8e3d8' };
    setLocal(defaults);
    setCustomVars(defaults);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(3px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 6, padding: '24px 24px 20px',
        width: 420, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto',
        fontFamily: 'var(--mono)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.04em' }}>custom theme</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, letterSpacing: '0.06em' }}>
              experimental · changes apply live
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '2px 6px',
          }}>✕</button>
        </div>

        {/* Color fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FIELDS.map(f => (
            <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Color picker */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input
                  type="color"
                  value={local[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  style={{
                    width: 32, height: 32, borderRadius: 4,
                    border: '1px solid var(--border)', cursor: 'pointer',
                    padding: 2, background: 'var(--bg-2)',
                  }}
                />
              </div>
              {/* Hex input */}
              <input
                type="text"
                value={local[f.key]}
                onChange={e => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                    setLocal(l => ({ ...l, [f.key]: v }));
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) update(f.key, v);
                  }
                }}
                style={{
                  width: 90, background: 'var(--bg-2)', border: '1px solid var(--border)',
                  borderRadius: 3, color: 'var(--text)', fontSize: 12,
                  padding: '6px 8px', outline: 'none', fontFamily: 'var(--mono)',
                  letterSpacing: '0.04em',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-2)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {/* Label + desc */}
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', letterSpacing: '0.02em' }}>{f.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{f.desc}</div>
              </div>
              {/* Live swatch */}
              <div style={{
                marginLeft: 'auto', width: 20, height: 20, borderRadius: 3, flexShrink: 0,
                background: local[f.key], border: '1px solid var(--border)',
              }} />
            </div>
          ))}
        </div>

        {/* Preview strip */}
        <div style={{
          marginTop: 18, borderRadius: 4, overflow: 'hidden',
          border: '1px solid var(--border)', display: 'flex', height: 28,
        }}>
          {[local.bg, local.bg2, local.bg3, local.border, local.border2, local.text3, local.text2, local.text, local.accent].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 8 }}>
          <button
            onClick={reset}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 3,
              color: 'var(--text-3)', fontSize: 11, padding: '7px 14px',
              cursor: 'pointer', letterSpacing: '0.06em', fontFamily: 'var(--mono)',
            }}
          >
            reset to dark
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'var(--accent)', color: 'var(--bg)', border: 'none',
              borderRadius: 3, fontSize: 11, padding: '7px 20px',
              cursor: 'pointer', letterSpacing: '0.06em', fontWeight: 600,
              fontFamily: 'var(--mono)',
            }}
          >
            done
          </button>
        </div>
      </div>
    </div>
  );
}
