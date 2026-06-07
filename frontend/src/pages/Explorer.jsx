import { useState, useEffect, useCallback } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine,
} from 'recharts';
import { api } from '../lib/api';
import { formatTime } from '../lib/time';

export default function Explorer() {
  const [solves, setSolves] = useState([]);
  const [cipherTypes, setCipherTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ cipher_type_id: '', from: '', to: '' });
  const [chartType, setChartType] = useState('scatter');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.cipher_type_id) params.cipher_type_id = filters.cipher_type_id;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const { solves } = await api.getRawSolves(params);
      setSolves(solves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    api.getCipherTypes()
      .then(({ cipher_types }) => setCipherTypes(cipher_types))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.deleteSolve(id);
      setSolves(s => s.filter(x => x.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      await api.deleteAllSolves();
      setSolves([]);
      setShowDeleteAll(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingAll(false);
    }
  };

  const chartData = [...solves]
    .sort((a, b) => new Date(a.solved_at) - new Date(b.solved_at))
    .map((s, i) => ({
      x: new Date(s.solved_at).getTime(),
      y: s.time_ms,
      index: i + 1,
      cipher: s.cipher_name,
      date: new Date(s.solved_at).toLocaleDateString(),
      time: formatTime(s.time_ms),
    }));

  const avgMs = solves.length ? Math.round(solves.reduce((a, s) => a + s.time_ms, 0) / solves.length) : null;
  const bestMs = solves.length ? Math.min(...solves.map(s => s.time_ms)) : null;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em', marginBottom: 6 }}>
          explorer
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
          filter and chart your raw solve history
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <FilterField label="cipher">
          <select
            value={filters.cipher_type_id}
            onChange={e => setFilters(f => ({ ...f, cipher_type_id: e.target.value }))}
            style={selectStyle}
          >
            <option value="">all ciphers</option>
            {['regular', 'special', 'divb'].map(group => {
              const gCiphers = cipherTypes.filter(c => c.group_name === group);
              if (!gCiphers.length) return null;
              return (
                <optgroup key={group} label={group === 'divb' ? 'Div B Only' : group.charAt(0).toUpperCase() + group.slice(1)}>
                  {gCiphers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              );
            })}
          </select>
        </FilterField>

        <FilterField label="from">
          <input type="date" value={filters.from}
            onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
            style={selectStyle} />
        </FilterField>

        <FilterField label="to">
          <input type="date" value={filters.to}
            onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
            style={selectStyle} />
        </FilterField>

        {(filters.cipher_type_id || filters.from || filters.to) && (
          <button onClick={() => setFilters({ cipher_type_id: '', from: '', to: '' })}
            style={{ ...ghostBtnStyle, alignSelf: 'flex-end' }}>
            clear
          </button>
        )}
      </div>

      {/* Summary chips */}
      {solves.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <Chip label="solves" value={solves.length} />
          <Chip label="best" value={formatTime(bestMs)} />
          <Chip label="avg" value={formatTime(avgMs)} />
        </div>
      )}

      {/* Chart type toggle */}
      {solves.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['scatter', 'line'].map(t => (
            <button key={t} onClick={() => setChartType(t)} style={{
              background: chartType === t ? 'var(--bg-3)' : 'none',
              border: `1px solid ${chartType === t ? 'var(--border-2)' : 'var(--border)'}`,
              borderRadius: 3, color: chartType === t ? 'var(--accent)' : 'var(--text-3)',
              fontSize: 11, padding: '5px 14px', cursor: 'pointer',
              fontFamily: 'var(--mono)', letterSpacing: '0.06em',
            }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 12 }}>
          loading...
        </div>
      ) : solves.length === 0 ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13, flexDirection: 'column', gap: 8 }}>
          <span>no solves found</span>
          <span style={{ fontSize: 11, opacity: 0.5 }}>try adjusting your filters</span>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 8px 8px' }}>
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'scatter' ? (
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="x" type="number" domain={['auto', 'auto']} scale="time"
                  tickFormatter={v => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--mono)' }}
                  axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis dataKey="y" tickFormatter={v => formatTime(v)}
                  tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--mono)' }}
                  axisLine={{ stroke: 'var(--border)' }} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                {avgMs && <ReferenceLine y={avgMs} stroke="var(--text-3)" strokeDasharray="4 4" />}
                <Scatter data={chartData} fill="var(--accent)" opacity={0.75} />
              </ScatterChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date"
                  tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--mono)' }}
                  axisLine={{ stroke: 'var(--border)' }} tickLine={false} interval="preserveStartEnd" />
                <YAxis dataKey="y" tickFormatter={v => formatTime(v)}
                  tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--mono)' }}
                  axisLine={{ stroke: 'var(--border)' }} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                {avgMs && <ReferenceLine y={avgMs} stroke="var(--text-3)" strokeDasharray="4 4" />}
                <Line type="monotone" dataKey="y" stroke="var(--accent)"
                  dot={{ fill: 'var(--accent)', r: 3 }} strokeWidth={1.5} />
              </LineChart>
            )}
          </ResponsiveContainer>
          {avgMs && (
            <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'right', paddingRight: 16, marginTop: 4, letterSpacing: '0.06em' }}>
              — avg {formatTime(avgMs)}
            </div>
          )}
        </div>
      )}

      {/* Raw table */}
      {solves.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
              raw data
            </div>
            <button onClick={() => setShowDeleteAll(true)} style={{
              ...ghostBtnStyle, color: 'var(--red)', borderColor: 'transparent', fontSize: 11,
            }}>
              delete all solves
            </button>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 36px',
              padding: '8px 16px',
              background: 'var(--bg-2)',
              fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
              borderBottom: '1px solid var(--border)',
            }}>
              <span>cipher</span><span>time</span><span>date</span><span />
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {solves.map(s => (
                <div key={s.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 36px',
                  padding: '9px 16px', fontSize: 12,
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                  transition: 'background 0.08s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ color: 'var(--text-2)' }}>{s.cipher_name}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatTime(s.time_ms)}</span>
                  <span style={{ color: 'var(--text-3)' }}>
                    {new Date(s.solved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    title="delete this solve"
                    style={{
                      background: 'none', border: 'none',
                      color: deletingId === s.id ? 'var(--text-3)' : 'var(--text-3)',
                      fontSize: 14, cursor: 'pointer', padding: '2px 6px',
                      borderRadius: 3, transition: 'color 0.1s',
                      fontFamily: 'var(--mono)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >
                    {deletingId === s.id ? '...' : '×'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete all confirm modal */}
      {showDeleteAll && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(3px)',
        }}
        onClick={e => e.target === e.currentTarget && setShowDeleteAll(false)}
        >
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '28px 32px', maxWidth: 380, width: '90vw',
            fontFamily: 'var(--mono)',
          }}>
            <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 10 }}>
              delete all solves?
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 24 }}>
              this will permanently delete all {solves.length} solve{solves.length !== 1 ? 's' : ''} in your current filter. this cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteAll(false)} style={ghostBtnStyle}>
                cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deletingAll}
                style={{
                  background: 'var(--red)', color: '#fff', border: 'none',
                  borderRadius: 3, padding: '8px 20px', fontSize: 12,
                  letterSpacing: '0.06em', cursor: deletingAll ? 'default' : 'pointer',
                  opacity: deletingAll ? 0.6 : 1, fontFamily: 'var(--mono)',
                  transition: 'opacity 0.1s',
                }}
              >
                {deletingAll ? 'deleting...' : 'delete all'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 3,
  color: 'var(--text)', fontSize: 12, padding: '8px 12px', outline: 'none',
  fontFamily: 'var(--mono)', letterSpacing: '0.02em', minWidth: 160,
};

const ghostBtnStyle = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 3,
  color: 'var(--text-3)', fontSize: 11, padding: '6px 14px', cursor: 'pointer',
  letterSpacing: '0.06em', fontFamily: 'var(--mono)', transition: 'all 0.1s',
};

function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 3, padding: '6px 14px',
      display: 'flex', gap: 8, alignItems: 'center',
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{value}</span>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 4, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{d.time}</div>
      <div style={{ color: 'var(--text-3)', marginTop: 2 }}>{d.cipher}</div>
      <div style={{ color: 'var(--text-3)' }}>{d.date}</div>
    </div>
  );
}
