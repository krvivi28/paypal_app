import React, { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Shopping', 'Entertainment', 'Travel', 'Utilities', 'Other'];

export default function TransactionModal({ transaction, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    description: '', amount: '', type: 'DEBIT', category: 'Shopping', status: 'PENDING',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) setForm({ description: transaction.description, amount: transaction.amount, type: transaction.type, category: transaction.category, status: transaction.status });
  }, [transaction]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) return setError('Enter a valid amount');
    try { await onSave(form); onClose(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>{transaction ? 'Edit Transaction' : 'New Transaction'}</h3>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <input style={styles.input} value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Netflix Subscription" />
          </div>
          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Amount (USD)</label>
              <input style={styles.input} type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Type</label>
              <select style={styles.input} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="DEBIT">DEBIT</option>
                <option value="CREDIT">CREDIT</option>
              </select>
            </div>
          </div>
          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Category</label>
              <select style={styles.input} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {transaction && (
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Status</label>
                <select style={styles.input} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option>PENDING</option><option>COMPLETED</option><option>FAILED</option>
                </select>
              </div>
            )}
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.saveBtn} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 12, padding: 32, width: 480, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 600, color: '#1a202c' },
  close: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#718096' },
  field: { marginBottom: 16 },
  row: { display: 'flex', gap: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, outline: 'none', background: '#fff' },
  error: { background: '#fff5f5', color: '#c53030', borderRadius: 6, padding: '10px 12px', marginBottom: 12, fontSize: 13 },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 14 },
  saveBtn: { padding: '10px 24px', background: '#003087', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};
