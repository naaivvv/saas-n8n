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
│  ┌───────────────┐   │
│  │ Webhook Node  │───┼──▶ Parse domain from email
│  └───────┬───────┘   │
│          ▼           │
│  ┌───────────────┐   │
│  │ Apollo.io API │───┼──▶ Firmographic enrichment
│  └───────┬───────┘   │
│          ▼           │
│  ┌───────────────┐   │
│  │ Gemini Flash  │───┼──▶ Intent scoring (1-100)
│  └───────┬───────┘   │
│          ▼           │
│  ┌───────────────┐   │
│  │ Switch Node   │   │
│  │ score > 80?   │   │
│  └──┬────────┬───┘   │
│     │ YES    │ NO    │
│     ▼        ▼       │
│  Discord   Gmail     │
│  #sales    auto-     │
│  -alerts   reply     │
│     │        │       │
│     └───┬────┘       │
│         ▼            │
│  ┌───────────────┐   │
│  │ Supabase Node │───┼──▶ Upsert full telemetry
│  └───────────────┘   │
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
| LLM / AI Scoring | **Google Gemini 1.5 Flash** | Intent scoring via API | Free tier |
| Sales Alerts | **Discord** (webhook) or **Slack** | Real-time high-intent notifications | Free |
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
| `email` | `text` | NOT NULL | From form |
| `company_name` | `text` | Nullable | From Apollo |
| `company_domain` | `text` | NOT NULL | Parsed from email |
| `employee_count` | `integer` | Nullable | From Apollo |
| `industry` | `text` | Nullable | From Apollo |
| `estimated_revenue` | `text` | Nullable | From Apollo |
| `original_message` | `text` | Nullable | From form |
| `intent_score` | `integer` | CHECK 1–100 | From Gemini |
| `reasoning_summary` | `text` | Nullable | From Gemini |
| `status` | `text` | Default `'New'` | Workflow state |

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
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

**Rules:**
- `.env` is git-ignored. Always.
- `NEXT_PUBLIC_*` prefixed vars are exposed to the browser — use only for Supabase anon key and URL.
- Server-side secrets (Apollo, Gemini, Discord, n8n) must NEVER have `NEXT_PUBLIC_` prefix.
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
- Name every node descriptively: e.g., `Parse Email Domain`, `Apollo Enrichment`, `Gemini Intent Score`, `Route by Score`, `Discord Alert`, `Gmail Fallback`, `Upsert to Supabase`.

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
| Form submission | Submit the demo form locally → verify n8n receives the webhook payload |
| Apollo enrichment | Use a known corporate email (e.g., `test@stripe.com`) → confirm firmographics return |
| Gemini scoring | Send a high-intent message ("Enterprise deployment for 500 seats") → expect score > 80 |
| Triage routing | Verify Discord alert fires for high-intent; Gmail auto-reply for low-intent |
| Database sync | Check Supabase table for complete row after full pipeline execution |
| Dashboard render | Load `/dashboard` → confirm leads appear sorted by `intent_score DESC` |
| Edge cases | Empty Apollo response, Gemini timeout, malformed JSON output |

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
| **4** | Triage: Switch node → Discord / Gmail routing | Phase 3 |
| **5** | Dashboard: Admin UI fetching from Supabase | Phase 1 (DB) + Phase 4 (data) |

Each phase is independently testable. Do not skip phases. Verify each before proceeding to the next.
