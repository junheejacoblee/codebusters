import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FormPage, Field, SubmitBtn } from './Login';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '', division: '', school_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (v) => setForm(f => ({ ...f, [key]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/solve');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage title="create account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="email" type="email" value={form.email} onChange={set('email')} />
        <Field label="username" value={form.username} onChange={set('username')} />
        <Field label="password" type="password" value={form.password} onChange={set('password')} />
        <Field
          label="division"
          type="select"
          value={form.division}
          onChange={set('division')}
          options={[
            { value: 'b', label: 'Division B' },
            { value: 'c', label: 'Division C' },
            { value: 'other', label: 'Other / Alumni' },
          ]}
        />
        <Field label="school name" value={form.school_name} onChange={set('school_name')} placeholder="ex. Riverbend High School" />
        {error && <p style={{ fontSize: 12, color: 'var(--red)', letterSpacing: '0.04em' }}>{error}</p>}
        <SubmitBtn loading={loading}>{loading ? 'creating account...' : 'create account →'}</SubmitBtn>
      </form>
      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-3)' }}>
        have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)' }}>login</Link>
      </p>
    </FormPage>
  );
}
