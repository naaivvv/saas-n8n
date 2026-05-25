import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import LeadTable from "./components/LeadTable";
import TestLeadForm from "./components/TestLeadForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("intent_score", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
  }

  const validLeads = leads || [];
  const totalLeads = validLeads.length;

  const hotLeads = validLeads.filter((lead) => lead.intent_score >= 80).length;
  const avgScore = totalLeads > 0
    ? Math.round(validLeads.reduce((acc, curr) => acc + curr.intent_score, 0) / totalLeads)
    : 0;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8 md:py-12">
      <header className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
            Command center
          </p>
          <h1 className="mb-3 text-3xl font-semibold tracking-[-0.035em] text-white md:text-4xl">
            AeroLead Command
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-400">
            Real-time intent telemetry and algorithmic lead routing.
          </p>
        </div>
        <form action="/auth/signout" method="post" aria-label="Account actions">
          <button
            type="submit"
            className="rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none backdrop-blur-md transition-[transform,box-shadow,background-color,border-color] duration-[150ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-px hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_36px_-28px_rgba(148,163,184,0.8)] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0 active:scale-[0.98]"
            aria-label={`Sign out of AeroLead as ${user.email ?? "current user"}`}
          >
            Sign Out
          </button>
        </form>
      </header>

      <section aria-labelledby="lead-stats-title" className="mb-10">
        <h2 id="lead-stats-title" className="sr-only">
          Lead performance summary
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          <article
            className="stat-card-enter group rounded-[1.5rem] border border-white/[0.12] bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_22px_60px_-42px_rgba(15,23,42,0.9)] backdrop-blur-2xl transition-[transform,box-shadow,border-color,background-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_28px_70px_-46px_rgba(148,163,184,0.8)] md:p-7"
            style={{ animationDelay: "0ms" }}
            aria-labelledby="total-leads-label"
            aria-describedby="total-leads-value"
          >
            <dl>
              <dt id="total-leads-label" className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Leads
              </dt>
              <dd id="total-leads-value" className="font-mono text-5xl font-semibold tracking-[-0.06em] text-white transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5">
                {totalLeads}
              </dd>
            </dl>
          </article>
          <article
            className="stat-card-enter group rounded-[1.5rem] border border-danger/[0.18] bg-danger/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_22px_60px_-44px_rgba(244,63,94,0.5)] backdrop-blur-2xl transition-[transform,box-shadow,border-color,background-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:border-danger/30 hover:bg-danger/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_28px_70px_-46px_rgba(244,63,94,0.62)] md:p-7"
            style={{ animationDelay: "45ms" }}
            aria-labelledby="hot-leads-label"
            aria-describedby="hot-leads-value"
          >
            <dl>
              <dt id="hot-leads-label" className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Hot Leads (&ge;80)
              </dt>
              <dd id="hot-leads-value" className="font-mono text-5xl font-semibold tracking-[-0.06em] text-danger transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5">
                {hotLeads}
              </dd>
            </dl>
          </article>
          <article
            className="stat-card-enter group rounded-[1.5rem] border border-primary/[0.18] bg-primary/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_22px_60px_-44px_rgba(56,223,242,0.5)] backdrop-blur-2xl transition-[transform,box-shadow,border-color,background-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_28px_70px_-46px_rgba(56,223,242,0.62)] md:p-7"
            style={{ animationDelay: "90ms" }}
            aria-labelledby="avg-score-label"
            aria-describedby="avg-score-value"
          >
            <dl>
              <dt id="avg-score-label" className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Avg Intent Score
              </dt>
              <dd id="avg-score-value" className="font-mono text-5xl font-semibold tracking-[-0.06em] text-primary transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5">
                {avgScore}
              </dd>
            </dl>
          </article>
        </div>
      </section>

      <section aria-label="Create a test lead" className="mb-8">
        <TestLeadForm />
      </section>

      <section aria-label="Lead records">
        <LeadTable initialLeads={validLeads} />
      </section>
    </main>
  );
}
