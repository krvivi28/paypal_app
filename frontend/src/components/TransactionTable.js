import React from 'react';

const STATUS_COLOR = { COMPLETED: '#38a169', PENDING: '#d69e2e', FAILED: '#e53e3e' };
const TYPE_COLOR = { CREDIT: '#38a169', DEBIT: '#e53e3e' };

export default function TransactionTable({ transactions, loading, error, onEdit, onDelete, isAdmin }) {
  if (loading) return <div style={styles.center}>⏳ Loading transactions...</div>;
  if (error) return <div style={styles.errBox}>⚠️ {error}</div>;
  if (!transactions.length) return <div style={styles.center}>No transactions found.</div>;

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            {['Description','Amount','Type','Category','Status','Date','Actions'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={tx.id} style={{ ...styles.tr, background: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
              <td style={styles.td}>{tx.description}</td>
              <td style={{ ...styles.td, fontWeight: 600, color: TYPE_COLOR[tx.type] }}>
                {tx.type === 'CREDIT' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
              </td>
              <td style={styles.td}>
                <span style={{ ...styles.badge, background: tx.type === 'CREDIT' ? '#c6f6d5' : '#fed7d7', color: TYPE_COLOR[tx.type] }}>
                  {tx.type}
                </span>
              </td>
              <td style={styles.td}>{tx.category}</td>
              <td style={styles.td}>
                <span style={{ ...styles.badge, background: '#edf2f7', color: STATUS_COLOR[tx.status] }}>
                  {tx.status}
                </span>
              </td>
              <td style={styles.td}>{new Date(tx.date).toLocaleDateString()}</td>
              <td style={styles.td}>
                <button style={styles.editBtn} onClick={() => onEdit(tx)}>Edit</button>
                {isAdmin && (
                  <button style={styles.delBtn} onClick={() => { if(window.confirm('Delete this transaction?')) onDelete(tx.id); }}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrapper: { overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  thead: { background: '#f7fafc' },
  th: { padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#4a5568', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' },
  tr: { transition: 'background 0.1s' },
  td: { padding: '12px 14px', borderBottom: '1px solid #e2e8f0', color: '#2d3748' },
  badge: { padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  editBtn: { marginRight: 6, padding: '4px 10px', background: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  delBtn: { padding: '4px 10px', background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  center: { textAlign: 'center', padding: 40, color: '#718096' },
  errBox: { background: '#fff5f5', color: '#c53030', padding: 16, borderRadius: 8, textAlign: 'center' },
};
