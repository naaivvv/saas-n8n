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
