import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';
import { formatTime } from '../lib/time';
import CipherSelector from '../components/CipherSelector';

const STATES = { IDLE: 'idle', RUNNING: 'running', PAUSED: 'paused', DONE: 'done' };

function parseTimeInput(str) {
  str = str.trim();
  const mMatch = str.match(/^(\d+):(\d{1,2})(?:\.(\d+))?$/);
  if (mMatch) {
    const mins = parseInt(mMatch[1]);
    const secs = parseInt(mMatch[2]);
    const frac = mMatch[3] ? parseFloat('0.' + mMatch[3]) : 0;
    return Math.round((mins * 60 + secs + frac) * 1000);
  }
  const sMatch = str.match(/^(\d+)(?:\.(\d+))?$/);
  if (sMatch) {
    const secs = parseInt(sMatch[1]);
    const frac = sMatch[2] ? parseFloat('0.' + sMatch[2]) : 0;
    return Math.round((secs + frac) * 1000);
  }
  return null;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Solve() {
  const [timerState, setTimerState] = useState(STATES.IDLE);
  const [elapsed, setElapsed] = useState(0);
  const [showSelector, setShowSelector] = useState(false);
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [cipherTypes, setCipherTypes] = useState([]);
  const [lastSolve, setLastSolve] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Manual entry
  const [manualOpen, setManualOpen] = useState(false);
  const [manualTime, setManualTime] = useState('');
  const [manualDate, setManualDate] = useState(today());
  const [manualError, setManualError] = useState('');
  const [manualHovered, setManualHovered] = useState(false);
  const manualTimeRef = useRef(null);

  const intervalRef = useRef(null);
  const startRef = useRef(0);
  const accRef = useRef(0);

  useEffect(() => {
    api.getCipherTypes().then(({ cipher_types }) => setCipherTypes(cipher_types)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        if (timerState === STATES.IDLE || timerState === STATES.PAUSED) startTimer();
        else if (timerState === STATES.RUNNING) pauseTimer();
      }
      if (e.code === 'KeyR' && !isInput) reset();
      if (e.code === 'KeyM' && !isInput) {
        e.preventDefault();
        setManualOpen(true);
        setTimeout(() => manualTimeRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && manualOpen) setManualOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [timerState, manualOpen]);

  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(accRef.current + (Date.now() - startRef.current));
    }, 50);
    setTimerState(STATES.RUNNING);
  }, []);

  const pauseTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    accRef.current += Date.now() - startRef.current;
    setTimerState(STATES.PAUSED);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    accRef.current += Date.now() - startRef.current;
    setElapsed(accRef.current);
    setTimerState(STATES.DONE);
    setShowSelector(true);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    accRef.current = 0;
    setElapsed(0);
    setTimerState(STATES.IDLE);
    setShowSelector(false);
    setSubmitError('');
  }, []);

  const handleCipherSelect = async (cipher) => {
    setShowSelector(false);
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.submitSolve({ cipher_type_id: cipher.id, time_ms: Math.round(accRef.current) });
      setLastSolve({ cipher, time_ms: Math.round(accRef.current), date: today() });
      reset();
    } catch (err) {
      setSubmitError(err.message);
      setTimerState(STATES.DONE);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    setManualError('');
    const ms = parseTimeInput(manualTime);
    if (!ms || ms <= 0) { setManualError('enter a valid time — e.g. 1:23.4 or 83.4'); return; }
    if (!manualDate) { setManualError('pick a date'); return; }
    setShowManualSelector(true);
  };

  const handleManualCipherSelect = async (cipher) => {
    setShowManualSelector(false);
    const ms = parseTimeInput(manualTime);
    setSubmitting(true);
    setManualError('');
    try {
      await api.submitSolve({
        cipher_type_id: cipher.id,
        time_ms: ms,
        solved_at: new Date(manualDate).toISOString(),
      });
      setLastSolve({ cipher, time_ms: ms, date: manualDate });
      setManualTime('');
      setManualDate(today());
      setManualOpen(false);
    } catch (err) {
      setManualError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isRunning = timerState === STATES.RUNNING;
  const isDone = timerState === STATES.DONE;
  const isIdle = timerState === STATES.IDLE;
  const isPaused = timerState === STATES.PAUSED;
  const timerColor = isRunning ? 'var(--accent)' : isPaused ? 'var(--text-1)' : isDone ? 'var(--text-1)' : 'var(--text-1)';

  const inputStyle = {
    background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 3,
    color: 'var(--text)', fontSize: 13, padding: '9px 12px', outline: 'none',
    fontFamily: 'var(--mono)', letterSpacing: '0.02em', transition: 'border-color 0.1s', width: '100%',
  };

  return (
    <>
      <style>{`
        .solve-timer { font-size: 72px; }
        .solve-hint { display: flex; }
        .manual-row { flex-direction: row; align-items: flex-end; }
        .manual-panel {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
        }
        .manual-panel.open {
          max-height: 200px;
          opacity: 1;
        }
        @media (max-width: 600px) {
          .solve-timer { font-size: 52px; }
          .solve-hint { display: none; }
          .manual-row { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 'calc(100vh - 52px)',
        padding: '32px 16px 100px', gap: 36,
        transition: 'padding-top 0.35s ease',
      }}>

        {/* Timer */}
        <div style={{ textAlign: 'center' }}>
          <div className="solve-timer" style={{
            fontWeight: 700, color: timerColor,
            letterSpacing: '-0.03em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums', transition: 'color 0.2s',
          }}>
            {formatTime(elapsed)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 10 }}>
            {isIdle ? 'ready' : isRunning ? 'solving...' : isPaused ? 'paused' : 'stopped'}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {(isIdle || isPaused) && <PrimaryBtn onClick={startTimer}>{isIdle ? 'start' : 'resume'}</PrimaryBtn>}
          {isRunning && <GhostBtn onClick={pauseTimer}>pause</GhostBtn>}
          {isRunning && <PrimaryBtn onClick={stopTimer}>stop + log</PrimaryBtn>}
          {(isPaused || isDone) && <GhostBtn onClick={reset}>reset</GhostBtn>}
          {isDone && !submitting && <PrimaryBtn onClick={() => setShowSelector(true)}>select cipher →</PrimaryBtn>}
        </div>

        {submitting && <p style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.06em' }}>saving...</p>}
        {submitError && <p style={{ fontSize: 12, color: 'var(--red)' }}>{submitError}</p>}

        {lastSolve && (
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '12px 20px',
            display: 'flex', gap: 16, alignItems: 'center',
            fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap', justifyContent: 'center',
          }}>
            <span style={{ color: 'var(--green)' }}>✓ logged</span>
            <span style={{ color: 'var(--text-2)' }}>{lastSolve.cipher.name}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatTime(lastSolve.time_ms)}</span>
            <span>{lastSolve.date}</span>
          </div>
        )}
      </div>

      {/* ── Bottom bar: manual entry + keyboard hints ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        {/* Manual entry panel — slides up from bottom */}
        <div
          className={`manual-panel${manualOpen ? ' open' : ''}`}
          style={{
            width: '100%', maxWidth: 520,
            background: 'var(--bg-2)', borderTop: '1px solid var(--border)',
            borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
            borderRadius: '6px 6px 0 0',
            padding: manualOpen ? '18px 20px 12px' : '0 20px',
            pointerEvents: 'all',
          }}
        >
          <div className="manual-row" style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>time</label>
              <input
                ref={manualTimeRef}
                type="text"
                placeholder="1:23.4 or 83.4"
                value={manualTime}
                onChange={e => setManualTime(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--border-2)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>date</label>
              <input
                type="date"
                value={manualDate}
                max={today()}
                onChange={e => setManualDate(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--border-2)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 10, color: 'transparent' }}>_</label>
              <button
                onClick={handleManualSubmit}
                disabled={submitting || !manualTime}
                style={{
                  background: manualTime ? 'var(--accent)' : 'var(--bg-3)',
                  color: manualTime ? 'var(--bg)' : 'var(--text-3)',
                  border: '1px solid var(--border)', borderRadius: 3,
                  padding: '9px 18px', fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.06em', cursor: manualTime ? 'pointer' : 'default',
                  fontFamily: 'var(--mono)', transition: 'all 0.1s', whiteSpace: 'nowrap',
                }}
              >log →</button>
            </div>
          </div>
          {manualError && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 8, letterSpacing: '0.02em' }}>{manualError}</p>}
        </div>

        {/* Bottom hint bar */}
        <div style={{
          width: '100%', maxWidth: 520,
          background: 'var(--bg)',
          borderTop: manualOpen ? 'none' : '1px solid var(--border)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'all',
        }}>
          {/* Manual entry trigger */}
          <button
            onClick={() => {
              setManualOpen(o => !o);
              if (!manualOpen) setTimeout(() => manualTimeRef.current?.focus(), 60);
            }}
            onMouseEnter={() => setManualHovered(true)}
            onMouseLeave={() => setManualHovered(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, letterSpacing: '0.08em',
              color: manualOpen ? 'var(--accent)' : manualHovered ? 'var(--text-2)' : 'var(--text-3)',
              fontFamily: 'var(--mono)', padding: 0,
              transition: 'color 0.15s',
              opacity: manualOpen || manualHovered ? 1 : 0.45,
            }}
          >
            {manualOpen ? '↓ close manual entry' : '+ manual entry'}
          </button>

          {/* Keyboard hints — desktop only */}
          <div className="solve-hint" style={{ gap: 16, fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
            <span><Kbd>space</Kbd> start / pause</span>
            <span><Kbd>r</Kbd> reset</span>
            <span><Kbd>m</Kbd> manual</span>
          </div>
        </div>
      </div>

      {showSelector && (
        <CipherSelector cipherTypes={cipherTypes} onSelect={handleCipherSelect} onCancel={() => setShowSelector(false)} />
      )}
      {showManualSelector && (
        <CipherSelector cipherTypes={cipherTypes} onSelect={handleManualCipherSelect} onCancel={() => setShowManualSelector(false)} />
      )}
    </>
  );
}

function PrimaryBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--accent)', color: 'var(--bg)', border: 'none',
      borderRadius: 3, padding: '14px 28px', fontSize: 14, fontWeight: 500,
      letterSpacing: '0.06em', fontFamily: 'var(--mono)', transition: 'opacity 0.1s',
      minWidth: 120, touchAction: 'manipulation',
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</button>
  );
}

function GhostBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', color: 'var(--text-2)',
      border: '1px solid var(--border)', borderRadius: 3,
      padding: '14px 24px', fontSize: 14, letterSpacing: '0.06em',
      transition: 'all 0.1s', fontFamily: 'var(--mono)',
      minWidth: 100, touchAction: 'manipulation',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--accent)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
    >{children}</button>
  );
}

function Kbd({ children }) {
  return (
    <span style={{
      background: 'var(--bg-3)', border: '1px solid var(--border)',
      borderRadius: 3, padding: '1px 6px', fontSize: 10, marginRight: 2,
    }}>{children}</span>
  );
}
