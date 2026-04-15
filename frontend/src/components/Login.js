import React, { useState } from 'react';

export default function Login({ onLogin, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.pp}>Pay</span><span style={styles.pal}>Pal</span>
        </div>
        <h2 style={styles.title}>Transaction Dashboard</h2>
        <p style={styles.subtitle}>Sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin or user"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="password123 or user123"
              required
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.hint}>
          <strong>Demo credentials:</strong><br />
          admin / password123 &nbsp;|&nbsp; user / user123
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4f8' },
  card: { background: '#fff', borderRadius: 12, padding: '40px 48px', width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  logo: { textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8 },
  pp: { color: '#003087' },
  pal: { color: '#009cde' },
  title: { textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#1a202c', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: '#718096', marginBottom: 24, fontSize: 14 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, outline: 'none' },
  error: { background: '#fff5f5', color: '#c53030', borderRadius: 6, padding: '10px 12px', marginBottom: 12, fontSize: 13 },
  btn: { width: '100%', padding: '12px', background: '#003087', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  hint: { marginTop: 20, fontSize: 12, color: '#718096', background: '#f7fafc', borderRadius: 6, padding: '10px 12px', lineHeight: 1.8 },
};
