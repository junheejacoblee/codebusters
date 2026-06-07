# codebusters

A minimal Science Olympiad Codebusters training tool. Time your solves, track stats across all cipher types, and analyze your progression over time.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, React Router, Recharts |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |

---

## Project Structure

```
codebusters/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.js         # pg connection pool
│   │   │   ├── migrate.js      # creates tables
│   │   │   └── seed.js         # seeds 17 cipher types
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js         # register, login, /me
│   │   │   ├── solves.js       # submit, stats, raw
│   │   │   └── public.js       # team count, cipher types
│   │   └── index.js            # Express app
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx       # nav bar + outlet
    │   │   └── CipherSelector.jsx  # popup cipher picker
    │   ├── hooks/
    │   │   └── useAuth.jsx      # auth context
    │   ├── lib/
    │   │   ├── api.js           # fetch wrapper
    │   │   └── time.js          # ms formatter
    │   ├── pages/
    │   │   ├── Home.jsx         # landing + team counter
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Solve.jsx        # timer + cipher log
    │   │   ├── Dashboard.jsx    # stats per cipher
    │   │   └── Explorer.jsx     # chart + raw data
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Local Development

### 1. Database (PostgreSQL)

Create a local Postgres database:

```bash
createdb codebusters
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

npm install
npm run db:migrate    # creates tables
npm run db:seed       # seeds cipher types
npm run dev           # starts on port 3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev           # starts on port 5173
```

The Vite dev server proxies `/api` → `http://localhost:3001`.

---

## Deployment

### Option A: Railway (recommended — full stack on one platform)

1. Push to GitHub
2. Create a new Railway project
3. Add a **PostgreSQL** plugin — Railway auto-sets `DATABASE_URL`
4. Add a service for `backend/` — set env vars:
   ```
   JWT_SECRET=<random 64 char string>
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
5. Set start command: `npm run db:migrate && npm run db:seed && npm start`
6. Deploy `frontend/` to **Vercel** — set `VITE_API_URL` if not using proxy

### Option B: Supabase + Render + Vercel

- **Database**: Supabase (free tier PostgreSQL, copy connection string)
- **Backend**: Render (free web service, `backend/` directory)
- **Frontend**: Vercel (`frontend/` directory)

### Environment Variables

**Backend** (Railway / Render):
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-64-char-random-secret
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Frontend** (Vercel):
Update `vite.config.js` proxy OR set `VITE_API_BASE` and update `src/lib/api.js` to use `import.meta.env.VITE_API_BASE`.

---

## Cipher Types

Pre-seeded on first `npm run db:seed`:

**Regular**: Aristocrat, Patristocrat, Xenocrypt, Cryptarithmetic, Fractionated Morse, Columnar, Nihilist, Checkerboard, Hill 2x2, Baconian, Porta

**Special**: Nihilist Cryptanalysis, Checkerboard Cryptanalysis, Hill 3x3

**Div B Only**: Atbash, Caesar, Affine

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Get JWT |
| GET | `/auth/me` | ✓ | Current user |
| POST | `/solves` | ✓ | Log a solve |
| GET | `/solves/stats` | ✓ | Aggregated stats |
| GET | `/solves/raw` | ✓ | Raw solves (filterable) |
| GET | `/public/team-count` | — | Distinct school count |
| GET | `/public/cipher-types` | — | All cipher types |

### `GET /solves/raw` query params
- `cipher_type_id` — filter by cipher
- `from` — ISO date string
- `to` — ISO date string
- `limit` — max results (default 500, max 1000)

---

## Keyboard Shortcuts (Solve page)

| Key | Action |
|---|---|
| `Space` | Start / pause timer |
| `R` | Reset timer |
