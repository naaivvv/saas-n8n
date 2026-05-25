ALTER TABLE public.leads
ADD COLUMN icp_fit_score integer CHECK (icp_fit_score >= 0 AND icp_fit_score <= 100),
ADD COLUMN text_intent_score integer CHECK (text_intent_score >= 0 AND text_intent_score <= 100),
ADD COLUMN final_score integer CHECK (final_score >= 0 AND final_score <= 100);
