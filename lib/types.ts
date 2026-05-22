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
