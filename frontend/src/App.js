import React, { useState } from 'react';
import Login from './components/Login';
import SummaryCards from './components/SummaryCards';
import Filters from './components/Filters';
import TransactionTable from './components/TransactionTable';
import Pagination from './components/Pagination';
import TransactionModal from './components/TransactionModal';
import { useAuth, useTransactions, useSummary } from './hooks/useTransactions';

export default function App() {
  const { user, token, loading: authLoading, error: authError, login, logout } = useAuth();
  const [filters, setFilters] = useState({ page: 1, limit: 10, sortBy: 'date', order: 'desc' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const { transactions, meta, loading, error, createTransaction, updateTransaction, deleteTransaction } = useTransactions(token, filters);
  const { summary, loading: summaryLoading } = useSummary(token);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async (form) => {
    setActionLoading(true);
    try {
      if (editingTx) { await updateTransaction(editingTx.id, form); showToast('Transaction updated!'); }
      else { await createTransaction(form); showToast('Transaction created!'); }
    } finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try { await deleteTransaction(id); showToast('Transaction deleted!'); }
    catch (e) { showToast(`Error: ${e.message}`); }
    finally { setActionLoading(false); }
  };

  if (!user) return <Login onLogin={login} loading={authLoading} error={authError} />;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}><span style={{ color: '#fff' }}>Pay</span><span style={{ color: '#ffc439' }}>Pal</span></div>
        <h1 style={styles.heading}>Transaction Dashboard</h1>
        <div style={styles.userArea}>
          <span style={styles.userBadge}>{user.role === 'ADMIN' ? '🛡 ' : '👤 '}{user.username}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Summary */}
        <SummaryCards summary={summary} loading={summaryLoading} />

        {/* Controls */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>Transactions</h2>
            <button style={styles.newBtn} onClick={() => { setEditingTx(null); setModalOpen(true); }}>+ New Transaction</button>
          </div>

          <Filters filters={filters} onChange={setFilters} />

          <TransactionTable
            transactions={transactions}
            loading={loading}
            error={error}
            onEdit={(tx) => { setEditingTx(tx); setModalOpen(true); }}
            onDelete={handleDelete}
            isAdmin={user.role === 'ADMIN'}
          />

          <Pagination meta={meta} onPageChange={(p) => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <TransactionModal
          transaction={editingTx}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTx(null); }}
          loading={actionLoading}
        />
      )}

      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f4f8' },
  header: { background: '#003087', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
  logo: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
  heading: { flex: 1, color: '#fff', fontSize: 18, fontWeight: 600 },
  userArea: { display: 'flex', alignItems: 'center', gap: 12 },
  userBadge: { color: '#e2e8f0', fontSize: 13 },
  logoutBtn: { padding: '6px 16px', background: 'transparent', border: '1px solid #fff', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  main: { padding: '28px 32px', maxWidth: 1280, margin: '0 auto' },
  tableCard: { background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tableTitle: { fontSize: 17, fontWeight: 600, color: '#1a202c' },
  newBtn: { padding: '9px 20px', background: '#003087', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  toast: { position: 'fixed', bottom: 28, right: 28, background: '#2d3748', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 200 },
};
