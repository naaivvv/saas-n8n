

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

### Phase 3: AI Intent Scoring (The Brain)
* **LLM Integration:** An n8n Advanced AI Node connects via API key to **Google Gemini (Gemini 2.5 Flash)** to maximize speed and token efficiency within the free usage tier.
* **System Prompt Engineering:** Gemini is configured with a strict persona as a *Senior SaaS Account Executive*. It analyzes the text query against the quantitative corporate profile retrieved from Apollo.io.
* **Structured Output Validation:** The model is constrained to reply exclusively in a valid minified JSON block matching this exact TypeScript interface:
    ```json
    {
      "intent_score": number, // Scale 1 to 100
      "reasoning_summary": string // Maximum 2 sentences detailing the score choice
    }
    ```

### Phase 4: Automated Triage & Routing
* **Conditional Routing:** An n8n **Switch Node** reads the numerical `intent_score` dynamically from the upstream LLM output.
* **High Intent Path (Score > 80):** Routes immediately to a Slack or Telegram webhook node. It dispatches a priority message to a `#sales-alerts` channel highlighting key account dimensions and the AI reasoning block.
* **Low Intent Path (Score < 80):** Routes to a Gmail node authenticated over OAuth2 to drop a warm, defensive auto-reply pointing to self-serve developer documentations and lower pricing tiers.

### Phase 5: The Executive Dashboard
* **Database Syncing:** A final terminal **Supabase node** captures all telemetry (raw inputs, Apollo firmographics, intent score, and reasoning) and upserts them cleanly into the PostgreSQL target table.
* **The UI Experience:** A secure Next.js administrative dashboard fetches rows back from Supabase sorted conditionally: `ORDER BY intent_score DESC`. Hot leads display clean red telemetry highlights at the top of the operational view.

---

## 🗄️ Database Schema Specification

Execute the following DDL statement in your Supabase SQL Editor to provision the tracking structure:

```sql
create table public.leads (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text not null,
    company_name text,
    company_domain text not null,
    employee_count integer,
    industry text,
    estimated_revenue text,
    original_message text,
    intent_score integer check (intent_score >= 1 and intent_score <= 100),
    reasoning_summary text,
    status text default 'New'::text
);

-- Index optimization for real-time dashboard fetching
create index idx_leads_intent_score on public.leads (intent_score desc);