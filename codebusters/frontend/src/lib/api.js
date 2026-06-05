const BASE = '/api';

function getToken() {
  return localStorage.getItem('cb_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // solves
  submitSolve: (body) => request('/solves', { method: 'POST', body: JSON.stringify(body) }),
  getStats: () => request('/solves/stats'),
  getRawSolves: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/solves/raw${qs ? '?' + qs : ''}`);
  },

  // delete
  deleteSolve: (id) => request(`/solves/${id}`, { method: 'DELETE' }),
  deleteAllSolves: () => request('/solves', { method: 'DELETE' }),

  // public
  getTeamCount: () => request('/public/team-count'),
  getCipherTypes: () => request('/public/cipher-types'),
};
