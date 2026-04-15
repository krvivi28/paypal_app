# Interview Questions & Model Answers

## React / Frontend

**Q1. Why did you use custom hooks instead of putting logic directly in components?**
> Custom hooks (`useAuth`, `useTransactions`, `useSummary`) separate data-fetching concerns from UI rendering. This makes components easier to test, reuse, and reason about. It also follows the single-responsibility principle.

**Q2. How does your pagination work? What happens on filter change?**
> Filters and page number are stored in a single `filters` state object. Any filter change resets `page` to 1 to avoid showing empty results. The `useTransactions` hook has a `useEffect` that depends on `filters` (via JSON.stringify), so it re-fetches automatically.

**Q3. How do you handle errors in fetch calls?**
> Each fetch checks `res.ok`. If false, it throws with `data.error`. The hook stores the error in state and the table component renders an error box. Loading state prevents stale data from showing during re-fetches.

**Q4. What is the difference between `useEffect` and `useCallback` in your hooks?**
> `useCallback` memoizes the `fetchTransactions` function so it's only re-created when `token` or `filters` change. `useEffect` then triggers that function. Without `useCallback`, the function reference would change every render, causing infinite re-fetch loops.

**Q5. How would you optimize this React app for performance?**
> - Use `React.memo` on `TransactionTable` and `Pagination` to avoid unnecessary re-renders
> - Implement `useMemo` for derived data (totals, filtered counts)
> - Code-split the modal with `React.lazy` + `Suspense`
> - Add debounce on the search input to reduce API calls
> - Use React Query or SWR for caching and background refetch

---

## API / Backend

**Q6. Your API has no database — how would you add one?**
> Replace the in-memory array with a PostgreSQL client (e.g., `pg` or an ORM like Prisma). The handler logic stays the same — only the data access layer changes. I'd add a repository pattern to keep handlers clean. Indexes on `type`, `status`, and `created_at` handle the filtering/sorting queries efficiently.

**Q7. How does your rate limiting work? What are its weaknesses?**
> It tracks request count per IP with a 60-second window in a Map. Weakness: it resets on server restart (not distributed). In production, use Redis with a sliding window algorithm so limits persist across instances.

**Q8. What is your caching strategy?**
> In-memory cache with a 5-second TTL keyed by the full request URL. Cache is invalidated on any write (POST/PUT/DELETE). The `X-Cache: HIT/MISS` header aids debugging. In production, Redis with appropriate TTLs per endpoint type would replace this.

**Q9. How do you handle CORS and why does it matter?**
> The server adds `Access-Control-Allow-Origin: *` headers and handles OPTIONS preflight requests. In production, I'd restrict the origin to the specific frontend domain, not `*`, to prevent unauthorized cross-origin requests.

**Q10. Walk me through your auth design. What are its limitations?**
> Token is a random hex string stored in a server-side Map. Limitation: it's not distributed (tokens lost on restart) and not a signed JWT so you can't decode claims without a lookup. In production: JWT with RS256 signing — stateless, verifiable without DB lookup, with short expiry + refresh token rotation.

---

## System Design

**Q11. How would you scale this to 1M transactions per user?**
> - Pagination is already in place (critical)
> - Add DB indexes on `user_id`, `created_at`, `type`, `status`
> - Use cursor-based pagination instead of offset for deep pages
> - Archive old transactions to cold storage (S3 + Athena)
> - Add a search layer (Elasticsearch) for full-text search
> - Read replicas for GET-heavy workloads

**Q12. How would you make the DELETE operation safe at scale?**
> - Soft delete: add `deleted_at` column instead of physical delete
> - Add audit log table to track who deleted what and when
> - Require 2FA or re-authentication for destructive operations
> - Add a confirmation step in the UI (already done with `window.confirm`)

**Q13. How would you add real-time updates (e.g., live transaction feed)?**
> - WebSockets (Socket.io) for bidirectional real-time
> - Server-Sent Events (SSE) for one-way server push — simpler and HTTP-compatible
> - Polling as fallback for environments blocking WS
> - On the client, integrate with React state via a custom hook that subscribes to the event stream

**Q14. How would you secure secrets like DB passwords and API keys?**
> - Never hardcode; use environment variables (`process.env.DB_PASSWORD`)
> - In production: use a secrets manager (AWS Secrets Manager, HashiCorp Vault)
> - Rotate secrets regularly; audit access logs
> - Use IAM roles instead of long-lived credentials where possible

**Q15. What SQL joins would matter for a transaction system?**
```sql
-- Get transactions with user info (INNER JOIN)
SELECT t.*, u.email, u.name
FROM transactions t
INNER JOIN users u ON t.user_id = u.id
WHERE t.status = 'COMPLETED';

-- Get users even if they have no transactions (LEFT JOIN)
SELECT u.id, u.email, COUNT(t.id) as tx_count
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id
GROUP BY u.id;
```
> INNER JOIN = only matching rows. LEFT JOIN = all rows from left table, NULLs for unmatched right rows.
