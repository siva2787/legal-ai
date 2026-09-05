import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  ChevronDown,
  Download,
  Filter
} from 'lucide-react';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setAnalytics(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Analytics fetch error:', err);
        setIsLoading(false);
      });
  }, []);

  const totalInspections = analytics?.total_inspections ?? 0;
  const compliantCount = analytics?.compliant_count ?? 0;
  const nonCompliantCount = analytics?.non_compliant_count ?? 0;
  const complianceRate = analytics?.compliance_rate ?? 0;
  
  const colors = ['bg-rose-500', 'bg-amber-500', 'bg-purple-500', 'bg-blue-600', 'bg-emerald-500'];
  
  const trends = (analytics?.weekly_trends && analytics.weekly_trends.length > 0)
    ? analytics.weekly_trends.map((t: any, idx: number) => ({
        week: t.week ? `W-${t.week.split('-')[1] || idx + 1}` : `Week ${idx + 1}`,
        compliant: t.compliant || 0,
        failed: t.non_compliant || 0
      }))
    : [];

  const topInfractions = (analytics?.top_infractions && analytics.top_infractions.length > 0)
    ? analytics.top_infractions.map((inf: any, idx: number) => ({
        rule: `${inf.rule_code} - ${inf.title}`,
        count: inf.count,
        percentage: totalInspections > 0 ? Math.round((inf.count / totalInspections) * 100) : 0,
        color: colors[idx % colors.length]
      }))
    : [];

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Inspections,${totalInspections}\n` +
      `Compliant Products,${compliantCount}\n` +
      `Non-Compliant Products,${nonCompliantCount}\n` +
      `Compliance Rate,${complianceRate}%\n\n` +
      'Week,Compliant,Non-Compliant\n' +
      trends.map((t: any) => `${t.week},${t.compliant},${t.failed}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `legalmet_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="analytics-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Inspection Analytics & Intelligence
          </h1>
          <p className="text-sm text-slate-500">
            Enforcement trends, commodity compliance ratios, and zonal performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Overall Compliance Rate
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{complianceRate}%</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 4.3% vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Inspections Completed
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{totalInspections}</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Real-time database records</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Non-Compliance Notices
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{nonCompliantCount}</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-2">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Actionable violations</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg. Inspection Time
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">2.4 min</div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">
            Down from 25 min manual
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Inspection Trend Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Enforcement Volume & Compliance</h2>
              <p className="text-xs text-slate-500">Weekly inspections breakdown by status</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Compliant
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Non-Compliant
              </span>
            </div>
          </div>

          {/* Clean Dynamic Bar Chart */}
          {trends.length > 0 ? (
            <div className="pt-6 pb-2 h-64 flex items-end justify-between gap-4 border-b border-slate-100">
              {trends.map((bar: any) => {
                const maxVal = Math.max(
                  ...trends.map((t: any) => Math.max(t.compliant, t.failed, 1))
                );
                const compHeight = Math.round((bar.compliant / maxVal) * 160);
                const failHeight = Math.round((bar.failed / maxVal) * 160);

                return (
                  <div key={bar.week} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full max-w-[48px] flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-rose-500 rounded-t-sm group-hover:opacity-90 transition-all"
                        style={{ height: `${Math.max(4, failHeight)}px` }}
                        title={`Non-compliant: ${bar.failed}`}
                      ></div>
                      <div
                        className="w-full bg-blue-600 rounded-t-sm group-hover:opacity-90 transition-all"
                        style={{ height: `${Math.max(8, compHeight)}px` }}
                        title={`Compliant: ${bar.compliant}`}
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{bar.week}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
              <span>No weekly inspection trends recorded yet.</span>
            </div>
          )}
        </div>

        {/* Most Frequent Violations Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Frequent Infractions</h2>
            <p className="text-xs text-slate-500">Top violated provisions under PCR-2011</p>
          </div>

          <div className="space-y-3.5 text-xs">
            {topInfractions.length > 0 ? (
              topInfractions.map((inf: any, idx: number) => (
                <div key={inf.rule || idx}>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span className="truncate pr-2">{inf.rule}</span>
                    <span className="font-bold text-rose-600">{inf.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${inf.color || 'bg-rose-500'} h-full rounded-full`}
                      style={{ width: `${Math.max(6, inf.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <span>Zero infractions recorded in active inspections.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
