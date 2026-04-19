# Scout AI — VC Deal Flow Intelligence

Scout AI is an AI-powered deal flow tool for venture capital analysts. Type a natural language query, get back a ranked list of companies with investment scores, signal badges, and one-click investment memos — all powered by live Crustdata company data and GPT-4o.

---

## What it does

1. **Query** — Analyst types e.g. *"pre-Series A SaaS companies in India hiring engineers fast"*
2. **Filter** — GPT-4o converts the query into structured Crustdata search filters
3. **Fetch** — Crustdata returns matching companies with headcount, funding, job openings, and news data
4. **Score** — GPT-4o scores each company 0–100 across four dimensions
5. **Memo** — Clicking any company generates a full investment memo in seconds

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Animations | Framer Motion 11 |
| Server state | TanStack Query v5 |
| Backend | Node.js 20 + Express 4 |
| AI | OpenAI GPT-4o |
| Company data | Crustdata API |
| Caching | LRU Cache (5 min scout, 15 min memos) |

---

## Project structure

```
contextcon/
├── client/                  # React frontend
│   └── src/
│       ├── components/
│       │   ├── layout/      # Header, AppShell
│       │   ├── query/       # QueryBar, FilterTags, SortToggle
│       │   ├── results/     # ResultsGrid, CompanyCard, ScoreRing, SignalBadge
│       │   └── memo/        # MemoModal, ScoreDimensions, Recommendation
│       ├── hooks/           # useScout.js, useCompanyMemo.js
│       ├── lib/             # api.js, formatters.js, constants.js
│       └── styles/          # globals.css (Tailwind + CSS variables)
│
└── server/                  # Express backend
    ├── routes/              # scout.js, company.js, health.js
    ├── services/            # openaiService.js, crustdataService.js, scoringService.js
    ├── prompts/             # filterPrompt.js, scoringPrompt.js, memoPrompt.js
    ├── middleware/          # errorHandler.js, rateLimiter.js, validateRequest.js
    ├── cache/               # lruCache.js
    └── config/              # env.js
```

---

## Getting started

### Prerequisites

- Node.js 20+
- OpenAI API key (`sk-...`)
- Crustdata API key

### 1. Clone and install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Set environment variables

Create `server/.env`:

```env
OPENAI_API_KEY=sk-...
CRUSTDATA_API_KEY=...
PORT=3001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Run the app

In one terminal:
```bash
cd server
npm run dev
```

In another terminal:
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## API reference

### `POST /api/scout`

Converts a natural language query into ranked company results.

**Request**
```json
{ "query": "pre-Series A fintech companies in India hiring fast" }
```

**Response**
```json
{
  "companies": [
    {
      "id": "...",
      "name": "Acme Corp",
      "scoutScore": { "total": 78, "headcountGrowth": 24, "hiringVelocity": 20, "fundingStageFit": 22, "marketSignal": 12 },
      "signalBadges": ["Hiring Fast", "Seed Stage"],
      "headline": "Fastest-growing B2B fintech in the Bangalore ecosystem"
    }
  ],
  "totalCount": 15
}
```

Rate limit: 20 requests/min per IP.

### `GET /api/company?domain=acme.com`

Returns enriched company data and a full GPT-4o investment memo.

Rate limit: 10 requests/min per IP.

### `GET /api/health`

Health check — returns `{ status: "ok" }`.

---

## Scoring dimensions

| Dimension | Max pts | Signal |
|---|---|---|
| Headcount Growth | 30 | YoY employee growth ≥ 30% = full points |
| Hiring Velocity | 25 | Active engineering job openings |
| Funding Stage Fit | 25 | < $10M raised + recent funding = high score |
| Market Signal | 20 | News recency, web traffic trend |

---

## Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | Starts with `sk-` |
| `CRUSTDATA_API_KEY` | ✅ | — | Token format |
| `PORT` | — | `3001` | Express listen port |
| `NODE_ENV` | — | `development` | Set `production` on deploy |
| `CLIENT_ORIGIN` | — | `http://localhost:5173` | CORS origin |
| `CACHE_TTL_SCOUT` | — | `300000` | ms — scout cache TTL |
| `CACHE_TTL_MEMO` | — | `900000` | ms — memo cache TTL |

---

*Built at ContextCon Hackathon, Bangalore — April 2026*
