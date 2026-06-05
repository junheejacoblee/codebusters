import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ team_count: null, user_count: null });

  useEffect(() => {
    api.getTeamCount()
      .then(({ team_count, user_count }) => setStats({ team_count, user_count }))
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 32px 80px' }}>

      {/* Title */}
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 42, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 12 }}>
          codebusters
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
          science olympiad · cipher training
        </p>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
          a minimal training tool for science olympiad codebusters competitors.
          time your solves, track your progress, and analyze your performance
          across every cipher type.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
          works for division b and division c. log solves, view averages over
          rolling windows, and chart your improvement over time.
        </p>
      </div>

      {/* Stats badges */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 48, flexWrap: 'wrap' }}>
        <StatBadge value={stats.user_count} label="users" />
        <StatBadge value={stats.team_count} label="different teams" />
      </div>

      {/* CTA */}
      {user ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn to="/solve">start solving →</PrimaryBtn>
          <SecondaryBtn to="/dashboard">my dashboard</SecondaryBtn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <PrimaryBtn to="/register">get started →</PrimaryBtn>
            <SecondaryBtn to="/login">sign in</SecondaryBtn>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
            sign up to access the solve timer, dashboard, and explorer.
          </p>
        </div>
      )}

      {/* Feature list */}
      <div style={{ marginTop: 80, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          ['timer', 'count-up timer with pause, reset, and keyboard shortcuts'],
          ['17 ciphers', 'aristocrat, xenocrypt, hill, fractionated morse, and more'],
          ['dashboard', 'overall, 1mo, 3mo, 6mo averages and best times per cipher'],
          ['explorer', 'filter and chart raw solve data over time'],
          ['design', '20 themes inspired by monkeytype.com'],
        ].map(([label, desc]) => (
          <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', minWidth: 90, opacity: user ? 1 : 0.5 }}>
              {label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* Footer credit */}
      <div style={{
        marginTop: 0, paddingTop: 0, borderTop: '0px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', lineHeight: 1.7 }}>
          {' '}
          <a
            href="https://monkeytype.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-2)', borderBottom: '1px solid var(--border-2)', transition: 'color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            
          </a>
        </p>
      </div>
    </div>
  );
}

function StatBadge({ value, label }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 4, padding: '10px 16px',
    }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
        {value === null ? '—' : value}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}

function PrimaryBtn({ to, children }) {
  return (
    <Link to={to} style={{
      display: 'inline-block', background: 'var(--accent)', color: 'var(--bg)',
      border: 'none', borderRadius: 3, padding: '10px 24px',
      fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', textDecoration: 'none', transition: 'opacity 0.1s',
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</Link>
  );
}

function SecondaryBtn({ to, children }) {
  return (
    <Link to={to} style={{
      display: 'inline-block', background: 'transparent', color: 'var(--text-2)',
      border: '1px solid var(--border)', borderRadius: 3, padding: '10px 24px',
      fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', transition: 'all 0.1s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--accent)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
    >{children}</Link>
  );
}
