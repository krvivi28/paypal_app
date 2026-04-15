import React from 'react';

export default function SummaryCards({ summary, loading }) {
  if (loading || !summary || summary.totalCredit === undefined) return <div style={styles.placeholder}>Loading summary...</div>;

  const cards = [
    { label: 'Total Transactions', value: summary.totalTransactions, color: '#003087', icon: '📋' },
    { label: 'Total Credit', value: `$${summary.totalCredit.toLocaleString()}`, color: '#38a169', icon: '⬆️' },
    { label: 'Total Debit', value: `$${summary.totalDebit.toLocaleString()}`, color: '#e53e3e', icon: '⬇️' },
    { label: 'Net Balance', value: `$${summary.balance.toLocaleString()}`, color: summary.balance >= 0 ? '#38a169' : '#e53e3e', icon: '💰' },
  ];

  return (
    <div style={styles.grid}>
      {cards.map(c => (
        <div key={c.label} style={styles.card}>
          <div style={styles.icon}>{c.icon}</div>
          <div style={{ ...styles.value, color: c.color }}>{c.value}</div>
          <div style={styles.label}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  card: { background: '#fff', borderRadius: 8, padding: '20px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' },
  icon: { fontSize: 24, marginBottom: 8 },
  value: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  label: { fontSize: 12, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' },
  placeholder: { color: '#718096', marginBottom: 24, fontSize: 14 },
};
