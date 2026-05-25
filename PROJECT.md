

---

## 🛠️ Phase-by-Phase Specifications

### Phase 1: Core Infrastructure (The Zero-Cost Stack)
* **Workflow Orchestrator:** Self-hosted `n8n` deployed via Docker on a local server environment or deployed directly to **Render** / **Railway** using their persistent free tiers to bypass n8n managed cloud limits.
* **The Database:** A **Supabase** project utilizing its free-tier PostgreSQL instance (500MB storage capacity, capable of housing millions of relational lead rows).
* **Frontend & Trigger Environment:** A **Next.js 14+ (App Router)** application styled with **Tailwind CSS**, featuring a mock SaaS high-conversion pricing matrix and a "Request Demo" CTA form, hosted natively on **Vercel**.

### Phase 2: Ingestion & Enrichment (The SaaS Context)
1.  **The Webhook Trigger:** An n8n Webhook node listens for incoming `POST` requests exposed to production. The Next.js form fires a payload containing `name`, `email`, and `message`.
2.  **B2B Data Enrichment:** * An n8n expression parses the domain from the raw email address:
        ```javascript
        {{ $json.body.email.split('@')[1] }}
        ```
    * An HTTP Request node routes the domain to the **Apollo.io API** to pull critical purchasing indicators: company headcount, vertical/industry, and estimated annual ARR.

### Phase 3: AI Intent Scoring & ICP Fit
* **LLM Integration:** An n8n HTTP Request node connects via API key to **Google Gemini 3 Flash Preview (gemini-3-flash-preview)** in JSON mode to maximize speed and token efficiency.
* **System Prompt Engineering & Sanitization:** Gemini acts as a *Senior SaaS Account Executive*. The user input is wrapped in strict XML tags to prevent prompt injection.
* **Structured Output Validation:** The model is constrained to return a JSON block containing the text intent score and raw reasoning:
    ```json
    {
      "text_intent_score": number, // Scale 1 to 100
      "intent_reasoning": string // Detailed intent reasoning
    }
    ```
* **ICP Fit & Combined Scoring:**
  * **ICP Fit Score:** Calculated programmatically based on firmographic data (employee count > 1000 = +40 points, 100-999 = +20 points; Software/Technology industry = +20 points).
  * **Final Score:** A weighted combination calculated as `final_score = (icp_fit_score * 0.5) + (text_intent_score * 0.5)`.
  * **Mapping:** `intent_score` is mapped to `final_score` for dashboard sorting, and `reasoning_summary` combines fit details with the text intent reasoning.

### Phase 4: Automated Triage & 3-Tier Routing
* **Conditional Routing:** An n8n **Switch Node ("Route by Score")** reads the calculated `final_score` and checks domain type.
* **Tier 1 (Enterprise / Hot - Score >= 80 & Business Domain):** Routes immediately to a Telegram alert bot, dispatching a priority alert to the sales channel. Sets status to `Hot Lead` in DB.
* **Tier 2 (Mid-Market / Warm - Score >= 50 and < 80 & Business Domain):** Sends a customized Gmail auto-reply referencing the prospect's industry. Sets status to `Nurture` in DB.
* **Tier 3 (PLG / Cold - Score < 50 or Freemium Domain):** Sends a standard PLG auto-reply recommending the free community edition. Sets status to `PLG` in DB.

### Phase 5: The Executive Dashboard
* **Database Syncing:** A final **Supabase node** performs an `upsert` matching on the `email` column, updating existing rows or inserting new ones with all raw telemetry (including fit, text intent, and final scores).
* **The UI Experience:** A secure Next.js administrative dashboard fetches leads from Supabase sorted by `intent_score DESC` (which holds the final combined score).

---

## 🗄️ Database Schema Specification

Execute the following DDL statement in your Supabase SQL Editor to provision the tracking structure:

```sql
create table public.leads (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text not null constraint leads_email_key unique,
    company_name text,
    company_domain text not null,
    employee_count integer,
    industry text,
    estimated_revenue text,
    original_message text,
    intent_score integer check (intent_score >= 1 and intent_score <= 100),
    icp_fit_score integer check (icp_fit_score >= 0 and icp_fit_score <= 100),
    text_intent_score integer check (text_intent_score >= 0 and text_intent_score <= 100),
    final_score integer check (final_score >= 0 and final_score <= 100),
    reasoning_summary text,
    status text default 'New'::text
);

-- Index optimization for real-time dashboard fetching
create index idx_leads_intent_score on public.leads (intent_score desc);