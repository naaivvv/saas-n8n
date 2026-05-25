alter table public.leads
  add constraint leads_email_unique unique (email);
