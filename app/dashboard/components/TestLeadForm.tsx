"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitTestLead } from "@/app/actions/leadActions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-12 mt-4"
    >
      {pending ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        "Simulate Lead"
      )}
    </button>
  );
}

export default function TestLeadForm() {
  const [state, formAction] = useFormState(submitTestLead, null);

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Test Lead Generation</h2>
        <p className="text-neutral text-sm">
          Simulate an inbound lead. Use employee counts and industry to test the 3-Tier routing logic (Enterprise, Mid-Market, PLG).
        </p>
      </div>

      {state?.success && (
        <div className="mb-6 p-4 bg-accent/20 border border-accent/50 text-accent rounded-xl text-center">
          <p className="font-medium">Test lead sent successfully!</p>
          <p className="text-sm opacity-80 mt-1">Check the lead table in a few moments.</p>
        </div>
      )}

      {state?.error && (
        <div className="mb-6 p-4 bg-danger/20 border border-danger/50 text-danger rounded-xl text-center text-sm font-medium">
          {state.error}
        </div>
      )}

      <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className={`w-full bg-black/20 border ${
                state?.fields?.name ? "border-danger focus:ring-danger/50" : "border-white/10 focus:ring-primary/50"
              } rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all text-white`}
              placeholder="Test User"
            />
            {state?.fields?.name && <p className="text-danger text-xs mt-1">{state.fields.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral mb-1">
              Work Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className={`w-full bg-black/20 border ${
                state?.fields?.email ? "border-danger focus:ring-danger/50" : "border-white/10 focus:ring-primary/50"
              } rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all text-white`}
              placeholder="test@company.com"
            />
            {state?.fields?.email && <p className="text-danger text-xs mt-1">{state.fields.email}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-neutral mb-1">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={3}
              className={`w-full bg-black/20 border ${
                state?.fields?.message ? "border-danger focus:ring-danger/50" : "border-white/10 focus:ring-primary/50"
              } rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all text-white resize-none`}
              placeholder="Testing the lead ingestion..."
            />
            {state?.fields?.message && <p className="text-danger text-xs mt-1">{state.fields.message}</p>}
          </div>
        </div>

        {/* Enrichment Overrides (Optional) */}
        <div className="space-y-4 md:border-l md:border-white/10 md:pl-4">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-primary">Optional Enrichment Data</h3>
            <p className="text-xs text-neutral">Simulate data normally found by Clearbit/Apollo.</p>
          </div>

          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-neutral mb-1">
              Company Name
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              className="w-full bg-black/20 border border-white/10 focus:ring-primary/50 rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all text-white"
              placeholder="Test Corp"
            />
          </div>

          <div>
            <label htmlFor="employee_count" className="block text-sm font-medium text-neutral mb-1">
              Employee Count
            </label>
            <input
              type="number"
              id="employee_count"
              name="employee_count"
              className={`w-full bg-black/20 border ${
                state?.fields?.employee_count ? "border-danger focus:ring-danger/50" : "border-white/10 focus:ring-primary/50"
              } rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all text-white`}
              placeholder="e.g. 500"
            />
             {state?.fields?.employee_count && <p className="text-danger text-xs mt-1">{state.fields.employee_count}</p>}
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-neutral mb-1">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              className="w-full bg-black/20 border border-white/10 focus:ring-primary/50 rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all text-white"
              placeholder="e.g. Software"
            />
          </div>

          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
