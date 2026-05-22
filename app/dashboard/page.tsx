import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import LeadTable from "./components/LeadTable";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  
  // 1. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch Leads
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("intent_score", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
  }

  const validLeads = leads || [];
  const totalLeads = validLeads.length;
  
  const hotLeads = validLeads.filter(l => l.intent_score >= 80).length;
  const avgScore = totalLeads > 0 
    ? Math.round(validLeads.reduce((acc, curr) => acc + curr.intent_score, 0) / totalLeads)
    : 0;

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Lead Intelligence</h1>
          <p className="text-neutral">Manage and analyze your inbound pipeline</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10 text-white">
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-neutral mb-1">Total Leads</h3>
          <p className="text-4xl font-extrabold text-white">{totalLeads}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-neutral mb-1">Hot Leads (&ge;80)</h3>
          <p className="text-4xl font-extrabold text-danger">{hotLeads}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-neutral mb-1">Avg Intent Score</h3>
          <p className="text-4xl font-extrabold text-primary">{avgScore}</p>
        </div>
      </div>

      <LeadTable initialLeads={validLeads} />
    </div>
  );
}
