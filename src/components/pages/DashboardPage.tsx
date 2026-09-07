import React, { useState, useEffect } from 'react';
import {
  Camera,
  ShieldCheck,
  AlertTriangle,
  Package,
  FileText,
  Calendar,
  MoreVertical,
  ArrowRight,
  Scale,
  Users,
  Sprout,
  Eye,
  ChevronDown
} from 'lucide-react';
import { InspectionRecord, UserProfile } from '../../types';
import dashboardWelcomeBg from '../../assets/dashboard-welcome-bg.png';
import dashboardBharatBanner from '../../assets/dashboard-bharat-banner.png';

interface DashboardPageProps {
  user: UserProfile;
  inspections: InspectionRecord[];
  onStartNewInspection: () => void;
  onViewInspection: (inspectionId: string) => void;
  onViewAllInspections: () => void;
  onViewAllTasks: () => void;
}

export function DashboardPage({
  user,
  inspections,
  onStartNewInspection,
  onViewInspection,
  onViewAllInspections,
  onViewAllTasks
}: DashboardPageProps) {
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setLiveStats(data);
        }
      })
      .catch((err) => {
        console.warn('Live analytics fetch fallback:', err);
      });
  }, [inspections.length]);

  // Key Dynamic Metrics
  const totalInspections = liveStats?.total_inspections ?? inspections.length;
  const compliantCount =
    liveStats?.compliant_count ??
    inspections.filter((i) => i.compliance_summary?.overall_status === 'COMPLIANT').length;
  const nonCompliantCount =
    liveStats?.non_compliant_count ??
    inspections.filter((i) => i.compliance_summary?.overall_status === 'NON-COMPLIANT').length;
  const reviewCount =
    liveStats?.review_count ??
    inspections.filter((i) => i.compliance_summary?.overall_status === 'REVIEW_REQUIRED').length;
  const productsCovered =
    liveStats?.products_covered ??
    new Set(inspections.map((i) => i.product_context?.product_name || 'Commodity')).size;
  const complianceRate =
    liveStats?.compliance_rate ??
    (totalInspections > 0 ? Math.round((compliantCount / totalInspections) * 100) : 100);

  const categoriesList = liveStats?.categories_breakdown?.length
    ? liveStats.categories_breakdown
    : (liveStats?.categories?.length
      ? liveStats.categories.map((c: any, i: number) => ({
        category: c.name,
        count: c.count,
        percentage: c.percentage,
        color: ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-sky-500'][i % 5]
      }))
      : []);

  // Compliance Overview period filter
  const PERIOD_OPTIONS: { value: '7' | '30' | '90' | 'all'; label: string }[] = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];
  const [compliancePeriod, setCompliancePeriod] = useState<'7' | '30' | '90' | 'all'>('30');
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

  const periodFilteredInspections = React.useMemo(() => {
    if (compliancePeriod === 'all') return inspections;
    const days = parseInt(compliancePeriod, 10);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return inspections.filter((i) => {
      const t = new Date(i.created_at as any).getTime();
      return !isNaN(t) && t >= cutoff;
    });
  }, [inspections, compliancePeriod]);

  const usingDefaultPeriod = compliancePeriod === '30';
  const periodTotal = usingDefaultPeriod ? totalInspections : periodFilteredInspections.length;
  const periodCompliant = usingDefaultPeriod
    ? compliantCount
    : periodFilteredInspections.filter((i) => i.compliance_summary?.overall_status === 'COMPLIANT').length;
  const periodNonCompliant = usingDefaultPeriod
    ? nonCompliantCount
    : periodFilteredInspections.filter((i) => i.compliance_summary?.overall_status === 'NON-COMPLIANT').length;
  const periodReview = usingDefaultPeriod
    ? reviewCount
    : periodFilteredInspections.filter((i) => i.compliance_summary?.overall_status === 'REVIEW_REQUIRED').length;
  const periodRate = usingDefaultPeriod
    ? complianceRate
    : (periodTotal > 0 ? Math.round((periodCompliant / periodTotal) * 100) : 0);
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === compliancePeriod)?.label ?? 'Last 30 Days';

  // Product Categories catalog filter
  const CATALOG_OPTIONS: { value: 'active' | 'all'; label: string }[] = [
    { value: 'active', label: 'Active Catalog' },
    { value: 'all', label: 'All Products' },
  ];
  const [catalogFilter, setCatalogFilter] = useState<'active' | 'all'>('active');
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);

  const allTimeCategoriesList = React.useMemo(() => {
    const map = new Map<string, number>();
    inspections.forEach((i: any) => {
      const cat = i.product_context?.category || i.product_context?.product_name || 'Uncategorized';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    const total = inspections.length || 1;
    const palette = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500'];
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count], idx) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
        color: palette[idx % palette.length],
      }));
  }, [inspections]);

  const displayedCategoriesList = catalogFilter === 'active' ? categoriesList : allTimeCategoriesList;
  const catalogLabel = CATALOG_OPTIONS.find((o) => o.value === catalogFilter)?.label ?? 'Active Catalog';

  const todayWeekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div id="dashboard-page" className="p-6 pb-2 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl border border-blue-200/80 relative overflow-hidden shadow-xs">
        <img
          src={dashboardWelcomeBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent"></div>

        <div className="relative z-10 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[220px]">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-blue-700 tracking-wider uppercase">
              WELCOME BACK
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {user.name}
            </h1>
            <p className="text-sm text-slate-600 font-medium max-w-xl">
              Your inspections help build a fairer and safer marketplace.
            </p>

            {/* 4 Value Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Fair Trade
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Consumer Protection
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                Rule Compliance
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                Stronger India
              </span>
            </div>
          </div>

          {/* Quote — floating glass chip, legible over any part of the photo */}
          <div className="hidden lg:flex lg:col-span-4 justify-center">
            <div
              className="italic text-sm font-bold text-slate-800 text-center px-4 py-2.5 rounded-xl bg-white/55 backdrop-blur-md border border-white/60 shadow-sm max-w-[220px]"
            >
              “A Fair Marketplace Builds a Stronger Tomorrow.”
            </div>
          </div>

          {/* Date Card */}
          <div className="lg:col-span-3 flex justify-end">
            <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 text-right shadow-md w-full sm:w-auto">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {todayWeekday}
              </div>
              <div className="text-base font-black text-slate-900">
                {todayDateStr}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Keep ensuring compliance for a better tomorrow.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <style>{`
        @keyframes dashCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dashSparkDraw {
          from { stroke-dashoffset: 140; }
          to { stroke-dashoffset: 0; }
        }
        .dash-metric-card {
          animation: dashCardIn 0.45s ease-out both;
        }
        .dash-metric-card .dash-spark {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: dashSparkDraw 1.1s 0.3s ease-out forwards;
        }
        .dash-metric-card:hover .dash-spark {
          animation: dashSparkDraw 0.8s ease-out forwards;
        }
      `}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div
          className="dash-metric-card group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 cursor-default"
          style={{ animationDelay: '0ms' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight transition-colors duration-300 group-hover:text-blue-600">{totalInspections}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Total Inspections</div>
          </div>
          {/* Mini SVG Sparkline */}
          <svg className="w-20 h-10 text-blue-500 stroke-current fill-none stroke-2" viewBox="0 0 100 40">
            <path className="dash-spark" d="M0 35 Q 25 30, 50 15 T 100 5" />
          </svg>
        </div>

        {/* Metric 2 */}
        <div
          className="dash-metric-card group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200 cursor-default"
          style={{ animationDelay: '60ms' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight transition-colors duration-300 group-hover:text-emerald-600">{compliantCount}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Compliant Products</div>
          </div>
          <svg className="w-20 h-10 text-emerald-500 stroke-current fill-none stroke-2" viewBox="0 0 100 40">
            <path className="dash-spark" d="M0 30 Q 30 25, 60 10 T 100 8" />
          </svg>
        </div>

        {/* Metric 3 */}
        <div
          className="dash-metric-card group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-rose-200 cursor-default"
          style={{ animationDelay: '120ms' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight transition-colors duration-300 group-hover:text-rose-600">{nonCompliantCount}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Non-Compliant Products</div>
          </div>
          <svg className="w-20 h-10 text-rose-500 stroke-current fill-none stroke-2" viewBox="0 0 100 40">
            <path className="dash-spark" d="M0 10 Q 30 15, 60 30 T 100 35" />
          </svg>
        </div>

        {/* Metric 4 */}
        <div
          className="dash-metric-card group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-purple-200 cursor-default"
          style={{ animationDelay: '180ms' }}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <Package className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight transition-colors duration-300 group-hover:text-purple-600">{productsCovered}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Products Covered</div>
            <div className="text-[11px] font-medium text-slate-400 mt-2">
              Across {categoriesList.length} categor{categoriesList.length === 1 ? 'y' : 'ies'}
            </div>
          </div>
          <svg className="w-20 h-10 text-purple-500 stroke-current fill-none stroke-2" viewBox="0 0 100 40">
            <path className="dash-spark" d="M0 25 Q 35 10, 70 30 T 100 12" />
          </svg>
        </div>
      </div>

      {/* Main Grid: Left (Tables) & Right (CTAs & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Inspections Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recent Inspections</h2>
              <button
                onClick={onViewAllInspections}
                className="group inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <span>View All</span>
                <span className="text-sm leading-none translate-y-[-1px] transition-transform group-hover:translate-x-0.5">›</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspections.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="font-semibold text-slate-600 text-xs">No inspections recorded yet</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Click "Start New Inspection" to evaluate your first packaged commodity</div>
                      </td>
                    </tr>
                  ) : (
                    inspections.slice(0, 6).map((ins) => {
                      const status = ins.compliance_summary?.overall_status || 'COMPLIANT';
                      const isPass = status === 'COMPLIANT';
                      const isFail = status === 'NON-COMPLIANT';
                      const isReview = status === 'REVIEW_REQUIRED';

                      return (
                        <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors duration-200 hover:shadow-[inset_2px_0_0_0_#2563EB]">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 text-xs">
                            {ins.inspection_number}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                {ins.images[0]?.data_url ? (
                                  <img src={ins.images[0].data_url} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <span>{ins.product_context.product_name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{ins.product_context.brand}</td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(ins.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}{' '}
                            {new Date(ins.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isPass
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isFail
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${isPass ? 'bg-emerald-500' : isFail ? 'bg-rose-500' : 'bg-amber-500'
                                  }`}
                              ></span>
                              {isPass ? 'Compliant' : isFail ? 'Non-Compliant' : 'Under Review'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onViewInspection(ins.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Upcoming Tasks & Enforcement Actions</h2>
              <button
                onClick={onViewAllTasks}
                className="group inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
              >
                <span>View All Alerts</span>
                <span className="text-sm leading-none translate-y-[-1px] transition-transform group-hover:translate-x-0.5">›</span>
              </button>
            </div>

            <div className="space-y-3">
              {nonCompliantCount > 0 && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Follow up: Statutory Notices</div>
                      <div className="text-[11px] text-slate-500">{nonCompliantCount} non-compliant commodity notice{nonCompliantCount === 1 ? '' : 's'} pending dispatch</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">Urgent</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Weekly Inspection Dossier Submission</div>
                    <div className="text-[11px] text-slate-500">Jurisdiction: {user.zone || 'District Enforcement Area'}</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">Scheduled</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Department Standards Review</div>
                    <div className="text-[11px] text-slate-500">Cross-verification of Rule 6 declarations with state lab</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">Routine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Start New Inspection CTA Card */}
          <div
            id="start-new-inspection-card"
            onClick={onStartNewInspection}
            className="cursor-pointer bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-6 shadow-md shadow-blue-500/20 relative overflow-hidden transition-all group"
          >
            {/* Corner Decorative Camera HUD lines */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/40"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/40"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                <Camera className="w-7 h-7" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-1">Start New Inspection</h3>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Scan or upload package images to begin inspection
            </p>
          </div>

          {/* Compliance Overview Donut */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Compliance Overview</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPeriodMenuOpen((v) => !v)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {periodLabel} <ChevronDown className={`w-3 h-3 transition-transform ${periodMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {periodMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setPeriodMenuOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-20">
                      {PERIOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setCompliancePeriod(opt.value);
                            setPeriodMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-semibold cursor-pointer ${opt.value === compliancePeriod
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Donut Chart with Center Percentage */}
            <div className="relative flex items-center justify-center py-4">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                {/* Compliant Segment */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="14"
                  strokeDasharray="301.6"
                  strokeDashoffset={301.6 * (1 - periodRate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-black text-slate-900">{periodRate}%</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Compliance Rate
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Compliant
                </span>
                <span className="font-bold text-slate-900">{periodCompliant}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Non-Compliant
                </span>
                <span className="font-bold text-slate-900">{periodNonCompliant}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Under Review
                </span>
                <span className="font-bold text-slate-900">{periodReview}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Not Applicable
                </span>
                <span className="font-bold text-slate-900">
                  {Math.max(0, periodTotal - periodCompliant - periodNonCompliant - periodReview)}
                </span>
              </div>
            </div>
          </div>

          {/* Product Categories Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Product Categories</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCatalogMenuOpen((v) => !v)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {catalogLabel} <ChevronDown className={`w-3 h-3 transition-transform ${catalogMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {catalogMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCatalogMenuOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-20">
                      {CATALOG_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setCatalogFilter(opt.value);
                            setCatalogMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-semibold cursor-pointer ${opt.value === catalogFilter
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {displayedCategoriesList.length > 0 ? (
                displayedCategoriesList.map((catItem: any, idx: number) => (
                  <div key={catItem.category || idx}>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>{catItem.category}</span>
                      <span>
                        {catItem.count} ({catItem.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${catItem.color || 'bg-blue-600'} h-full rounded-full`}
                        style={{ width: `${Math.max(8, catItem.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <span>No commodity categories in current inspections.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bharat Banner */}
      <div className="rounded-xl overflow-hidden shadow-xs leading-none">
        <img src={dashboardBharatBanner} alt="Accurate Declarations. Empowered Consumers. A Compliant India. — People, Products, Progress, Together" className="w-full h-auto block" />
      </div>
    </div>
  );
}