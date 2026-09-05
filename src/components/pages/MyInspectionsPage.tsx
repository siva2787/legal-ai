import React, { useState } from 'react';
import {
  Search,
  Filter,
  Camera,
  Download,
  Eye,
  FileText,
  ChevronDown,
  ArrowUpDown,
  Package
} from 'lucide-react';
import { InspectionRecord } from '../../types';

interface MyInspectionsPageProps {
  inspections: InspectionRecord[];
  onStartNew: () => void;
  onViewInspection: (id: string) => void;
  onViewReport: (id: string) => void;
}

export function MyInspectionsPage({
  inspections,
  onStartNew,
  onViewInspection,
  onViewReport
}: MyInspectionsPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = inspections.filter((ins) => {
    const matchesStatus =
      statusFilter === 'ALL' || ins.compliance_summary?.overall_status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      ins.inspection_number.toLowerCase().includes(q) ||
      ins.product_context.product_name.toLowerCase().includes(q) ||
      ins.product_context.brand.toLowerCase().includes(q) ||
      ins.location.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div id="my-inspections-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            My Inspections
          </h1>
          <p className="text-sm text-slate-500">
            Comprehensive audit log of packaged commodity inspections, verdicts, and statutory reports.
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all text-xs self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, product, brand, or zone..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'COMPLIANT', label: 'Compliant' },
            { id: 'NON-COMPLIANT', label: 'Non-Compliant' },
            { id: 'REVIEW_REQUIRED', label: 'Under Review' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Inspection #</th>
                <th className="py-3.5 px-4">Commodity & Brand</th>
                <th className="py-3.5 px-4">Declared Specs</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Zone / Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((ins) => {
                const status = ins.compliance_summary?.overall_status || 'COMPLIANT';
                const isPass = status === 'COMPLIANT';
                const isFail = status === 'NON-COMPLIANT';

                return (
                  <tr key={ins.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-blue-700">
                      {ins.inspection_number}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {ins.images[0]?.data_url ? (
                            <img
                              src={ins.images[0].data_url}
                              alt="Commodity"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {ins.product_context.product_name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {ins.product_context.brand}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-slate-800 font-bold">
                        {ins.product_context.net_quantity} {ins.product_context.net_quantity_unit}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        MRP ₹ {ins.product_context.mrp.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(ins.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-4 px-4 text-slate-600">{ins.location}</td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isFail
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPass ? 'bg-emerald-500' : isFail ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        ></span>
                        {isPass ? 'Compliant' : isFail ? 'Non-Compliant' : 'Review'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewInspection(ins.id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => onViewReport(ins.id)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Report</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
