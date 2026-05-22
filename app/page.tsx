import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingMatrix from "@/components/PricingMatrix";
import DemoForm from "@/components/DemoForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[20%] -left-[200px] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] -z-10 pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-4 pt-32 pb-24 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide">
            Introducing LeadIntel 2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Automate Your Inbound <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Lead Intelligence
            </span>
          </h1>
          <p className="text-xl text-neutral max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly enrich, score, and route &quot;Request Demo&quot; submissions with zero-cost architecture. Send high-intent leads straight to Slack and auto-reply to the rest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1"
            >
              See It In Action
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold text-lg transition-all"
            >
              View Pricing
            </Link>
          </div>
        </section>

        {/* Pricing Matrix Section */}
        <section id="pricing" className="w-full border-t border-white/5 bg-black/20">
          <PricingMatrix />
        </section>

        {/* Demo Form Section */}
        <section className="w-full relative">
          {/* Subtle background glow for the form section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] -z-10 pointer-events-none" />
          <DemoForm />
        </section>
      </main>

      <Footer />
    </div>
  );
}
