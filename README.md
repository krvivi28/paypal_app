# PayPal Transaction Dashboard — Interview Project

A full-stack transaction management dashboard built with **React + Node.js**.  
Demonstrates: CRUD, pagination, auth, caching, rate limiting, error handling, and role-based access.

---

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React 18, Webpack 5, Babel                |
| Backend  | Node.js (zero external dependencies)      |
| Auth     | Bearer token (in-memory)                  |
| Cache    | In-memory with TTL                        |

---

## Prerequisites

- Node.js >= 18
- npm >= 10

---

## Installation & Running

### 1. Clone / navigate to project

```bash
cd ~/Desktop/paypal-interview-project
```

### 2. Start the Backend (Terminal 1)

```bash
cd backend
node server.js
```

> API runs at **http://localhost:4000**

### 3. Start the Frontend (Terminal 2)

```bash
cd frontend
npm install   # only needed first time
npm start
```

> App opens at **http://localhost:3000**

---

## Demo Credentials

| Username | Password    | Role  | Permissions              |
|----------|-------------|-------|--------------------------|
| admin    | password123 | ADMIN | Full CRUD + Delete       |
| user     | user123     | USER  | View, Create, Edit only  |

---

## API Endpoints

```
POST   /auth/login
POST   /auth/logout
GET    /transactions?page=1&limit=10&type=DEBIT&status=COMPLETED&search=netflix&sortBy=amount&order=desc
GET    /transactions/:id
POST   /transactions
PUT    /transactions/:id
DELETE /transactions/:id   ← Admin only
GET    /summary
```

---

## Features

- JWT-style Bearer token authentication
- Role-based access control (Admin vs User)
- Pagination with configurable page size
- Search, filter by type/status/category, sort
- In-memory response caching (5s TTL, X-Cache header)
- Rate limiting (100 req/min per IP)
- CORS headers
- Error handling with descriptive messages

---

## Docker (Optional)

```bash
# Build and run both services
docker-compose up --build
```
