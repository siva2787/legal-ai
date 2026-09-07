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

      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        <table className="w-full text-left border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="bg-slate-100 font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4 border-r border-b border-slate-300">Report Dossier ID</th>
              <th className="py-3.5 px-4 border-r border-b border-slate-300">Commodity / Manufacturer</th>
              <th className="py-3.5 px-4 border-r border-b border-slate-300">Inspection Date</th>
              <th className="py-3.5 px-4 border-r border-b border-slate-300">Enforcement Verdict</th>
              <th className="py-3.5 px-4 text-right border-b border-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ins, idx) => {
              const status = ins.compliance_summary?.overall_status || 'COMPLIANT';
              const isPass = status === 'COMPLIANT';

              return (
                <tr key={ins.id} className={idx % 2 === 1 ? 'bg-slate-50/50 hover:bg-slate-100/60' : 'hover:bg-slate-100/60'}>
                  <td className="py-4 px-4 font-mono font-bold text-blue-800 border-r border-b border-slate-200">
                    REP-{ins.inspection_number.replace('INS-', '')}
                  </td>
                  <td className="py-4 px-4 border-r border-b border-slate-200">
                    <div className="font-bold text-slate-900">{ins.product_context.product_name}</div>
                    <div className="text-[11px] text-slate-500">{ins.product_context.manufacturer}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap border-r border-b border-slate-200">
                    {new Date(ins.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-4 border-r border-b border-slate-200">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] whitespace-nowrap ${isPass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                    >
                      {status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right border-b border-slate-200">
                    <button
                      onClick={() => onOpenReport(ins.id)}
                      className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded text-xs transition-all shadow-xs"
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