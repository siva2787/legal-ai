import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { InspectionRecord } from '../../types';

interface ProductsPageProps {
  inspections: InspectionRecord[];
  onViewProductInspection: (id: string) => void;
}

export function ProductsPage({ inspections, onViewProductInspection }: ProductsPageProps) {
  const [search, setSearch] = useState('');

  const filteredInspections = inspections.filter((ins) => {
    const q = search.toLowerCase();
    const ctx = ins.product_context;
    return (
      ctx.product_name?.toLowerCase().includes(q) ||
      ctx.brand?.toLowerCase().includes(q) ||
      ctx.manufacturer?.toLowerCase().includes(q) ||
      ctx.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div id="products-page" className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Packaged Commodity Registry
          </h1>
          <p className="text-sm text-slate-500">
            Catalog of inspected commercial commodities, pack variants, and brand histories.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands or manufacturers..."
            className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredInspections.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <Package className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold">No commodities matched "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInspections.map((ins) => {
            const status = ins.compliance_summary?.overall_status || 'COMPLIANT';
            const isPass = status === 'COMPLIANT';
            const isFail = status === 'NON-COMPLIANT';

            return (
              <div
                key={ins.id}
                className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tracking-wide">
                    {ins.product_context.category || 'Commodity'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isPass
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isFail
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                  >
                    {isPass ? 'Compliant' : isFail ? 'Non-Compliant' : 'Review'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {ins.images[0]?.data_url ? (
                      <img
                        src={ins.images[0].data_url}
                        alt={ins.product_context.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {ins.product_context.product_name}
                    </h3>
                    <div className="text-xs font-semibold text-blue-600">{ins.product_context.brand}</div>
                    <div className="text-[11px] text-slate-500">
                      Declared: {ins.product_context.net_quantity} {ins.product_context.net_quantity_unit} • ₹{' '}
                      {ins.product_context.mrp.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {ins.product_context.manufacturer}
                  </span>
                  <button
                    onClick={() => onViewProductInspection(ins.id)}
                    className="shrink-0 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
                  >
                    View Inspection
                    <span className="font-black">&gt;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}