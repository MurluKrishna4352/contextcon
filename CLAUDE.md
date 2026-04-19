# CLAUDE.md — Scout AI Project Rules

> This file is read by Claude at the start of every session. Follow every rule here precisely.
> Do not deviate from these rules unless the user explicitly overrides one in the conversation.

---

## 0. Project Context

**Scout AI** is an AI-powered VC deal flow intelligence tool.
- **Frontend**: React 18 + Vite + Tailwind CSS — lives in `/client`
- **Backend**: Node.js 20 + Express 4 — lives in `/server`
- **AI Model**: OpenAI `gpt-4o` (NOT Claude / Anthropic — see Section 4)
- **Data API**: Crustdata (company search + enrichment)
- **Demo target**: Live, zero-mock, sub-8-second query-to-result flow

---

## 1. Frontend Rules

### 1.1 Invoke the Design Skill First

**Before writing any frontend code**, read the design skill:

```
/mnt/skills/public/frontend-design/SKILL.md
```

Apply every guideline in that file without exception. The skill defines the aesthetic
standard for this project. Do not start coding a component until you have read it and
committed to a clear aesthetic direction for that component.

### 1.2 Aesthetic Direction — Scout AI Identity

Scout AI is a **refined, data-dense intelligence tool** for professional VC analysts.
The aesthetic is:

- **Tone**: Dark, authoritative, precise — think Bloomberg terminal meets Linear.app
- **Not**: Friendly, pastel, rounded, playful, startup-generic
- **Color palette** (CSS variables — always use these, never hardcode hex):
  ```css
  --color-bg:        #0A0E1A;   /* near-black navy */
  --color-surface:   #111827;   /* card backgrounds */
  --color-surface-2: #1C2333;   /* elevated surfaces */
  --color-border:    #1E2D40;   /* subtle borders */
  --color-accent:    #2563EB;   /* primary blue */
  --color-accent-2:  #0EA5E9;   /* teal highlight */
  --color-text-1:    #F1F5F9;   /* primary text */
  --color-text-2:    #94A3B8;   /* secondary / muted */
  --color-text-3:    #475569;   /* placeholder / disabled */
  --color-success:   #10B981;
  --color-warning:   #F59E0B;
  --color-danger:    #EF4444;
  ```
- **Typography**: Use `DM Mono` for numbers/scores/data points, `Syne` for headings,
  `Inter` is **banned** — pick something with character for body copy (`DM Sans`, `Outfit`, etc.)
- **Motion**: Staggered card entrance on load (50ms delay per card), smooth score ring
  draw animation on mount, modal fade+scale on open. No gratuitous motion.
- **Layout**: Dense but breathable. Data-first. No hero banners, no marketing copy in the UI.

### 1.3 Component Rules

- Every component file is a single `.jsx` file — no separate CSS files per component.
  Use Tailwind utility classes for all styling.
- Do not use inline `style={{}}` props unless you need a dynamic CSS variable or a
  computed value that Tailwind cannot express.
- Every component that fetches data must handle three states explicitly:
  **loading** (skeleton), **error** (message + retry button), **success** (content).
- Never render `undefined`, `null`, or `NaN` to the DOM. Every dynamic value must have
  a fallback: `value ?? '—'` for strings, `value ?? 0` for numbers.
- Company logos must have a letter-avatar fallback if the image URL is missing or errors.

### 1.4 React Patterns

- Use **functional components only** — no class components.
- Use **TanStack Query (React Query v5)** for all server state. Do not use `useEffect`
  + `useState` to fetch data manually.
- Custom hooks live in `/client/src/hooks/`. One file per hook, named `use<Feature>.js`.
- Do not pass more than 4 props to a component. If you need more, use a config object prop.
- Memoize expensive computations with `useMemo`. Memoize callbacks passed to child
  components with `useCallback`.
- Prefer composition over configuration — build small focused components and compose them.

### 1.5 Tailwind Rules

- Use `tailwind.config.js` to define the Scout color palette as custom colors.
  Reference them as `bg-scout-bg`, `text-scout-accent`, etc.
- Do not use arbitrary values `[]` unless absolutely unavoidable.
- Responsive prefixes: `sm:` (640px), `md:` (768px), `lg:` (1024px). Every layout grid
  must have mobile, tablet, and desktop breakpoints defined.
- Dark mode: the entire app is dark by default. Do not add `dark:` variants — the base
  styles ARE the dark styles.

### 1.6 Animation Rules

- Use **Framer Motion** for component-level animations (card entrance, modal, score ring).
- Use **CSS transitions** for simple hover states — do not reach for Framer Motion for
  a `hover:bg-opacity` change.
- Every animation must respect `prefers-reduced-motion`:
  ```jsx
  import { useReducedMotion } from 'framer-motion';
  const shouldReduce = useReducedMotion();
  ```
- Score ring animation: SVG `stroke-dashoffset` animated from full circumference to
  the computed score offset. Duration 800ms, ease-out. Runs once on mount.

### 1.7 Performance Rules

- Lazy-load the Memo Modal component with `React.lazy` + `Suspense`.
- Company logo `<img>` tags must have `loading="lazy"` and explicit `width`/`height`.
- The results grid must use `will-change: transform` only during the entrance animation,
  then remove it.
- Do not import entire icon libraries — import named icons only:
  ```jsx
  import { Search, TrendingUp, Building2 } from 'lucide-react'; // ✅
  import * as Icons from 'lucide-react'; // ❌
  ```

### 1.8 File Structure — Client

```
client/
  src/
    components/
      layout/       Header.jsx, AppShell.jsx
      query/        QueryBar.jsx, FilterTags.jsx, SortToggle.jsx
      results/      ResultsGrid.jsx, CompanyCard.jsx, ScoreRing.jsx
                    SignalBadge.jsx, SkeletonCard.jsx, EmptyState.jsx
      memo/         MemoModal.jsx, ScoreDimensions.jsx, MemoSection.jsx
                    Recommendation.jsx
    hooks/
      useScout.js   useCompanyMemo.js
    lib/
      api.js        formatters.js   constants.js
    styles/
      globals.css   (Tailwind directives + custom CSS variables only)
    App.jsx
    main.jsx
  index.html
  tailwind.config.js
  vite.config.js
```

---

## 2. Backend Rules

### 2.1 Framework & Structure

- Express 4.x only. No other HTTP frameworks.
- Entry point is `server/index.js`. It must:
  1. Validate all required env vars (fail fast if missing — see Section 5)
  2. Register middleware in this order: `helmet` → `cors` → `morgan` → `express.json()` → rate limiters → routes
  3. Register the global error handler last
- All route handlers live in `server/routes/`. One file per route group.
- All external API calls (OpenAI, Crustdata) live in `server/services/`. Routes never
  call external APIs directly.
- All prompt strings live in `server/prompts/`. Never inline a system prompt inside
  a service or route file.

### 2.2 Routes

| Route | File | Purpose |
|-------|------|---------|
| `POST /api/scout` | `routes/scout.js` | NL query → ranked company list |
| `GET /api/company` | `routes/company.js` | Enrich company + generate memo |
| `GET /api/health` | `routes/health.js` | Health check |

- Every route must validate its inputs before touching any service.
- Every route must be wrapped in `try/catch` and call `next(error)` on failure.
- Never `return res.json(...)` without first checking that no response has been sent
  (check `res.headersSent` in the error handler).

### 2.3 Services

```
server/services/
  openaiService.js     — all OpenAI API calls
  crustdataService.js  — all Crustdata API calls
  scoringService.js    — score computation and validation helpers
```

- Services are plain async functions — no classes, no `this`.
- Every service function has a JSDoc comment describing its input and output shape.
- Services throw typed errors that the route's error handler can classify.

### 2.4 Error Handling

- Use a single global error handler registered in `server/middleware/errorHandler.js`.
- Error handler classifies errors by type and maps them to HTTP status codes:
  - `ValidationError` → 400
  - `NotFoundError` → 404
  - `RateLimitError` → 429
  - `UpstreamError` (Crustdata / OpenAI) → 502
  - Everything else → 500
- Error responses always follow this shape:
  ```json
  { "error": "Human-readable message", "code": "ERROR_CODE", "retryable": true/false }
  ```
- Never expose stack traces, API keys, or internal service URLs in error responses.
- Always log the full error (with stack) server-side before sending the sanitised response.

### 2.5 Caching

- Use `lru-cache` v11. Cache config lives in `server/cache/lruCache.js`.
- Scout query results: cache key = `scout:<normalised_query>`, TTL = 5 minutes.
- Company memos: cache key = `memo:<domain>`, TTL = 15 minutes.
- Normalise query strings before caching: lowercase, trim, collapse whitespace.
- Log cache hits at `debug` level, misses at `info` level.

### 2.6 Rate Limiting

- Use `express-rate-limit` v7.
- `/api/scout`: 20 requests per minute per IP.
- `/api/company`: 10 requests per minute per IP.
- Rate limit responses must use `retryAfter` header.

### 2.7 Logging

- Use `morgan` for HTTP request logging.
- Use `console.info` / `console.warn` / `console.error` for application logs.
- Every outbound API call must log: service name, endpoint, response time in ms, status code.
- Format: `[SERVICE] METHOD /endpoint — 200 in 342ms`
- In production (`NODE_ENV=production`), suppress `debug`-level logs.

### 2.8 File Structure — Server

```
server/
  index.js
  routes/
    scout.js       company.js      health.js
  services/
    openaiService.js
    crustdataService.js
    scoringService.js
  prompts/
    filterPrompt.js     — NL → Crustdata filter JSON system prompt
    scoringPrompt.js    — Company ranking + scoring system prompt
    memoPrompt.js       — Investment memo generation system prompt
  middleware/
    errorHandler.js
    rateLimiter.js
    validateRequest.js
  cache/
    lruCache.js
  config/
    env.js              — env var validation and export
```

---

## 3. Shared / General Rules

### 3.1 Code Style

- Use **ES Modules** (`import`/`export`) in the client. Use **CommonJS** (`require`) in the server (Node 20 compatibility).
- No TypeScript — plain JavaScript throughout. Add JSDoc where types are non-obvious.
- Prettier config:
  ```json
  { "singleQuote": true, "semi": false, "tabWidth": 2, "trailingComma": "es5" }
  ```
- Maximum function length: 40 lines. If a function exceeds this, extract helpers.
- Maximum file length: 200 lines. If a file exceeds this, split by responsibility.
- All `async` functions must be called with `await` — no floating promises.
- No `var`. Use `const` by default, `let` only when reassignment is necessary.

### 3.2 Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `CompanyCard.jsx` |
| Hooks | camelCase with `use` prefix | `useScout.js` |
| Services | camelCase with `Service` suffix | `openaiService.js` |
| API routes | kebab-case URLs | `/api/scout`, `/api/company` |
| Env variables | SCREAMING_SNAKE_CASE | `OPENAI_API_KEY` |
| CSS variables | kebab-case with `--color-` / `--space-` prefix | `--color-accent` |
| Constants | SCREAMING_SNAKE_CASE in `constants.js` | `MAX_QUERY_LENGTH` |

### 3.3 Git Hygiene

- Never commit `.env` files. `.env` is in `.gitignore` from project init.
- Never commit `node_modules/`.
- Commit messages follow conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`.

---

## 4. OpenAI Integration Rules

Scout AI uses **OpenAI** as its AI provider — not Anthropic / Claude.

### 4.1 Client Setup

```javascript
// server/services/openaiService.js
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
```

### 4.2 Model

- **Always use `gpt-4o`** for all three Scout AI inference calls (filter parsing,
  scoring, memo generation).
- Do not use `gpt-3.5-turbo`, `gpt-4-turbo`, or any other variant.
- Do not use streaming for any Scout AI calls — wait for the full response.

### 4.3 Call Parameters

| Parameter | Filter Call | Scoring Call | Memo Call |
|-----------|-------------|--------------|-----------|
| `model` | `gpt-4o` | `gpt-4o` | `gpt-4o` |
| `max_tokens` | `512` | `2048` | `1500` |
| `temperature` | `0.1` | `0.2` | `0.3` |
| `response_format` | `{ type: 'json_object' }` | `{ type: 'json_object' }` | `{ type: 'json_object' }` |

Always set `response_format: { type: 'json_object' }` — this guarantees parseable JSON
and eliminates the need for regex extraction or retry logic on malformed output.

### 4.4 Message Structure

```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  max_tokens: 512,
  temperature: 0.1,
  response_format: { type: 'json_object' },
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },   // from /prompts/*.js
    { role: 'user',   content: userMessage }
  ]
})

const result = JSON.parse(response.choices[0].message.content)
```

### 4.5 Error Handling for OpenAI

- Catch `openai.APIError` specifically — it has a `.status` and `.code` property.
- `429` (rate limit): wait 2 seconds, retry once. If it fails again, throw `UpstreamError`.
- `500` / `503` (OpenAI server error): throw `UpstreamError` immediately — do not retry.
- `400` (bad request / context length): log the prompt length, throw `ValidationError`.
- Never retry on `401` — it means the key is wrong; fail fast and alert.
- Wrap all OpenAI calls in a helper `callOpenAI(params)` in `openaiService.js` that
  handles the retry logic in one place.

### 4.6 Token Budget

- Keep system prompts under 600 tokens.
- Keep user messages under 4000 tokens (Crustdata responses can be large — truncate
  company descriptions to 200 chars before sending to OpenAI).
- Log token usage from `response.usage` at `info` level for every call:
  ```
  [OpenAI] gpt-4o — prompt: 412 tokens, completion: 318 tokens, total: 730 tokens
  ```

### 4.7 Prompt Files

Each prompt file exports a single string constant and a builder function:

```javascript
// server/prompts/filterPrompt.js

export const FILTER_SYSTEM_PROMPT = `
You are a VC data assistant that converts natural language investment queries
into structured Crustdata API filter payloads.
 
Crustdata has two search endpoints:
  1. POST /screener/company/search  — finds companies
  2. POST /screener/person/search   — finds founders / executives / decision-makers
 
Your job is to decide which endpoint(s) to call based on the query, then emit
the correct filter JSON for each.
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a valid JSON object. No markdown, no explanation, no preamble.
 
{
  "search_type": "company" | "person" | "both",
 
  "company_search": {               // include only when search_type is "company" or "both"
    "filters": [ ...filter objects ],
    "page": 1
  },
 
  "person_search": {                // include only when search_type is "person" or "both"
    "filters": [ ...filter objects ],
    "page": 1
  },
 
  "vc_intent": {
    "hiring_signal": "string | null",   // e.g. "hiring engineers fast", "growing sales team"
    "stage_focus": "string | null",     // e.g. "pre-Series A", "Seed", "Series B"
    "sector": "string | null",          // e.g. "SaaS", "Fintech", "Climate Tech"
    "founder_signal": "string | null",  // e.g. "ex-Google founders", "IIT alumni"
    "growth_signal": "string | null",   // e.g. "high headcount growth", "web traffic spike"
    "raw_intent": "string"              // the analyst's intent in one sentence
  }
}
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUTING RULES — which search_type to use
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use "company"  when the query is about finding companies/startups to invest in.
  Examples: "find SaaS companies in India hiring fast"
            "pre-Series A fintech with high headcount growth"
 
Use "person"   when the query is about finding specific founders or executives.
  Examples: "find ex-Google founders who recently started a company"
            "CTOs with AI background at Series A startups"
            "find VPs of Engineering at fintech companies in Bangalore"
 
Use "both"     when both company signals AND specific people signals are needed.
  Examples: "find climate tech startups AND their founders who went to IIT"
            "B2B SaaS companies in India where the CEO previously worked at Stripe"
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPANY FILTER TYPES  (POST /screener/company/search)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
COMPANY_HEADCOUNT
  Operator: "in" | "not in"
  Values (use EXACTLY as shown):
    "1-10" | "11-50" | "51-200" | "201-500" | "501-1,000"
    "1,001-5,000" | "5,001-10,000" | "10,001+"
  VC mapping:
    "early-stage / very small" → ["1-10", "11-50"]
    "seed-stage team" → ["11-50", "51-200"]
    "growing startup" → ["51-200", "201-500"]
    "scaling startup" → ["201-500", "501-1,000"]
    "growth-stage" → ["501-1,000", "1,001-5,000"]
  Example:
    { "filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["11-50", "51-200"] }
 
ANNUAL_REVENUE
  Operator: "between"
  Value: { "min": <number in millions>, "max": <number in millions> }
  Sub-filter: "USD" (always include)
  Example:
    { "filter_type": "ANNUAL_REVENUE", "type": "between",
      "value": { "min": 1, "max": 50 }, "sub_filter": "USD" }
 
REGION
  Operator: "in" | "not in"
  Value: array of country or region name strings
  Common values: "India", "United States", "United Kingdom", "Southeast Asia",
    "Singapore", "Germany", "Canada", "Australia", "Middle East", "Europe"
  Example:
    { "filter_type": "REGION", "type": "in", "value": ["India", "Singapore"] }
 
INDUSTRY
  Operator: "in" | "not in"
  Value: array of industry name strings
  Common values: "Software", "Information Technology", "Financial Services",
    "Fintech", "Healthcare", "Biotechnology", "E-Commerce", "SaaS",
    "Artificial Intelligence", "Climate Tech", "EdTech", "Gaming",
    "Cybersecurity", "Logistics", "Real Estate", "Media", "Consumer"
  Example:
    { "filter_type": "INDUSTRY", "type": "in", "value": ["Software", "SaaS"] }
 
ACCOUNT_ACTIVITIES
  Operator: "in"
  Valid values (use EXACTLY as shown):
    "Funding events in past 12 months"
  Example:
    { "filter_type": "ACCOUNT_ACTIVITIES", "type": "in",
      "value": ["Funding events in past 12 months"] }
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPANY SCHEMA — fields returned in each company object
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use this to inform vc_intent so the scoring step knows what to look at.
 
FIRMOGRAPHICS
  company_name, company_website, company_website_domain
  hq_country, largest_headcount_country
  year_founded
  industries, categories, markets
  total_investment_usd          — total raised in USD
  last_funding_round_type       — e.g. "Seed", "Series A", "Series B"
  days_since_last_fundraise     — integer
  valuation_usd
  investors                     — array of investor names
  acquisition_status
 
FOUNDER BACKGROUND
  founder_names_and_profile_urls
  founders_location
  founders_education_institute  — e.g. "IIT", "Stanford"
  founders_degree_name
  founders_previous_company     — e.g. "Google", "Stripe", "McKinsey"
  founders_previous_title
  founders_email
 
HEADCOUNT (all time-series available)
  headcount                     — total employees
  headcount_engineering         — engineering headcount
  headcount_sales               — sales headcount
  headcount_operations          — operations headcount
  headcount_human_resource
  headcount_india               — employees in India
  headcount_usa                 — employees in USA
  headcount_engineering_pct     — % of team in engineering
  headcount_sales_pct
  headcount_mom_pct             — month-over-month headcount growth %
  headcount_qoq_pct             — quarter-over-quarter growth %
  headcount_yoy_pct             — year-over-year growth %
  headcount_mom_absolute        — absolute MoM change
  headcount_qoq_absolute
  headcount_yoy_absolute
  headcount_engineering_six_months_growth_pct (if available)
  headcount_sales_six_months_growth_pct
  headcount_india_yoy_growth_pct
  headcount_usa_yoy_growth_pct
 
REVENUE
  estimated_revenue_lower_bound_usd
  estimated_revenue_higher_bound_usd
 
EMPLOYEE REVIEWS & RATINGS (all time-series)
  overall_rating, culture_rating, diversity_rating
  work_life_balance_rating, senior_management_rating
  compensation_rating, career_opportunities_rating
  recommend_to_friend_pct
  ceo_approval_pct
  business_outlook_pct
  review_count
 
EMPLOYEE SKILLS
  all_employee_skill_names       — e.g. ["Python", "Machine Learning", "Kubernetes"]
  employee_skills_71_to_100_pct  — % of team with high skill proficiency
 
WEB TRAFFIC
  monthly_visitors
  monthly_visitor_mom_pct        — MoM change in web traffic
  traffic_source_social_pct
  traffic_source_search_pct
  traffic_source_direct_pct
 
JOB LISTING GROWTH BY FUNCTION (QoQ and 6-month variants)
  job_openings_engineering_qoq_pct
  job_openings_engineering_six_months_growth_pct
  job_openings_sales_qoq_pct
  job_openings_sales_six_months_growth_pct
  job_openings_product_management_qoq_pct
  job_openings_product_management_six_months_growth_pct
  job_openings_information_technology_qoq_pct
  job_openings_human_resource_qoq_pct
  job_openings_operations_qoq_pct
  job_openings_research_qoq_pct
  job_openings_overall_qoq_pct
  job_openings_overall_six_months_growth_pct
 
TOTAL JOB LISTINGS
  job_openings_count             — total open roles right now
  job_openings_title             — array of open role titles
  job_openings_count_mom_pct
  job_openings_count_qoq_pct
  job_openings_count_yoy_pct
 
ADS
  meta_active_ads                — number of currently active Meta ads
 
SEO
  monthly_organic_clicks
  monthly_paid_clicks
  total_organic_results
  average_organic_rank
 
NEWS
  news_articles                  — array of { title, article_link, publisher_name,
                                              date_published, one_line_description }
 
FORM D FILINGS
  total_amount                   — USD
  date_filed, date_of_first_sale
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PEOPLE FILTER TYPES  (POST /screener/person/search)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
CURRENT_COMPANY
  Operator: "in" | "not in"
  Value: array of company name strings
  Use when looking for people AT specific companies.
  Example:
    { "filter_type": "CURRENT_COMPANY", "type": "in", "value": ["Stripe", "Razorpay"] }
 
CURRENT_TITLE
  Operator: "in" | "not in"
  Value: array of job title strings
  Use to target specific roles.
  Example:
    { "filter_type": "CURRENT_TITLE", "type": "in",
      "value": ["Chief Executive Officer", "Co-founder", "CTO", "VP Engineering"] }
 
SENIORITY_LEVEL
  Operator: "in" | "not in"
  Values (use EXACTLY as shown):
    "CXO" | "Vice President" | "Director" | "Manager" | "Entry" | "Training"
  VC mapping:
    "founders / C-suite" → ["CXO"]
    "senior leadership" → ["CXO", "Vice President"]
    "decision makers" → ["CXO", "Vice President", "Director"]
  Example:
    { "filter_type": "SENIORITY_LEVEL", "type": "in", "value": ["CXO", "Vice President"] }
 
INDUSTRY
  Operator: "in" | "not in"
  Value: same industry values as company search
  Filters people by their current company's industry.
  Example:
    { "filter_type": "INDUSTRY", "type": "in", "value": ["Fintech", "Software"] }
 
COMPANY_HEADCOUNT
  Operator: "in"
  Value: same headcount range values as company search
  Filters people by their current company size.
  Example:
    { "filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["11-50", "51-200"] }
 
KEYWORD
  Operator: "in"
  Value: array of keyword strings matched against profile text, skills, headline, bio
  Use for skills, background context, technologies, or domain expertise.
  Example:
    { "filter_type": "KEYWORD", "type": "in", "value": ["machine learning", "founder"] }
 
REGION (People)
  Operator: "in" | "not in"
  Value: array of location strings (city, country, or region)
  Example:
    { "filter_type": "REGION", "type": "in", "value": ["Bangalore", "Mumbai", "India"] }
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PEOPLE SCHEMA — fields returned in each profile object
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
PROFILE BASICS
  name, email
  linkedin_profile_url, flagship_profile_url
  profile_picture_url
  headline                       — LinkedIn headline (often tells seniority + company)
  summary                        — bio text
  current_title                  — current role title
  current_company                — current employer name
  num_of_connections             — network size (proxy for reach/influence)
  skills                         — array of skill strings
  languages
  pronoun
 
EMPLOYMENT HISTORY  (employer array)
  title, company_name
  start_date, end_date           — ISO 8601
  location
  description
 
EDUCATION  (education_background array)
  degree_name                    — e.g. "Bachelor of Technology", "MBA"
  institute_name                 — e.g. "IIT Bombay", "Stanford University"
  field_of_study
  start_date, end_date
 
ADDITIONAL
  all_employers                  — flat list of all employer names
  all_titles                     — flat list of all job titles held
  all_schools                    — flat list of all schools attended
  all_degrees                    — flat list of all degrees
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VC VOCABULARY MAPPING — translate user language to filters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
"pre-seed"            → COMPANY_HEADCOUNT: ["1-10", "11-50"]
"seed-stage"          → COMPANY_HEADCOUNT: ["11-50", "51-200"]
"pre-Series A"        → COMPANY_HEADCOUNT: ["51-200"] + ACCOUNT_ACTIVITIES: recent funding
"Series A"            → COMPANY_HEADCOUNT: ["51-200", "201-500"] + ACCOUNT_ACTIVITIES
"Series B+"           → COMPANY_HEADCOUNT: ["201-500", "501-1,000"]
 
"hiring engineers fast"     → vc_intent.hiring_signal; scoring uses job_openings_engineering_*
"growing sales team"        → vc_intent.hiring_signal; scoring uses headcount_sales + job_openings_sales_*
"rapid headcount growth"    → vc_intent.growth_signal; scoring uses headcount_yoy_pct, headcount_qoq_pct
"web traffic spike"         → vc_intent.growth_signal; scoring uses monthly_visitor_mom_pct
"recently funded"           → ACCOUNT_ACTIVITIES: ["Funding events in past 12 months"]
"bootstrapped"              → no ACCOUNT_ACTIVITIES filter; note in vc_intent
 
"ex-Google / ex-Stripe founders" → PERSON: KEYWORD: ["Google"] or CURRENT_COMPANY exclusion;
                                    note in vc_intent.founder_signal
"IIT / IIM alumni"               → PERSON: KEYWORD: ["IIT", "IIM"]; note in vc_intent.founder_signal
"technical founders"              → PERSON: CURRENT_TITLE: ["CTO", "Co-founder"] + SENIORITY_LEVEL: ["CXO"]
"solo founder"                    → note in vc_intent; not filterable directly
 
"SaaS" → INDUSTRY: ["Software", "Information Technology"]
"Fintech" → INDUSTRY: ["Financial Services", "Fintech"]
"B2B" → note in vc_intent; not a direct filter
"D2C / consumer" → INDUSTRY: ["Consumer", "E-Commerce"]
"deep tech / AI" → INDUSTRY: ["Artificial Intelligence", "Software"] + KEYWORD: ["AI", "machine learning"]
"climate / cleantech" → INDUSTRY: ["Climate Tech", "Renewable Energy", "Clean Energy"]
"healthtech" → INDUSTRY: ["Healthcare", "Biotechnology", "Health, Wellness and Fitness"]
"edtech" → INDUSTRY: ["EdTech", "E-Learning", "Education"]
"cybersecurity" → INDUSTRY: ["Cybersecurity", "Computer & Network Security"]
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FALLBACK RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- If the query is very vague (e.g. "interesting startups"), default to:
    COMPANY_HEADCOUNT: ["11-50", "51-200"] + ACCOUNT_ACTIVITIES: recent funding
- If no region is mentioned, do NOT add a REGION filter — return global results.
- If no industry is mentioned, do NOT add an INDUSTRY filter.
- Never fabricate a filter_type that is not listed above.
- Never use filter values that are not exact strings from the lists above (for
  enum-like filters like COMPANY_HEADCOUNT and SENIORITY_LEVEL).
- Prefer fewer, broader filters over many narrow ones — it is better to get
  25 companies and let the scoring step narrow them than to get 0.
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
Query: "Find pre-Series A SaaS companies in India hiring engineers fast"
Output:
{
  "search_type": "company",
  "company_search": {
    "filters": [
      { "filter_type": "INDUSTRY", "type": "in", "value": ["Software", "Information Technology"] },
      { "filter_type": "REGION", "type": "in", "value": ["India"] },
      { "filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["51-200"] },
      { "filter_type": "ACCOUNT_ACTIVITIES", "type": "in", "value": ["Funding events in past 12 months"] }
    ],
    "page": 1
  },
  "vc_intent": {
    "hiring_signal": "hiring engineers fast",
    "stage_focus": "pre-Series A",
    "sector": "SaaS",
    "founder_signal": null,
    "growth_signal": null,
    "raw_intent": "Find early-stage Indian SaaS companies with strong engineering hiring momentum"
  }
}
 
───
 
Query: "Find ex-Stripe or ex-Google founders who recently started a fintech company"
Output:
{
  "search_type": "both",
  "company_search": {
    "filters": [
      { "filter_type": "INDUSTRY", "type": "in", "value": ["Financial Services", "Fintech"] },
      { "filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["1-10", "11-50"] },
      { "filter_type": "ACCOUNT_ACTIVITIES", "type": "in", "value": ["Funding events in past 12 months"] }
    ],
    "page": 1
  },
  "person_search": {
    "filters": [
      { "filter_type": "KEYWORD", "type": "in", "value": ["Stripe", "Google"] },
      { "filter_type": "SENIORITY_LEVEL", "type": "in", "value": ["CXO"] },
      { "filter_type": "INDUSTRY", "type": "in", "value": ["Financial Services", "Fintech"] }
    ],
    "page": 1
  },
  "vc_intent": {
    "hiring_signal": null,
    "stage_focus": "pre-seed / seed",
    "sector": "Fintech",
    "founder_signal": "ex-Stripe or ex-Google background",
    "growth_signal": null,
    "raw_intent": "Find early fintech founders with pedigreed backgrounds from top tech companies"
  }
}
 
───
 
Query: "CTOs and VPs of Engineering at Series A AI companies in Southeast Asia"
Output:
{
  "search_type": "person",
  "person_search": {
    "filters": [
      { "filter_type": "CURRENT_TITLE", "type": "in", "value": ["Chief Technology Officer", "VP Engineering", "VP of Engineering", "Head of Engineering"] },
      { "filter_type": "SENIORITY_LEVEL", "type": "in", "value": ["CXO", "Vice President"] },
      { "filter_type": "INDUSTRY", "type": "in", "value": ["Artificial Intelligence", "Software"] },
      { "filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["51-200", "201-500"] },
      { "filter_type": "REGION", "type": "in", "value": ["Singapore", "Indonesia", "Vietnam", "Thailand", "Malaysia"] }
    ],
    "page": 1
  },
  "vc_intent": {
    "hiring_signal": null,
    "stage_focus": "Series A",
    "sector": "AI / Software",
    "founder_signal": null,
    "growth_signal": null,
    "raw_intent": "Identify senior technical leadership at AI startups in Southeast Asia for sourcing"
  }
}
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY the JSON object. Nothing else.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`
 
// ─── User Message Builder ─────────────────────────────────────────────────────
 
/**
 * Wraps the analyst's raw query into the user message sent to GPT-4o.
 * @param {string} query - The natural language investment query from the analyst
 * @returns {string}
 */
export function buildFilterUserMessage(query) {
  return `Investment query: "${query.trim()}"`
}
 
// ─── Response Validator ───────────────────────────────────────────────────────
 
/**
 * Validates the parsed JSON output from GPT-4o.
 * Throws a descriptive error if the shape is wrong so the caller can handle it.
 *
 * @param {object} parsed - The JSON.parsed response from GPT-4o
 * @returns {object} - The validated and normalised filter payload
 */
export function validateFilterResponse(parsed) {
  const VALID_SEARCH_TYPES = ['company', 'person', 'both']
 
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Filter response is not an object')
  }
 
  if (!VALID_SEARCH_TYPES.includes(parsed.search_type)) {
    throw new Error(`Invalid search_type: "${parsed.search_type}". Must be one of: ${VALID_SEARCH_TYPES.join(', ')}`)
  }
 
  if (['company', 'both'].includes(parsed.search_type)) {
    if (!parsed.company_search?.filters || !Array.isArray(parsed.company_search.filters)) {
      throw new Error('company_search.filters must be an array when search_type includes "company"')
    }
    if (parsed.company_search.filters.length === 0) {
      throw new Error('company_search.filters cannot be empty')
    }
  }
 
  if (['person', 'both'].includes(parsed.search_type)) {
    if (!parsed.person_search?.filters || !Array.isArray(parsed.person_search.filters)) {
      throw new Error('person_search.filters must be an array when search_type includes "person"')
    }
    if (parsed.person_search.filters.length === 0) {
      throw new Error('person_search.filters cannot be empty')
    }
  }
 
  if (!parsed.vc_intent || typeof parsed.vc_intent.raw_intent !== 'string') {
    throw new Error('vc_intent.raw_intent must be a non-empty string')
  }
 
  // Normalise: ensure page defaults
  if (parsed.company_search) {
    parsed.company_search.page = parsed.company_search.page ?? 1
  }
  if (parsed.person_search) {
    parsed.person_search.page = parsed.person_search.page ?? 1
  }
 
  return parsed
}
 
// ─── VALID FILTER REFERENCE  (used for runtime validation in crustdataService) ─
 
export const VALID_COMPANY_FILTER_TYPES = [
  'COMPANY_HEADCOUNT',
  'ANNUAL_REVENUE',
  'REGION',
  'INDUSTRY',
  'ACCOUNT_ACTIVITIES',
]
 
export const VALID_PERSON_FILTER_TYPES = [
  'CURRENT_COMPANY',
  'CURRENT_TITLE',
  'SENIORITY_LEVEL',
  'INDUSTRY',
  'COMPANY_HEADCOUNT',
  'KEYWORD',
  'REGION',
]
 
export const VALID_HEADCOUNT_VALUES = [
  '1-10', '11-50', '51-200', '201-500',
  '501-1,000', '1,001-5,000', '5,001-10,000', '10,001+',
]
 
export const VALID_SENIORITY_VALUES = [
  'CXO', 'Vice President', 'Director', 'Manager', 'Entry', 'Training',
]
 
export const VALID_ACCOUNT_ACTIVITIES = [
  'Funding events in past 12 months',
]
\`

export function buildFilterUserMessage(query) {
  return \`Investment query: "${query}"\`
}
```

---

## 5. Environment Variables

### 5.1 Required Variables

| Variable | Where Used | Notes |
|----------|-----------|-------|
| `OPENAI_API_KEY` | `server/services/openaiService.js` | Starts with `sk-` |
| `CRUSTDATA_API_KEY` | `server/services/crustdataService.js` | Token format |

### 5.2 Optional Variables with Defaults

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `3001` | Express listen port |
| `NODE_ENV` | `development` | Set `production` on Railway |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Used in CORS config |
| `CACHE_TTL_SCOUT` | `300000` | ms — 5 minutes |
| `CACHE_TTL_MEMO` | `900000` | ms — 15 minutes |
| `RATE_LIMIT_SCOUT` | `20` | Requests per minute per IP |
| `RATE_LIMIT_COMPANY` | `10` | Requests per minute per IP |

### 5.3 Startup Validation (fail fast)

```javascript
// server/config/env.js
const REQUIRED = ['OPENAI_API_KEY', 'CRUSTDATA_API_KEY']

for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required env var: ${key}`)
    process.exit(1)
  }
}
```

This must run before any route is registered.

---

## 6. Crustdata Integration Rules

### 6.1 Base Config

```javascript
// server/services/crustdataService.js
import axios from 'axios'

const crustdata = axios.create({
  baseURL: 'https://api.crustdata.com',
  timeout: 15000,
  headers: {
    'Authorization': `Token ${process.env.CRUSTDATA_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
```

### 6.2 Endpoints Used

| Function | Method | URL | When Called |
|----------|--------|-----|-------------|
| `searchCompanies(filters)` | POST | `/screener/company/search` | Every `/api/scout` request |
| `enrichCompany(domain)` | GET | `/screener/company?company_domain=<domain>&fields=job_openings,news_articles` | Every `/api/company` request |

### 6.3 Error Handling for Crustdata

- `400`: Log the filters JSON that caused the error. Return a `ValidationError` with
  the message "Query was too ambiguous — try adding a sector, stage, or region."
- `401`: Fatal — log and throw, do not expose the key.
- `429`: Back off 3 seconds, retry once. If it fails again, throw `UpstreamError`.
- `5xx`: Throw `UpstreamError` immediately.

### 6.4 Response Handling

- The company search response contains a `companies` array. Always check it exists
  and is an array before iterating.
- Truncate company `description` fields to 200 characters before passing to OpenAI
  (reduces token usage significantly).
- Always log `total_display_count` from the search response at `info` level.

---

## 7. What Claude Must Never Do

- **Never use Anthropic SDK or Claude API** — OpenAI `gpt-4o` only.
- **Never hardcode API keys** — always read from `process.env`.
- **Never render raw API errors to the user** — always sanitise first.
- **Never make Crustdata or OpenAI calls from the frontend** — all external API calls
  go through the Express backend.
- **Never use `axios` in the frontend for anything other than the Scout backend** — the
  frontend only talks to `localhost:3001` (dev) or `VITE_API_URL` (prod).
- **Never add a new npm dependency without considering** whether a built-in or already-
  installed package could do the job.
- **Never skip loading/error states** — every async operation must have all three states
  handled in the UI.
- **Never use `Inter` as the primary typeface** — pick something with character.
- **Never commit code with `console.log` debug statements** — use `console.info` for
  intentional logs and remove debug logs before marking a task complete.
- **Never inline system prompts** — they always live in `server/prompts/`.

---

## 8. Demo Readiness Checklist

Before considering any task "done", verify:

- [ ] Query → results flow completes in < 8 seconds on a normal network connection
- [ ] Score ring renders correctly for scores of 0, 50, and 100
- [ ] Investment memo generates for at least 2 different company domains
- [ ] App does not crash when Crustdata returns 0 results
- [ ] App does not crash when a company logo URL is broken
- [ ] All three loading states (query, memo, score) are visually distinct and clearly
      communicate that something is happening
- [ ] No `console.error` appears in the browser console during a clean demo run
- [ ] The query bar is focused on page load — user can type immediately

---

*Last updated: April 19, 2026 — ContextCon Hackathon, Bangalore*