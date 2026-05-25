import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for testing the pipeline and seeing the magic.",
    features: [
      "Up to 500 leads/month",
      "Basic firmographic enrichment",
      "Standard intent scoring",
      "Email fallbacks",
      "Community support",
    ],
    ctaText: "Start for free",
    ctaHref: "#",
    isPopular: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "For growing teams that need reliable lead intelligence.",
    features: [
      "Up to 5,000 leads/month",
      "Advanced Apollo enrichment",
      "Custom AI system prompts",
      "Telegram & Slack routing",
      "Priority email support",
    ],
    ctaText: "Get Pro",
    ctaHref: "#",
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Uncapped scaling and dedicated architectural support.",
    features: [
      "Unlimited leads/month",
      "Real-time CRM bidirectional sync",
      "Fine-tuned scoring models",
      "Custom webhook integrations",
      "24/7 dedicated support",
    ],
    ctaText: "Request Demo",
    ctaHref: "#demo",
    isPopular: false,
  },
];

export default function PricingMatrix() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-neutral text-lg max-w-2xl mx-auto">
          Start for free, then scale as your lead volume grows. Zero hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              tier.isPopular
                ? "bg-gradient-to-b from-white/10 to-white/5 border-2 border-primary shadow-xl shadow-primary/20 md:-translate-y-4"
                : "bg-white/5 border border-white/10"
            } backdrop-blur-xl`}
          >
            {tier.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">{tier.name}</h3>
              <p className="text-neutral text-sm h-10">{tier.description}</p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-extrabold">{tier.price}</span>
              {tier.price !== "Custom" && <span className="text-neutral">/mo</span>}
            </div>
            <ul className="space-y-4 mb-8">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 ${tier.isPopular ? "text-accent" : "text-neutral"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={tier.ctaHref}
              className={`block w-full py-3 px-6 rounded-full text-center font-semibold transition-colors ${
                tier.isPopular
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {tier.ctaText}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
