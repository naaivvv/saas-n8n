# AGENT.md — AI-Assisted Lead Intelligence Pipeline

> This file provides an AI coding agent with the full architectural context, conventions, and constraints needed to develop, debug, and extend this project. Read this file first before touching any code.

---

## 🎯 Project Identity

**Name:** SaaS Lead Intelligence Pipeline  
**One-Liner:** A zero-cost, self-hosted automation system that captures "Request Demo" leads from a SaaS landing page, enriches them with B2B firmographic data, scores buyer intent with an LLM, triages high-value leads to a sales channel, and surfaces everything on an executive dashboard.

**Core Philosophy:** Every service used must have a meaningful free tier. The entire stack runs at $0/month until genuine scale demands otherwise.

---

## 🏗️ Architecture Overview

```
┌─────────────────────┐
│   Next.js Frontend  │  Vercel (free tier)
│   (Landing + Admin) │
└────────┬────────────┘
         │ POST /webhook/leads
         ▼
┌─────────────────────┐
│   n8n Workflow       │  Railway / Render / Docker (self-hosted)
│   Engine             │
│                      │
│  ┌────────────────┐  │
│  │  Webhook Node  │──┼──▶ Parse domain from email & check freemium
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Apollo.io API  │──┼──▶ Firmographic enrichment (for business domains)
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Gemini 3 Flash │──┼──▶ Text Intent scoring (1-100)
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Calculate      │──┼──▶ Combines ICP Fit & Text Intent scores
│  │ Combined Score │  │
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Switch Node    │  │
│  │ Route by Score │  │
│  └──┬────┬────┬───┘  │
│Tier1│Tier2│Tier3     │ (Tier1 >= 80, Tier2 >= 50, Tier3 < 50)
│     ▼    ▼    ▼      │
│ Telegram Gmail Gmail │
│  (Hot)  (Warm) (PLG) │
│     │    │    │      │
│     └────┼────┘      │
│          ▼           │
│  ┌────────────────┐  │
│  │ Supabase Node  │──┼──▶ Upsert lead telemetry using email as key
│  └────────────────┘  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Supabase (PgSQL)  │  Free tier — 500 MB
│   `public.leads`    │
└─────────────────────┘
```

---

## 🛠️ Tech Stack & Services

| Layer | Technology | Purpose | Tier |
|---|---|---|---|
| Frontend Framework | **Next.js 14+ (App Router)** | Landing page + admin dashboard | — |
| CSS | **Tailwind CSS** | Utility-first styling | — |
| Hosting (Frontend) | **Vercel** | Edge deployment, serverless functions | Free |
| Workflow Engine | **n8n** (self-hosted) | Automation orchestration | Free (self-hosted) |
| Workflow Hosting | **Railway** or **Render** | Persistent container hosting | Free tier |
| Database | **Supabase** (PostgreSQL) | Lead storage, dashboard queries | Free (500 MB) |
| B2B Enrichment API | **Apollo.io** | Company firmographics lookup | Free tier |
| LLM / AI Scoring | **Google Gemini 3 Flash Preview (gemini-3-flash-preview)** | Intent scoring via API | Free tier |
| Sales Alerts | **Telegram** (bot) or **Slack** | Real-time high-intent notifications | Free |
| Email Fallback | **Gmail** (OAuth2 via n8n) | Auto-reply for low-intent leads | Free |

---

## 📁 Expected Project Structure

```
saas-n8n/
├── .env                        # All secrets — NEVER commit real values
├── .env.example                # Template with placeholder keys
├── .gitignore
├── PROJECT.md                  # Phase-by-phase specification (source of truth)
├── AGENT.md                    # This file — AI development context
├── PROMPT.md                   # Phase-by-phase implementation prompts
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — fonts, metadata, providers
│   ├── page.tsx                # Landing page (pricing matrix + demo CTA)
│   ├── globals.css             # Tailwind directives + custom tokens
│   │
│   ├── api/
│   │   └── leads/
│   │       └── route.ts        # Server-side proxy to n8n webhook
│   │
│   └── dashboard/
│       ├── page.tsx            # Admin dashboard (protected)
│       └── components/
│           ├── LeadTable.tsx    # Sortable lead list, intent-score heatmap
│           ├── LeadDetail.tsx   # Expanded lead view w/ firmographics
│           └── ScoreBadge.tsx   # Visual intent-score indicator
│
├── lib/
│   ├── supabase.ts             # Supabase client init (createClient)
│   └── types.ts                # Shared TypeScript interfaces (Lead, etc.)
│
├── components/
│   ├── PricingMatrix.tsx       # Tiered pricing cards
│   ├── DemoForm.tsx            # "Request Demo" form component
│   ├── Navbar.tsx
│   └── Footer.tsx
│
├── n8n/
│   └── workflow.json           # Exported n8n workflow (version controlled)
│
├── public/
│   └── ...                     # Static assets (logos, OG images)
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.js
```

---

## 📊 Database Schema

**Table:** `public.leads`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, auto-generated | `gen_random_uuid()` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | UTC |
| `name` | `text` | NOT NULL | From form |
| `email` | `text` | NOT NULL, UNIQUE | From form (unique key for upserts) |
| `company_name` | `text` | Nullable | From Apollo |
| `company_domain` | `text` | NOT NULL | Parsed from email |
| `employee_count` | `integer` | Nullable | From Apollo |
| `industry` | `text` | Nullable | From Apollo |
| `estimated_revenue` | `text` | Nullable | From Apollo |
| `original_message` | `text` | Nullable | From form |
| `intent_score` | `integer` | CHECK 1–100 | Final score mapped from `final_score` (for dashboard compatibility) |
| `icp_fit_score` | `integer` | CHECK 0–100 | Point-based score calculated from corporate firmographics |
| `text_intent_score` | `integer` | CHECK 0–100 | Gemini-evaluated buyer intent score from raw message |
| `final_score` | `integer` | CHECK 0–100 | Combined score: `(icp_fit_score * 0.5) + (text_intent_score * 0.5)` |
| `reasoning_summary` | `text` | Nullable | Synthesized summary: fit details + Gemini intent explanation |
| `status` | `text` | Default `'New'` | Workflow state: `Hot Lead` (>=80), `Nurture` (>=50), `PLG` (<50) |

**Index:** `idx_leads_intent_score` on `(intent_score DESC)` — optimized for dashboard sorting.

---

## 🔑 Environment Variables

```bash
# Next.js Application Client Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# n8n Pipeline Integrations
N8N_WEBHOOK_URL=https://your-n8n-instance.railway.app/webhook/leads
APOLLO_API_KEY=api_key_xxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

**Rules:**
- `.env` is git-ignored. Always.
- `NEXT_PUBLIC_*` prefixed vars are exposed to the browser — use only for Supabase anon key and URL.
- Server-side secrets (Apollo, Gemini, Telegram, n8n) must NEVER have `NEXT_PUBLIC_` prefix.
- Provide a `.env.example` with placeholder values for onboarding.

---

## 📝 Coding Conventions

### TypeScript
- Strict mode enabled (`"strict": true` in tsconfig).
- All data shapes defined in `lib/types.ts` using `interface`, not `type` (for extendability).
- Prefer `async/await` over `.then()` chains.
- Use `zod` for runtime validation of form inputs and API responses.

### Next.js
- Use **App Router** (`app/` directory) exclusively — no `pages/` directory.
- Server Components by default; add `'use client'` only when React hooks or browser APIs are needed.
- API routes live under `app/api/` using Route Handlers (`route.ts`).
- Use `next/font` for self-hosted fonts (no external Google Fonts CDN requests).

### Tailwind CSS
- Extend the theme in `tailwind.config.ts` for brand colors and spacing — don't use arbitrary values inline.
- Dark mode: `class` strategy (user toggle).
- Component extraction via `@apply` only for heavily repeated utility clusters.

### Component Patterns
- One component per file. Named exports.
- Props interfaces co-located at the top of the component file.
- Client-side state: `useState` / `useReducer`. No external state libraries unless complexity demands it.
- Data fetching in Server Components using `fetch()` or Supabase server client.

### n8n Workflow
- Export the workflow JSON to `n8n/workflow.json` after every significant change.
- Use n8n expressions (`{{ }}`) for dynamic data, not Code nodes, unless transformation logic exceeds a single expression.
- Name every node descriptively: e.g., `Parse Email Domain`, `Set Default Values`, `Apollo Enrichment`, `Normalize Enrichment`, `Calculate ICP Fit Score`, `Gemini Intent Score`, `Calculate Final Combined Score`, `Route by Score`, `Telegram Alert — Hot Lead`, `Gmail — Warm Auto-Reply`, `Gmail — PLG Auto-Reply`, `Set Status`, `Upsert Lead to Database`.

---

## 🚨 Critical Constraints

1. **Zero-cost mandate.** Every external service must operate within its free tier. Do not introduce paid services without explicit approval.
2. **No managed n8n cloud.** n8n is self-hosted (Docker, Railway, or Render). Do not reference n8n cloud plans.
3. **Supabase Row-Level Security.** RLS must be enabled on `public.leads`. Create appropriate policies:
   - Dashboard reads: authenticated users only.
   - Webhook inserts: via service role key from n8n (bypasses RLS).
4. **API rate limits.** Apollo free tier has strict daily limits. Implement idempotency checks (deduplicate by `company_domain`) to avoid wasted calls.
5. **LLM output validation.** Never trust raw Gemini output. Always parse and validate the JSON response. If parsing fails, assign a default `intent_score` of 50 and log the error.
6. **Webhook security.** The n8n webhook URL should include a secret path segment or validate a shared secret header to prevent abuse.

---

## 🧪 Testing & Verification Strategy

| What | How |
|---|---|
| Form submission | Submit the demo form locally → verify n8n receives the webhook payload immediately (async response) |
| Apollo enrichment | Use a known corporate email (e.g., `test@stripe.com`) → confirm firmographics return; freemium email (e.g., `test@gmail.com`) → bypasses Apollo |
| Gemini scoring | Send a high-intent message ("Enterprise deployment for 500 seats") → expect high `text_intent_score` |
| Triage routing | Verify Telegram alert fires for Hot leads (score >= 80); Gmail Warm Reply for Nurture (score >= 50); Gmail PLG Reply for PLG/Cold (score < 50 or freemium) |
| Database sync | Check Supabase table for complete row (including ICP, text, and final scores) and verify upsert on duplicate email |
| Dashboard render | Load `/dashboard` → confirm leads appear sorted by `intent_score DESC` (which holds the final score) |
| Edge cases | Empty Apollo response, Gemini timeout, prompt injection attempt, duplicate email submissions |

---

## 🔄 Development Workflow

1. **Start n8n locally** — `docker run -it --rm -p 5678:5678 n8nio/n8n` (or use Railway/Render).
2. **Start Next.js dev server** — `npm run dev` in the project root.
3. **Test end-to-end** — Submit a form → watch n8n execution → check Supabase → verify alerts.
4. **Export n8n workflow** — After changes, download the workflow JSON and save to `n8n/workflow.json`.
5. **Deploy** — Push to GitHub → Vercel auto-deploys the frontend. Update n8n instance separately.

---

## 🧭 Phase Execution Order

| Phase | Focus | Dependencies |
|---|---|---|
| **1** | Core infra: Next.js scaffold, Supabase table, n8n instance | None |
| **2** | Ingestion: Webhook + Apollo enrichment in n8n | Phase 1 |
| **3** | AI scoring: Gemini integration + structured output | Phase 2 |
| **4** | Triage: Switch node → Telegram / Gmail routing | Phase 3 |
| **5** | Dashboard: Admin UI fetching from Supabase | Phase 1 (DB) + Phase 4 (data) |

Each phase is independently testable. Do not skip phases. Verify each before proceeding to the next.
