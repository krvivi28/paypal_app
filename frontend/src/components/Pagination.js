import React from 'react';

export default function Pagination({ meta, onPageChange }) {
  const { page, totalPages, total, limit } = meta;
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div style={styles.wrap}>
      <span style={styles.info}>Showing {from}–{to} of {total}</span>
      <div style={styles.btns}>
        <button style={styles.btn} disabled={page <= 1} onClick={() => onPageChange(1)}>«</button>
        <button style={styles.btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹ Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => Math.abs(p - page) <= 2)
          .map(p => (
            <button key={p} style={{ ...styles.btn, ...(p === page ? styles.active : {}) }} onClick={() => onPageChange(p)}>
              {p}
            </button>
          ))}
        <button style={styles.btn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next ›</button>
        <button style={styles.btn} disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}>»</button>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 },
  info: { fontSize: 13, color: '#718096' },
  btns: { display: 'flex', gap: 4 },
  btn: { padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#4a5568' },
  active: { background: '#003087', color: '#fff', borderColor: '#003087', fontWeight: 600 },
};
