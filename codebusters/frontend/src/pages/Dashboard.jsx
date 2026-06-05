import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatTime } from '../lib/time';
import { useAuth } from '../hooks/useAuth';

const GROUP_COLORS = { regular: 'var(--text-3)', special: '#2d8a60', divb: '#b45309' };
const GROUP_LABELS = { regular: 'Regular', special: 'Special', divb: 'Div B Only' };

function formatTotalTime(ms) {
  if (!ms || ms === '0') return '0s';
  const totalSec = Math.round(Number(ms) / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getStats().then(setStats).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageShell><p style={{ color: 'var(--text-3)', fontSize: 13 }}>loading...</p></PageShell>;
  if (error) return <PageShell><p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p></PageShell>;

  const groups = ['regular', 'special', 'divb'];
  const hasSolves = stats?.by_cipher?.length > 0;

  return (
    <PageShell>
      <style>{`
        .dash-header { flex-direction: row; align-items: baseline; }
        .overall-grid { grid-template-columns: repeat(4, 1fr); }
        .overall-grid-2 { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 600px) {
          .dash-header { flex-direction: column; gap: 12px; align-items: flex-start; }
          .overall-grid { grid-template-columns: repeat(2, 1fr); }
          .overall-grid-2 { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Header */}
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>{user?.username}</h1>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.06em' }}>
            {user?.school_name} · div {user?.division?.toUpperCase()}
          </p>
        </div>
        <Link to="/explorer" style={{
          fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase',
          border: '1px solid var(--border)', borderRadius: 3, padding: '6px 14px',
          whiteSpace: 'nowrap', alignSelf: 'flex-start', transition: 'all 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--border-2)'; }}
        onMouseLeave={e => { e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.borderColor='var(--border)'; }}
        >explorer →</Link>
      </div>

      {/* Overall stats */}
      {stats?.overall && hasSolves && (
        <div style={{ marginBottom: 40 }}>
          <SectionLabel>overall</SectionLabel>
          <div className="overall-grid" style={{
            display: 'grid', gap: 8, marginBottom: 8,
            background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, padding: 16,
          }}>
            <StatBox label="solves" value={stats.overall.total_solves} />
            <StatBox label="time spent" value={formatTotalTime(stats.overall.total_time_ms)} />
            <StatBox label="best" value={formatTime(stats.overall.best_time_ms)} />
            <StatBox label="overall avg" value={formatTime(stats.overall.overall_avg_ms)} />
          </div>
          <div className="overall-grid-2" style={{
            display: 'grid', gap: 8,
            background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, padding: 16,
          }}>
            <StatBox label="1mo avg" value={formatTime(stats.overall.avg_1mo_ms)} sub={stats.overall.solves_1mo ? `${stats.overall.solves_1mo} solves` : null} />
            <StatBox label="3mo avg" value={formatTime(stats.overall.avg_3mo_ms)} sub={stats.overall.solves_3mo ? `${stats.overall.solves_3mo} solves` : null} />
            <StatBox label="6mo avg" value={formatTime(stats.overall.avg_6mo_ms)} sub={stats.overall.solves_6mo ? `${stats.overall.solves_6mo} solves` : null} />
          </div>
        </div>
      )}

      {/* Per cipher */}
      {groups.map(group => {
        const rows = stats?.by_cipher?.filter(c => c.group_name === group) || [];
        if (!rows.length) return null;
        return (
          <div key={group} style={{ marginBottom: 40 }}>
            <SectionLabel color={GROUP_COLORS[group]}>{GROUP_LABELS[group]}</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {rows.map(cipher => <CipherRow key={cipher.cipher_type_id} cipher={cipher} />)}
            </div>
          </div>
        );
      })}

      {!hasSolves && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>no solves yet.</p>
          <Link to="/solve" style={{ fontSize: 13, color: 'var(--accent)' }}>start solving →</Link>
        </div>
      )}
    </PageShell>
  );
}

function StatBox({ label, value, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function CipherRow({ cipher }) {
  const [hov, setHov] = useState(false);

  const desktopRow = (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gap: 8, padding: '10px 12px', borderRadius: 3,
        alignItems: 'center', transition: 'background 0.1s',
        background: hov ? 'var(--bg-2)' : 'none',
        gridTemplateColumns: '160px repeat(5, 1fr)',
      }}
    >
      <span style={{ textAlign: 'left', fontSize: 13, color: 'var(--text-2)' }}>{cipher.cipher_name}</span>
      <StatCell label="best" value={formatTime(cipher.best_time_ms)} />
      <StatCell label="avg" value={formatTime(cipher.overall_avg_ms)} sub={`${cipher.total_solves}`} />
      <StatCell label="1mo" value={formatTime(cipher.avg_1mo_ms)} sub={cipher.solves_1mo ? `${cipher.solves_1mo}` : null} />
      <StatCell label="3mo" value={formatTime(cipher.avg_3mo_ms)} sub={cipher.solves_3mo ? `${cipher.solves_3mo}` : null} />
      <StatCell label="6mo" value={formatTime(cipher.avg_6mo_ms)} sub={cipher.solves_6mo ? `${cipher.solves_6mo}` : null} />
    </div>
  );

  const mobileCard = (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 4, padding: '12px 14px', marginBottom: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{cipher.cipher_name}</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{cipher.total_solves} solves</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <MiniStat label="best" value={formatTime(cipher.best_time_ms)} />
        <MiniStat label="avg" value={formatTime(cipher.overall_avg_ms)} />
        <MiniStat label="1mo" value={formatTime(cipher.avg_1mo_ms)} />
        <MiniStat label="3mo" value={formatTime(cipher.avg_3mo_ms)} />
        <MiniStat label="6mo" value={formatTime(cipher.avg_6mo_ms)} />
      </div>
    </div>
  );

  return (
    <>
      <style>{`.cd{display:block}.cm{display:none}@media(max-width:600px){.cd{display:none}.cm{display:block}}`}</style>
      <div className="cd">{desktopRow}</div>
      <div className="cm">{mobileCard}</div>
    </>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: value === '—' ? 'var(--text-3)' : 'var(--accent)' }}>{value}</div>
    </div>
  );
}

function StatCell({ label, value, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: value === '—' ? 'var(--text-3)' : 'var(--text)', fontWeight: 500 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children, color = 'var(--text-3)' }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function PageShell({ children }) {
  return <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>{children}</div>;
}
