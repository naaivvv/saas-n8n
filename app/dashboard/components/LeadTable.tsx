"use client";

import React, { useState } from "react";
import { Lead } from "@/lib/types";
import ScoreBadge from "./ScoreBadge";

export default function LeadTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads] = useState<Lead[]>(initialLeads);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-neutral font-medium uppercase tracking-wider text-xs border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Industry</th>
              <th className="px-6 py-4">Employees</th>
              <th className="px-6 py-4">Intent</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral">
                  No leads found in the database.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <React.Fragment key={lead.id}>
                  <tr
                    onClick={() => toggleRow(lead.id)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-xs text-neutral">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{lead.company_name || "Unknown"}</div>
                      <div className="text-xs text-neutral">{lead.company_domain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral">
                      {lead.industry || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral">
                      {lead.employee_count ? lead.employee_count.toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ScoreBadge score={lead.intent_score} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral text-xs">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                  
                  {expandedRow === lead.id && (
                    <tr className="bg-black/20">
                      <td colSpan={6} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-xs font-bold text-neutral uppercase tracking-wider mb-2">
                              Original Request
                            </h4>
                            <p className="text-sm text-neutral-300 italic border-l-2 border-primary/30 pl-4 py-1">
                              &quot;{lead.original_message}&quot;
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neutral uppercase tracking-wider mb-2">
                              AI Reasoning
                            </h4>
                            <p className="text-sm text-neutral-300">
                              {lead.reasoning_summary || "No reasoning provided."}
                            </p>
                            
                            {lead.estimated_revenue && (
                              <div className="mt-4 inline-block bg-primary/10 border border-primary/20 rounded px-3 py-1 text-xs text-primary font-medium">
                                Revenue: {lead.estimated_revenue}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
