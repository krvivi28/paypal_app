import React from 'react';

export default function Filters({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v, page: 1 });

  return (
    <div style={styles.bar}>
      <input
        style={styles.search}
        placeholder="🔍  Search transactions..."
        value={filters.search || ''}
        onChange={e => set('search', e.target.value)}
      />
      <select style={styles.select} value={filters.type || ''} onChange={e => set('type', e.target.value)}>
        <option value="">All Types</option>
        <option value="CREDIT">Credit</option>
        <option value="DEBIT">Debit</option>
      </select>
      <select style={styles.select} value={filters.status || ''} onChange={e => set('status', e.target.value)}>
        <option value="">All Status</option>
        <option value="COMPLETED">Completed</option>
        <option value="PENDING">Pending</option>
        <option value="FAILED">Failed</option>
      </select>
      <select style={styles.select} value={filters.category || ''} onChange={e => set('category', e.target.value)}>
        <option value="">All Categories</option>
        {['Food','Shopping','Entertainment','Travel','Utilities'].map(c => <option key={c}>{c}</option>)}
      </select>
      <select style={styles.select} value={filters.sortBy || 'date'} onChange={e => set('sortBy', e.target.value)}>
        <option value="date">Sort: Date</option>
        <option value="amount">Sort: Amount</option>
      </select>
      <select style={styles.select} value={filters.order || 'desc'} onChange={e => set('order', e.target.value)}>
        <option value="desc">↓ Desc</option>
        <option value="asc">↑ Asc</option>
      </select>
    </div>
  );
}

const styles = {
  bar: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' },
  search: { flex: 2, minWidth: 200, padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, outline: 'none' },
  select: { flex: 1, minWidth: 130, padding: '9px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', background: '#fff' },
};
