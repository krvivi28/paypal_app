# High Level Design — PayPal Transaction Dashboard

## System Overview

```
┌────────────────────────────────────────────────────────────┐
│                        Browser                             │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │              React App (port 3000)                │    │
│   │                                                   │    │
│   │  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │    │
│   │  │  Login  │  │Dashboard │  │ TransactionModal│  │    │
│   │  └─────────┘  └──────────┘  └────────────────┘  │    │
│   │        │           │                │             │    │
│   │        └─────┬─────┘────────────────┘             │    │
│   │              │  Custom Hooks (useAuth,             │    │
│   │              │  useTransactions, useSummary)       │    │
│   └──────────────┼────────────────────────────────────┘    │
│                  │  fetch() + Bearer Token                  │
└──────────────────┼─────────────────────────────────────────┘
                   │ HTTP  (proxied via webpack-dev-server)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                 Node.js API Server (port 4000)                │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │  Rate Limiter│  │ Auth Middleware│  │  Response Cache  │  │
│  │  100 req/min │  │ Bearer Token  │  │  TTL: 5 seconds  │  │
│  └──────────────┘  └───────────────┘  └──────────────────┘  │
│                            │                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                      Router / Handlers                  │ │
│  │  POST /auth/login     GET  /transactions                │ │
│  │  POST /auth/logout    POST /transactions                │ │
│  │  GET  /summary        PUT  /transactions/:id            │ │
│  │                       DELETE /transactions/:id (admin)  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              In-Memory Data Store (Array)               │ │
│  │   50 seed transactions  |  Token Map  |  Rate Map       │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
App
├── Login                  ← Handles auth form, calls useAuth hook
├── Header                 ← User info, logout
├── SummaryCards           ← Aggregated stats (credit/debit/balance)
├── Filters                ← Search, type, status, category, sort
├── TransactionTable       ← Renders rows, edit/delete actions
├── Pagination             ← Page controls, shows X of Y
└── TransactionModal       ← Create / Edit form with validation
```

---

## Data Flow

### Authentication Flow
```
User enters creds → POST /auth/login
                  → Server validates → Returns Bearer token
                  → Token stored in sessionStorage
                  → All subsequent requests include Authorization header
```

### CRUD Flow
```
User action → React state update → fetch() with token
           → API validates auth → Executes operation
           → Cache invalidated  → Response returned
           → React re-fetches   → UI updated
```

### Pagination Flow
```
Filter/Page change → filters state updated → useEffect re-runs
                  → GET /transactions?page=N&limit=10&...
                  → Server slices data → Returns { data, meta }
                  → Table + Pagination re-render
```

---

## Security Design

| Concern        | Implementation                                         |
|----------------|--------------------------------------------------------|
| Auth           | Bearer token; 401 on missing/invalid token             |
| Authorization  | Role check on DELETE (ADMIN only); 403 for USER        |
| Rate limiting  | 100 req/min per IP; 429 response on breach             |
| CORS           | Allow-Origin: * (would be restricted in production)    |
| Input validation | Required field checks, type coercion on amount      |
| Secrets        | Env vars for DB credentials, token secret in prod      |

---

## Scalability Considerations (Production)

| Component      | Upgrade Path                                           |
|----------------|--------------------------------------------------------|
| Data Store     | PostgreSQL / MySQL with indexes on date, type, status  |
| Cache          | Redis with distributed TTL                             |
| Auth           | JWT with refresh tokens + Redis blacklist              |
| Rate Limiting  | Redis-backed sliding window                            |
| API            | REST → consider GraphQL for complex filtering          |
| Frontend       | Code splitting, lazy loading, React Query for caching  |
| Infra          | Kubernetes, load balancer, horizontal scaling          |

---

## Database Schema (Production)

```sql
CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  description VARCHAR(255) NOT NULL,
  amount      DECIMAL(15,2) NOT NULL,
  type        ENUM('CREDIT','DEBIT') NOT NULL,
  status      ENUM('PENDING','COMPLETED','FAILED') DEFAULT 'PENDING',
  category    VARCHAR(50),
  currency    CHAR(3) DEFAULT 'USD',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_tx_user_id   ON transactions(user_id);
CREATE INDEX idx_tx_type      ON transactions(type);
CREATE INDEX idx_tx_status    ON transactions(status);
CREATE INDEX idx_tx_created   ON transactions(created_at DESC);
```
