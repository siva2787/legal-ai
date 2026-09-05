import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Scale,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Table
} from 'lucide-react';
import { PCR_2011_RULES, FIRST_SCHEDULE_MPE, SECOND_SCHEDULE_COMMODITIES } from '../../legal/pcr2011Data';

export function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'mpe' | 'quantities'>('rules');
  const [search, setSearch] = useState('');
  const [expandedRule, setExpandedRule] = useState<string | null>('LM-PC-R6');

  const filteredRules = PCR_2011_RULES.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.summary.toLowerCase().includes(search.toLowerCase()) ||
      r.rule_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="knowledge-base-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Authoritative Legal Knowledge Base
        </h1>
        <p className="text-sm text-slate-500">
          Statutory repository of the Legal Metrology (Packaged Commodities) Rules, 2011 and Schedules.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rules'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>PCR-2011 Rules (1–34)</span>
        </button>

        <button
          onClick={() => setActiveTab('mpe')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'mpe'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>First Schedule: MPE Tolerances</span>
        </button>

        <button
          onClick={() => setActiveTab('quantities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quantities'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Second Schedule: Standard Quantities</span>
        </button>
      </div>

      {/* Tab Content 1: Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by rule number, declaration, or topic..."
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            {filteredRules.map((r) => {
              const isOpen = expandedRule === r.rule_id;

              return (
                <div
                  key={r.rule_id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedRule(isOpen ? null : r.rule_id)}
                    className="p-4 cursor-pointer hover:bg-slate-50/70 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Rule {r.rule_number}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                        <p className="text-xs text-slate-500">{r.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {r.chapter}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                      <div>
                        <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                          Source Document Reference
                        </div>
                        <p className="text-slate-600 font-mono text-[11px]">
                          {r.source_document} ({r.source_page}) • {r.legal_version}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: First Schedule (MPE Table) */}
      {activeTab === 'mpe' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                First Schedule: Maximum Permissible Error (MPE)
              </h2>
              <p className="text-xs text-slate-500">
                Statutory error limits on net quantity of packaged commodities under Rule 22
              </p>
            </div>
            <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
              Rule 22 Standard
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Declared Quantity Range</th>
                  <th className="py-3 px-4">Maximum Permissible Error</th>
                  <th className="py-3 px-4">Schedule Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FIRST_SCHEDULE_MPE.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {row.min_quantity} {row.unit} to {row.max_quantity} {row.unit}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {row.error_type === 'percentage'
                        ? `${row.error_value}%`
                        : `${row.error_value} ${row.unit}`}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {row.schedule_reference} ({row.source_page})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Second Schedule (Standard Commodities) */}
      {activeTab === 'quantities' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Second Schedule: Permissible Standard Pack Quantities
            </h2>
            <p className="text-xs text-slate-500">
              Prescribed quantities for retail sale under Rule 5. Any other pack size is a violation unless exempted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECOND_SCHEDULE_COMMODITIES.map((comm) => (
              <div
                key={comm.commodity_name}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{comm.commodity_name}</h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {comm.category}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Permitted Pack Sizes:</span>{' '}
                  <span className="font-mono text-slate-900 font-bold">
                    {comm.permitted_quantities.map((q) => `${q.value} ${q.unit}`).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
