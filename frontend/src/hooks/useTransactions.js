import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('pp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('pp_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem('pp_token', data.token);
      sessionStorage.setItem('pp_user', JSON.stringify({ username: data.username, role: data.role }));
      setToken(data.token);
      setUser({ username: data.username, role: data.role });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    sessionStorage.clear();
    setToken('');
    setUser(null);
  };

  return { user, token, loading, error, login, logout };
}

export function useTransactions(token, filters) {
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`${API_BASE}/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setTransactions(data.data);
      setMeta(data.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, JSON.stringify(filters)]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const createTransaction = async (tx) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(tx),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchTransactions();
    return data;
  };

  const updateTransaction = async (id, tx) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(tx),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchTransactions();
    return data;
  };

  const deleteTransaction = async (id) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchTransactions();
  };

  return { transactions, meta, loading, error, refetch: fetchTransactions, createTransaction, updateTransaction, deleteTransaction };
}

export function useSummary(token) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSummary(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return { summary, loading };
}
