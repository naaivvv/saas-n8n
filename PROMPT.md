# PROMPT.md — Phase-by-Phase Implementation Prompts

> Copy each prompt below into your AI coding assistant when you're ready to build that phase. Each prompt is self-contained and references the project context from `AGENT.md` and `PROJECT.md`.

---

## How to Use This File

1. Complete phases **in order** (1 → 2 → 3 → 4 → 5).
2. Copy the entire prompt block for the current phase into the AI chat.
3. After each phase, **verify** the deliverables listed at the bottom of the prompt before moving on.
4. If a phase has sub-parts (a, b, c), run them sequentially within the same conversation.

---

## Phase 1: Core Infrastructure

### Phase 1A — Next.js Project Scaffold

```
You are building a SaaS Lead Intelligence Pipeline. Read @AGENT.md for full context.

TASK: Scaffold the Next.js frontend application.

Requirements:
1. Initialize a Next.js 14+ project using App Router in the current directory (saas-n8n/).
2. Use TypeScript with strict mode enabled.
3. Install and configure Tailwind CSS with a custom theme extending brand colors:
   - Primary: deep indigo (#4F46E5)
   - Accent: emerald (#10B981)
   - Danger/Hot: rose (#F43F5E)
   - Neutral grays for backgrounds and text
4. Set up dark mode with the "class" strategy.
5. Install dependencies: @supabase/supabase-js, zod
6. Create the file structure:
   - app/layout.tsx — root layout with Inter font (via next/font), metadata, html lang="en"
   - app/page.tsx — placeholder landing page
   - app/globals.css — Tailwind directives + CSS custom properties for the color tokens
   - lib/supabase.ts — Supabase browser client using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   - lib/types.ts — Lead interface matching the DB schema:
     ```typescript
     export interface Lead {
       id: string;
       created_at: string;
       name: string;
       email: string;
       company_name: string | null;
       company_domain: string;
       employee_count: number | null;
       industry: string | null;
       estimated_revenue: string | null;
       original_message: string | null;
       intent_score: number;
       reasoning_summary: string | null;
       status: string;
     }
     ```
7. Create .env.example with placeholder values for all env vars listed in AGENT.md.
8. Update .gitignore to exclude: node_modules, .next, .env, .env.local

VERIFY:
- `npm run dev` starts without errors
- Landing page renders at localhost:3000
- TypeScript compiles with no type errors
- Tailwind classes apply correctly
```

---

### Phase 1B — Landing Page (Pricing Matrix + Demo Form)

```
You are building the SaaS landing page. Read @AGENT.md for full context.

TASK: Build a high-conversion SaaS landing page at app/page.tsx with two key sections.

Section 1 — Pricing Matrix (components/PricingMatrix.tsx):
1. Create a responsive 3-tier pricing card layout (Starter, Pro, Enterprise).
2. Each card shows: tier name, price, feature list (5-6 items), CTA button.
3. The "Pro" card is visually highlighted as the recommended option (ring border, badge).
4. Use glassmorphism or gradient cards on a dark background for a premium feel.
5. Add subtle hover animations (scale, shadow transitions).
6. Enterprise card CTA says "Request Demo" and smooth-scrolls to the demo form section.

Section 2 — Demo Request Form (components/DemoForm.tsx):
1. Client component ('use client') with fields: Full Name, Work Email, Message (textarea).
2. Use zod for form validation:
   - Name: required, min 2 chars
   - Email: required, valid email format
   - Message: required, min 10 chars
3. On submit, POST to /api/leads (Next.js API route, built in Phase 2).
4. Show loading spinner during submission, success toast on completion, error state on failure.
5. For now, the submit handler can just console.log the payload.

Additional Components:
- components/Navbar.tsx — sticky navbar with logo text and "Dashboard" link.
- components/Footer.tsx — minimal footer with copyright.

Styling:
- Hero section with bold headline, subtle gradient text effect, and subheadline.
- Smooth scroll behavior globally.
- Fully responsive (mobile-first).
- Dark mode support using Tailwind's dark: variant.

VERIFY:
- Page looks premium and polished — no generic Bootstrap feel.
- Pricing cards are responsive (stack on mobile, 3-column on desktop).
- Form validates inputs and shows error messages inline.
- Form submission logs payload to console.
- Dark mode toggle works if implemented.
```

---

### Phase 1C — Supabase Database Setup

```
You are setting up the Supabase database. Read @AGENT.md for context.

TASK: Document and prepare the Supabase configuration.

Requirements:
1. The DDL for the leads table is already in PROJECT.md. Create a file at
   supabase/migrations/001_create_leads_table.sql containing:
   - The CREATE TABLE statement from PROJECT.md
   - The index creation statement
   - RLS policy setup:
     ```sql
     alter table public.leads enable row level security;

     -- Allow authenticated users to read all leads (dashboard)
     create policy "Authenticated users can read leads"
       on public.leads for select
       to authenticated
       using (true);

     -- Allow service role to insert leads (n8n webhook)
     create policy "Service role can insert leads"
       on public.leads for insert
       to service_role
       with check (true);

     -- Allow service role to update leads
     create policy "Service role can update leads"
       on public.leads for update
       to service_role
       using (true);
     ```
2. Create a lib/supabase-server.ts that initializes a Supabase client for
   Server Components using cookies-based auth (for the dashboard).
3. Verify the Lead interface in lib/types.ts matches the schema exactly.

VERIFY:
- Migration SQL file is syntactically correct.
- RLS policies cover: dashboard reads (authenticated), n8n writes (service_role).
- Server-side Supabase client is configured for App Router.
```

---

## Phase 2: Ingestion & Enrichment

### Phase 2A — Next.js API Route (Webhook Proxy)

```
You are building the form-to-n8n bridge. Read @AGENT.md for context.

TASK: Create the Next.js API route that forwards demo form submissions to n8n.

File: app/api/leads/route.ts

Requirements:
1. Export an async POST handler.
2. Parse and validate the request body with zod:
   ```typescript
   const LeadSubmissionSchema = z.object({
     name: z.string().min(2),
     email: z.string().email(),
     message: z.string().min(10),
   });
   ```
3. On validation failure, return 400 with error details.
4. On success, forward the payload to the n8n webhook URL (from process.env.N8N_WEBHOOK_URL)
   via a server-side fetch POST with JSON content type.
5. Return the n8n response status to the client.
6. Add error handling: if n8n is unreachable, return 502 with a friendly message.
7. Add rate limiting consideration: a simple in-memory check (max 5 submissions per IP per minute).

ALSO: Update components/DemoForm.tsx to POST to /api/leads instead of console.log.

VERIFY:
- Form submission hits /api/leads → forwards to n8n webhook URL.
- Validation errors return 400 with field-level messages.
- If n8n is down, returns 502 (not 500).
```

---

### Phase 2B — n8n Workflow: Webhook + Apollo Enrichment

```
You are building the n8n automation pipeline. Read @AGENT.md and @PROJECT.md for context.

TASK: Create the n8n workflow for lead ingestion and B2B enrichment.

Build the following nodes in n8n:

1. **Webhook Node** ("Receive Lead Submission"):
   - Method: POST
   - Path: /webhook/leads
   - Response mode: "Last Node" (so the API route gets a meaningful response)
   - Authentication: Header Auth with a shared secret (X-Webhook-Secret)

2. **Set Node** ("Parse Email Domain"):
   - Extract company domain from email:
     `{{ $json.body.email.split('@')[1] }}`
   - Pass through: name, email, original_message, company_domain

3. **HTTP Request Node** ("Apollo Enrichment"):
   - URL: https://api.apollo.io/v1/organizations/enrich
   - Method: GET
   - Query params: domain={{ $json.company_domain }}, api_key={{ $env.APOLLO_API_KEY }}
   - On error: continue with empty enrichment (don't break the pipeline)

4. **Set Node** ("Normalize Enrichment"):
   - Map Apollo response fields to our schema:
     - company_name: {{ $json.organization.name ?? 'Unknown' }}
     - employee_count: {{ $json.organization.estimated_num_employees ?? null }}
     - industry: {{ $json.organization.industry ?? null }}
     - estimated_revenue: {{ $json.organization.annual_revenue_printed ?? null }}

Export the workflow so far to n8n/workflow.json.

VERIFY:
- Webhook receives POST from Next.js and responds.
- Domain is correctly parsed from email addresses.
- Apollo returns enrichment data for known domains (test with stripe.com).
- Pipeline continues gracefully if Apollo returns empty/error.
```

---

## Phase 3: AI Intent Scoring

```
You are adding AI-powered intent scoring. Read @AGENT.md and @PROJECT.md for context.

TASK: Add Gemini-based intent scoring to the n8n workflow.

Add these nodes after the Apollo enrichment:

1. **HTTP Request Node** ("Gemini Intent Score"):
   - URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={{ $env.GEMINI_API_KEY }}
   - Method: POST
   - Body (JSON):
     ```json
     {
       "contents": [{
         "parts": [{
           "text": "SYSTEM PROMPT + USER DATA (see below)"
         }]
       }],
       "generationConfig": {
         "responseMimeType": "application/json",
         "responseSchema": {
           "type": "OBJECT",
           "properties": {
             "intent_score": { "type": "INTEGER" },
             "reasoning_summary": { "type": "STRING" }
           },
           "required": ["intent_score", "reasoning_summary"]
         }
       }
     }
     ```

   System Prompt to embed in the text field:
   ```
   You are a Senior SaaS Account Executive analyzing inbound demo requests.
   Given the prospect's message and their company profile, assign a purchase
   intent score from 1-100.

   Scoring Guide:
   - 90-100: Enterprise buyer, high headcount, explicit urgency, budget signals
   - 70-89:  Mid-market, clear use case, decision-maker language
   - 50-69:  Exploratory interest, small-mid company, vague requirements
   - 30-49:  Likely tire-kicker, personal email, no clear business need
   - 1-29:   Spam, off-topic, competitor research, student project

   PROSPECT MESSAGE: {{ $json.original_message }}

   COMPANY PROFILE:
   - Company: {{ $json.company_name }}
   - Domain: {{ $json.company_domain }}
   - Employees: {{ $json.employee_count ?? 'Unknown' }}
   - Industry: {{ $json.industry ?? 'Unknown' }}
   - Est. Revenue: {{ $json.estimated_revenue ?? 'Unknown' }}

   Respond with ONLY a valid JSON object:
   { "intent_score": <number 1-100>, "reasoning_summary": "<max 2 sentences>" }
   ```

2. **Code Node** ("Validate LLM Output"):
   - Parse Gemini response JSON.
   - Extract intent_score and reasoning_summary.
   - Validate: intent_score is integer between 1-100.
   - If parsing fails, default to: { intent_score: 50, reasoning_summary: "LLM output validation failed — defaulted." }

Update the workflow in n8n/workflow.json.

VERIFY:
- High-intent message ("Need enterprise deployment for 500 users, budget approved, Q3 deadline")
  returns score > 80.
- Low-intent message ("Just checking out your site, I'm a student") returns score < 40.
- Malformed Gemini response is caught and defaults to score 50.
- Full pipeline: Webhook → Domain → Apollo → Gemini runs end-to-end.
```

---

## Phase 4: Automated Triage & Routing

```
You are building the automated lead routing. Read @AGENT.md and @PROJECT.md for context.

TASK: Add conditional routing and notifications to the n8n workflow.

Add these nodes after the LLM validation node:

1. **Switch Node** ("Route by Intent Score"):
   - Condition 1 (HIGH): intent_score > 80 → "Telegram Alert" path
   - Condition 2 (LOW): intent_score <= 80 → "Gmail Auto-Reply" path

2. **Telegram Bot Node** ("Telegram Alert — Hot Lead") [HIGH path]:
   - URL: https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendMessage
   - Method: POST
   - Embed format:
     ```json
     ={
       "chat_id": "{{ $env.TELEGRAM_CHAT_ID }}",
       "text": "🔥 *Hot Lead Alert* — Score: {{ $json.intent_score }}\n\n*Name:* {{ $json.name }}\n*Email:* {{ $json.email }}\n*Company:* {{ $json.company_name }}\n*Employees:* {{ $json.employee_count }}\n*Industry:* {{ $json.industry }}\n*Revenue:* {{ $json.estimated_revenue }}\n\n*AI Reasoning:* {{ $json.reasoning_summary }}",
       "parse_mode": "Markdown"
     }
     ```

3. **Gmail Node** ("Gmail — Warm Auto-Reply") [LOW path]:
   - To: {{ $json.email }}
   - Subject: "Thanks for your interest in [Product Name]!"
   - Body (HTML): A polished email that:
     - Thanks them by name
     - Points to self-serve documentation links
     - Highlights the Starter/Pro tiers
     - Includes a soft CTA to schedule a follow-up if needs change

4. **Merge Node** ("Merge Paths"):
   - Merge the Telegram and Gmail branches back together.

5. **Supabase Node** ("Upsert Lead to Database"):
   - Operation: Insert
   - Table: leads
   - Map ALL fields from the pipeline to the table columns.
   - Include intent_score, reasoning_summary, and all Apollo firmographics.

6. **Set Node** ("Set Status"):
   - Before the Supabase insert, add a `status` field:
     - If score > 80: status = "Hot Lead"
     - If score 50-80: status = "Warm"
     - If score < 50: status = "Cold"

Update n8n/workflow.json.

VERIFY:
- High-intent submission → Telegram alert appears in the configured channel.
- Low-intent submission → auto-reply email arrives at the test email.
- ALL submissions (both paths) → row appears in Supabase with complete data.
- Status field is correctly set based on score thresholds.
- Full end-to-end: Form → n8n → enrichment → scoring → routing → database.
```

---

## Phase 5: Executive Dashboard

### Phase 5A — Dashboard Data Layer

```
You are building the admin dashboard. Read @AGENT.md for context.

TASK: Create the data-fetching layer for the dashboard.

Requirements:

1. **app/dashboard/page.tsx** (Server Component):
   - Fetch leads from Supabase ordered by intent_score DESC.
   - Pass data to client components.
   - Show total count, average intent score, and hot lead count as summary cards.
   - This page should be protected (redirect to login if not authenticated).
   - For MVP, use Supabase Auth with a magic link or email/password.

2. **lib/supabase-server.ts**:
   - Create a server-side Supabase client using @supabase/ssr for App Router.
   - Read cookies from headers for session management.

3. **app/dashboard/components/LeadTable.tsx** ('use client'):
   - Display leads in a sortable, filterable table.
   - Columns: Name, Company, Industry, Employees, Intent Score, Status, Date.
   - Intent score column uses color-coded badges:
     - 80-100: Red/rose background (hot)
     - 50-79: Amber/yellow background (warm)
     - 1-49: Gray background (cold)
   - Click a row to expand details (LeadDetail).

4. **app/dashboard/components/ScoreBadge.tsx**:
   - Reusable component that renders a colored pill/badge based on score.
   - Smooth color interpolation or tiered colors.

VERIFY:
- /dashboard loads with real data from Supabase (or seed data).
- Leads are sorted by intent_score DESC by default.
- Score badges render with correct colors.
- Summary cards show accurate counts.
```

---

### Phase 5B — Dashboard Polish & Interactivity

```
You are polishing the executive dashboard. Read @AGENT.md for context.

TASK: Add visual polish and interactive features to the dashboard.

Requirements:

1. **Summary Cards Row** (top of dashboard):
   - Total Leads (with small chart sparkline if possible)
   - Hot Leads (score > 80) — highlighted in rose/red
   - Average Intent Score — with a radial progress indicator
   - Leads This Week — with a trend arrow (up/down vs. last week)

2. **LeadDetail.tsx** (expandable row or modal):
   - Full firmographic profile from Apollo
   - AI reasoning summary in a callout box
   - Original message in a quote block
   - Quick action buttons: "Mark as Contacted", "Archive", "Flag"
   - Status update should write back to Supabase.

3. **Filtering & Search**:
   - Search bar: filter by name, email, company
   - Status filter: dropdown (All, Hot Lead, Warm, Cold, Contacted, Archived)
   - Date range picker (optional, use native input type="date" for simplicity)

4. **Visual Design**:
   - Dark theme dashboard with a sidebar navigation feel.
   - Use subtle glassmorphism on cards.
   - Smooth skeleton loading states while data fetches.
   - Responsive: works on tablet (for execs on iPad).

5. **Real-time updates** (optional/stretch):
   - Subscribe to Supabase Realtime channel on the leads table.
   - New leads appear at the top with a subtle animation.

VERIFY:
- Dashboard looks like a premium admin panel (not a basic table page).
- Search and filters work correctly.
- Lead detail view shows complete information.
- Status updates persist to Supabase.
- Page is responsive on tablet viewports.
```

---

## 🚀 Post-Phase Checklist (Run After All 5 Phases)

```
You have completed all 5 phases. Read @AGENT.md for context.

TASK: Final integration testing and deployment preparation.

1. END-TO-END TEST:
   - Submit 5 test leads through the landing page form with varying intent levels:
     a. Enterprise buyer: "CTO at Fortune 500, need deployment for 2000 seats by Q3"
     b. Mid-market: "We're a 50-person startup evaluating workflow tools"
     c. Student: "Hi, I'm doing a school project on SaaS tools"
     d. Spam: "Buy cheap watches at www.spam.com"
     e. Competitor: "We build similar software, curious about your architecture"
   - Verify each lead flows through the complete pipeline.
   - Confirm correct routing (Telegram for a, Gmail for b-e).
   - Confirm all 5 rows appear in Supabase with correct scores and status.
   - Confirm dashboard displays all 5 leads in correct order.

2. ERROR HANDLING VERIFICATION:
   - Test with an invalid email domain (no Apollo data).
   - Test with n8n webhook down (verify 502 from API route).
   - Test with Gemini returning malformed output (verify default score 50).

3. DEPLOYMENT PREP:
   - Verify .env.example has all required variables documented.
   - Verify .gitignore excludes: .env, .env.local, node_modules, .next
   - Verify n8n/workflow.json is up to date.
   - Run `npm run build` to verify production build succeeds.
   - Create a README.md with:
     - Project overview
     - Architecture diagram
     - Setup instructions (Supabase, n8n, Vercel)
     - Environment variable documentation
     - Screenshots of the landing page and dashboard

4. DEPLOY:
   - Push to GitHub.
   - Connect repo to Vercel for automatic frontend deployment.
   - Ensure n8n instance is running on Railway/Render.
   - Set production environment variables in Vercel dashboard.
   - Test the live URL end-to-end.

VERIFY:
- Production URL loads landing page correctly.
- Form submission works in production.
- Dashboard accessible and showing live data.
- Telegram alerts fire in production.
- No secrets exposed in client-side code.
```
