import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/solve');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage title="login">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
        <Field label="password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
        {error && <p style={{ fontSize: 12, color: 'var(--red)', letterSpacing: '0.04em' }}>{error}</p>}
        <SubmitBtn loading={loading}>{loading ? 'signing in...' : 'sign in →'}</SubmitBtn>
      </form>
      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-3)' }}>
        no account?{' '}
        <Link to="/register" style={{ color: 'var(--accent)' }}>register</Link>
      </p>
    </FormPage>
  );
}

export function FormPage({ title, children }) {
  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: '0 32px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.02em', marginBottom: 32 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export function Field({ label, type = 'text', value, onChange, options, placeholder }) {
  const inputStyle = {
    width: '100%',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    color: 'var(--text)',
    fontSize: 13,
    padding: '10px 12px',
    outline: 'none',
    transition: 'border-color 0.1s',
    letterSpacing: '0.02em',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle }}
          onFocus={e => e.target.style.borderColor = 'var(--border-2)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        >
          <option value="">select...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--border-2)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      )}
    </div>
  );
}

export function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        background: loading ? 'var(--bg-3)' : 'var(--accent)',
        color: loading ? 'var(--text-3)' : 'var(--bg)',
        border: 'none',
        borderRadius: 3,
        padding: '11px',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.06em',
        cursor: loading ? 'default' : 'pointer',
        marginTop: 6,
        transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  );
}
