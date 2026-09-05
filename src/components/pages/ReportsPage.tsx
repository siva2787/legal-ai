import React, { useState } from 'react';
import { FileText, Download, Printer, Search, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import { InspectionRecord } from '../../types';

interface ReportsPageProps {
  inspections: InspectionRecord[];
  onOpenReport: (id: string) => void;
}

export function ReportsPage({ inspections, onOpenReport }: ReportsPageProps) {
  const [search, setSearch] = useState('');

  const filtered = inspections.filter(
    (ins) =>
      ins.inspection_number.toLowerCase().includes(search.toLowerCase()) ||
      ins.product_context.product_name.toLowerCase().includes(search.toLowerCase()) ||
      ins.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="reports-library-page" className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Inspection Reports Library
          </h1>
          <p className="text-sm text-slate-500">
            Digitally certified inspection dossiers and statutory notices for enforcement.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report dossier by ID or product..."
            className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Report Dossier ID</th>
              <th className="py-3.5 px-4">Commodity / Manufacturer</th>
              <th className="py-3.5 px-4">Inspection Date</th>
              <th className="py-3.5 px-4">Enforcement Verdict</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((ins) => {
              const status = ins.compliance_summary?.overall_status || 'COMPLIANT';
              const isPass = status === 'COMPLIANT';

              return (
                <tr key={ins.id} className="hover:bg-slate-50/60">
                  <td className="py-4 px-4 font-mono font-bold text-blue-700">
                    REP-{ins.inspection_number.replace('INS-', '')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{ins.product_context.product_name}</div>
                    <div className="text-[11px] text-slate-500">{ins.product_context.manufacturer}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {new Date(ins.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        isPass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => onOpenReport(ins.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
