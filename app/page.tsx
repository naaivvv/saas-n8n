import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingMatrix from "@/components/PricingMatrix";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.18),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.86),transparent)]" />
      <div className="pointer-events-none absolute -right-48 top-24 -z-10 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -left-40 top-[34%] -z-10 h-[360px] w-[360px] rounded-full bg-accent/[0.08] blur-[150px]" />

      <Navbar />

      <main className="flex flex-1 flex-col items-center">
        <section
          aria-labelledby="home-hero-title"
          className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-28 pt-28 text-center md:px-8 md:pb-36 md:pt-36 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:text-left"
        >
          <div>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.34em] text-primary/85">
              Initializing AeroLead
            </p>
            <h1
              id="home-hero-title"
              className="mb-7 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-white md:text-6xl lg:text-7xl"
            >
              Algorithmic inbound for sharper lead routing.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl lg:mx-0">
              Score, classify, and route high-value prospects from live intent signals, with webhook-ready handoffs for the stack your team already runs.
            </p>
            <nav
              aria-label="Primary calls to action"
              className="flex flex-col items-center gap-3 sm:flex-row lg:items-start"
            >
              <Link
                href="/dashboard"
                className="w-full rounded-full bg-primary px-7 py-3.5 text-center text-sm font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_50px_-24px_rgba(56,223,242,0.8)] outline-none transition-[transform,box-shadow,background-color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:scale-[1.015] hover:bg-primary/90 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_22px_58px_-26px_rgba(56,223,242,0.95)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0 active:scale-[0.98] sm:w-auto"
                aria-label="Go to the AeroLead dashboard"
              >
                See It In Action
              </Link>
              <Link
                href="#pricing"
                className="w-full rounded-full border border-white/[0.12] bg-white/[0.04] px-7 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none backdrop-blur-md transition-[transform,box-shadow,background-color,border-color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:scale-[1.015] hover:border-white/25 hover:bg-white/[0.075] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_48px_-32px_rgba(148,163,184,0.65)] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0 active:scale-[0.98] sm:w-auto"
                aria-label="View AeroLead pricing"
              >
                View Pricing
              </Link>
            </nav>
          </div>

          <aside
            className="mx-auto w-full max-w-md rounded-[2rem] border border-white/[0.12] bg-slate-950/45 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_30px_80px_-48px_rgba(0,243,255,0.55)] backdrop-blur-2xl lg:mx-0 lg:justify-self-end"
            aria-label="AeroLead routing preview"
          >
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Intent stream</p>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Live
              </span>
            </div>
            <div className="space-y-4">
              {[
                ["Enterprise demo request", "92", "Route to AE"],
                ["Pricing page revisit", "78", "Nurture sequence"],
                ["Integration docs viewed", "64", "Webhook alert"],
              ].map(([signal, score, action]) => (
                <article
                  key={signal}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h2 className="text-sm font-semibold leading-6 text-white">{signal}</h2>
                    <p className="font-mono text-2xl font-semibold tracking-tight text-primary">{score}</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">{action}</p>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section
          id="pricing"
          aria-labelledby="pricing-title"
          className="w-full border-t border-white/[0.08] bg-slate-950/55"
        >
          <h2 id="pricing-title" className="sr-only">
            AeroLead pricing
          </h2>
          <PricingMatrix />
        </section>
      </main>

      <Footer />
    </div>
  );
}
