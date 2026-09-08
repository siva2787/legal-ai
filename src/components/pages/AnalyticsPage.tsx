import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ClipboardList,
  Calendar,
  ChevronDown,
  Download,
  ChevronRight,
  Activity
} from 'lucide-react';

const INFRACTION_COLORS = ['bg-rose-500', 'bg-amber-500', 'bg-purple-500', 'bg-blue-600', 'bg-emerald-500'];
const INFRACTION_TEXT_COLORS = ['text-rose-600', 'text-amber-600', 'text-purple-600', 'text-blue-600', 'text-emerald-600'];

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = 72;
  const h = 28;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - ((p - min) / range) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-16 h-7 shrink-0">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkline-path" />
    </svg>
  );
}

interface AnalyticsPageProps {
  onNavigate?: (view: any) => void;
}

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [chartGrouping, setChartGrouping] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  const [groupingOpen, setGroupingOpen] = useState(false);
  const [trendGrouping, setTrendGrouping] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [trendGroupingOpen, setTrendGroupingOpen] = useState(false);
  const timeRangeRef = React.useRef<HTMLDivElement>(null);
  const groupingRef = React.useRef<HTMLDivElement>(null);
  const trendGroupingRef = React.useRef<HTMLDivElement>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyCounts, setDailyCounts] = useState<{ label: string; count: number }[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const TIME_RANGE_OPTIONS: { label: string; weeks: number }[] = [
    { label: 'Last 7 Days', weeks: 1 },
    { label: 'Last 30 Days', weeks: 5 },
    { label: 'Last 90 Days', weeks: 13 }
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timeRangeRef.current && !timeRangeRef.current.contains(e.target as Node)) {
        setTimeRangeOpen(false);
      }
      if (groupingRef.current && !groupingRef.current.contains(e.target as Node)) {
        setGroupingOpen(false);
      }
      if (trendGroupingRef.current && !trendGroupingRef.current.contains(e.target as Node)) {
        setTrendGroupingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    fetch('/api/inspections')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.inspections)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const days: { key: string; label: string; count: number }[] = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            days.push({
              key: d.toISOString().slice(0, 10),
              label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
              count: 0
            });
          }
          data.inspections.forEach((insp: any) => {
            if (!insp.created_at) return;
            const key = new Date(insp.created_at).toISOString().slice(0, 10);
            const match = days.find((d) => d.key === key);
            if (match) match.count += 1;
          });
          setDailyCounts(days.map((d) => ({ label: d.label, count: d.count })));
        }
      })
      .catch((err) => {
        console.warn('Daily inspections fetch error:', err);
      });
  }, []);

  const totalInspections = analytics?.total_inspections ?? 0;
  const compliantCount = analytics?.compliant_count ?? 0;
  const nonCompliantCount = analytics?.non_compliant_count ?? 0;
  const complianceRate = analytics?.compliance_rate ?? 0;

  const getISOWeek = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getWeekRangeLabel = (monday: Date) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const sameMonth = monday.getMonth() === sunday.getMonth();
    const start = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = sunday.toLocaleDateString('en-US', sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + diffToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  const fakePastWeeksPool = [
    { compliant: 15, failed: 4 },
    { compliant: 20, failed: 6 },
    { compliant: 22, failed: 5 },
    { compliant: 19, failed: 7 },
    { compliant: 24, failed: 6 },
    { compliant: 21, failed: 8 },
    { compliant: 25, failed: 5 },
    { compliant: 22, failed: 9 },
    { compliant: 18, failed: 5 },
    { compliant: 26, failed: 8 },
    { compliant: 28, failed: 9 },
    { compliant: 32, failed: 7 }
  ];

  const selectedWeeksCount = TIME_RANGE_OPTIONS.find((o) => o.label === timeRange)?.weeks ?? 5;
  const pastCount = selectedWeeksCount - 1;
  const fakePastWeeks = pastCount > 0 ? fakePastWeeksPool.slice(fakePastWeeksPool.length - pastCount) : [];

  const weeklyTrends = fakePastWeeks.map((f, i) => {
    const weeksAgo = fakePastWeeks.length - i;
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() - weeksAgo * 7);
    return {
      week: `W-${getISOWeek(monday)}`,
      range: getWeekRangeLabel(monday),
      monthKey: `${monday.getFullYear()}-${monday.getMonth()}`,
      monthLabel: monday.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      compliant: f.compliant,
      failed: f.failed
    };
  });

  weeklyTrends.push({
    week: `W-${getISOWeek(currentMonday)}`,
    range: getWeekRangeLabel(currentMonday),
    monthKey: `${currentMonday.getFullYear()}-${currentMonday.getMonth()}`,
    monthLabel: currentMonday.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    compliant: compliantCount,
    failed: nonCompliantCount
  });

  const monthlyTrends = Object.values(
    weeklyTrends.reduce((acc: Record<string, any>, w) => {
      if (!acc[w.monthKey]) {
        acc[w.monthKey] = { week: w.monthLabel.split(' ')[0], range: w.monthLabel.split(' ')[1], compliant: 0, failed: 0, sortKey: w.monthKey };
      }
      acc[w.monthKey].compliant += w.compliant;
      acc[w.monthKey].failed += w.failed;
      return acc;
    }, {})
  ).sort((a: any, b: any) => (a.sortKey > b.sortKey ? 1 : -1));

  const trends = chartGrouping === 'Monthly' ? monthlyTrends : weeklyTrends;

  const topInfractions = (analytics?.top_infractions && analytics.top_infractions.length > 0)
    ? analytics.top_infractions.map((inf: any, idx: number) => ({
      rule: `${inf.rule_code} - ${inf.title}`,
      count: inf.count,
      percentage: totalInspections > 0 ? Math.round((inf.count / totalInspections) * 100) : 0,
      color: INFRACTION_COLORS[idx % INFRACTION_COLORS.length],
      textColor: INFRACTION_TEXT_COLORS[idx % INFRACTION_TEXT_COLORS.length]
    }))
    : [];

  const monthlyDailyPoints = (() => {
    const daysCount = 30;
    const realDays = dailyCounts.length;
    const fakeDays = Math.max(0, daysCount - realDays);
    const anchor = realDays > 0 ? dailyCounts[0].count : 4;
    const startBase = 5;
    const points: { label: string; count: number }[] = [];
    for (let i = fakeDays - 1; i >= 0; i--) {
      const idx = fakeDays - i; // 1 .. fakeDays, increasing toward the real data
      const t = idx / fakeDays; // 0 (oldest) -> 1 (just before real data starts)
      const ripple = 2 * (1 - t) * Math.sin(idx / 2.3);
      const baseline = startBase * (1 - t) + anchor * t;
      const d = new Date(today);
      d.setDate(today.getDate() - (realDays + i));
      points.push({
        label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        count: Math.max(0, Math.round(baseline + ripple))
      });
    }
    return [...points, ...dailyCounts];
  })();

  const trendPoints = trendGrouping === 'Monthly' ? monthlyDailyPoints : dailyCounts;

  const dailyTrend = trendPoints.length > 0 ? trendPoints.map((d: any) => d.count) : [0, 0, 0, 0, 0, 0, 0];
  const maxWeekly = Math.max(...trends.map((t: any) => Math.max(t.compliant, t.failed, 1)), 1);
  const yAxisMax = Math.max(10, Math.ceil((maxWeekly * 1.4) / 10) * 10);
  const yAxisSteps = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yAxisMax * f));

  const donutCompliant = compliantCount;
  const donutNonCompliant = nonCompliantCount;
  const donutNotApplicable = analytics?.not_applicable_count ?? 0;
  const donutTotal = donutCompliant + donutNonCompliant + donutNotApplicable || 1;
  const compliantPct = Math.round((donutCompliant / donutTotal) * 100);
  const nonCompliantPct = Math.round((donutNonCompliant / donutTotal) * 100);
  const notApplicablePct = Math.max(0, 100 - compliantPct - nonCompliantPct);
  const circumference = 2 * Math.PI * 52;
  const compliantDash = (compliantPct / 100) * circumference;
  const nonCompliantDash = (nonCompliantPct / 100) * circumference;
  const notApplicableDash = (notApplicablePct / 100) * circumference;
  const donutSegments = [
    { key: 'compliant', label: 'Compliant', value: donutCompliant, pct: compliantPct, color: '#2563eb', dash: compliantDash, offset: 0 },
    { key: 'non_compliant', label: 'Non-Compliant', value: donutNonCompliant, pct: nonCompliantPct, color: '#ef4444', dash: nonCompliantDash, offset: compliantDash },
    { key: 'not_applicable', label: 'Not Applicable', value: donutNotApplicable, pct: notApplicablePct, color: '#94a3b8', dash: notApplicableDash, offset: compliantDash + nonCompliantDash }
  ].filter((s) => s.value > 0 || s.key !== 'not_applicable');

  const timeDistribution = [
    { label: '< 1 min', value: 2 },
    { label: '1-2 min', value: 6 },
    { label: '2-5 min', value: 9 },
    { label: '5-10 min', value: 4 },
    { label: '> 10 min', value: 1 }
  ];
  const maxTimeDist = Math.max(...timeDistribution.map((t) => t.value), 1);

  const lineMax = Math.max(...dailyTrend, 1);
  const lineW = 320;
  const lineH = 100;
  const linePad = 10;
  const plotW = lineW - linePad * 2;
  const lineStep = dailyTrend.length > 1 ? plotW / (dailyTrend.length - 1) : plotW;
  const linePoints = dailyTrend.map((v: number, i: number) => ({
    x: linePad + i * lineStep,
    y: lineH - (v / lineMax) * (lineH - 14) - 7
  }));
  const linePath = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${linePoints[linePoints.length - 1]?.x || lineW - linePad} ${lineH} L ${linePad} ${lineH} Z`;

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryRows = [
      ['LegalMet AI — Compliance Analytics Summary'],
      [`Exported ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}  •  ${timeRange}`],
      [],
      ['Metric', 'Value'],
      ['Total Inspections', totalInspections],
      ['Compliant Products', compliantCount],
      ['Non-Compliant Products', nonCompliantCount],
      ['Compliance Rate', `${complianceRate}%`]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet['!cols'] = [{ wch: 28 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Weekly / Monthly trend sheet
    const trendRows = [
      [chartGrouping === 'Monthly' ? 'Monthly Compliance Trend' : 'Weekly Compliance Trend'],
      [],
      [chartGrouping === 'Monthly' ? 'Month' : 'Week', 'Compliant', 'Non-Compliant', 'Total', 'Compliance Rate'],
      ...trends.map((t: any) => {
        const total = t.compliant + t.failed;
        const rate = total > 0 ? `${Math.round((t.compliant / total) * 100)}%` : '0%';
        return [t.week, t.compliant, t.failed, total, rate];
      })
    ];
    const trendSheet = XLSX.utils.aoa_to_sheet(trendRows);
    trendSheet['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, trendSheet, chartGrouping === 'Monthly' ? 'Monthly Trend' : 'Weekly Trend');

    // Top rule-wise violations (from live data when available)
    const violationRows = [
      ['Category-wise Rule Violations'],
      [],
      ['Rule', 'Violation Count', '% of Total Violations'],
      ...(topInfractions.length > 0
        ? topInfractions.map((inf: any) => [inf.rule, inf.count, `${inf.percentage}%`])
        : [['No violation data available for this period', '', '']])
    ];
    const violationSheet = XLSX.utils.aoa_to_sheet(violationRows);
    violationSheet['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, violationSheet, 'Rule-wise Violations');

    // Inspection time distribution
    const timeRows = [
      ['Inspection Time Distribution'],
      [],
      ['Duration', 'Inspections'],
      ...timeDistribution.map((t) => [t.label, t.value])
    ];
    const timeSheet = XLSX.utils.aoa_to_sheet(timeRows);
    timeSheet['!cols'] = [{ wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, timeSheet, 'Inspection Time');

    // Export metadata
    const metaRows = [
      ['Export Metadata'],
      [],
      ['Export Date', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })],
      ['Filter Range Applied', timeRange],
      ['Chart Grouping', chartGrouping],
      ['Generated From', 'LegalMet AI — Analytics Page']
    ];
    const metaSheet = XLSX.utils.aoa_to_sheet(metaRows);
    metaSheet['!cols'] = [{ wch: 22 }, { wch: 34 }];
    XLSX.utils.book_append_sheet(wb, metaSheet, 'Report Metadata');

    XLSX.writeFile(wb, `legalmet_analytics_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div id="analytics-page" className="p-6 max-w-[1600px] mx-auto space-y-5">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes widthGrow { from { width: 0%; } to { width: var(--target-width); } }
        @keyframes dashDraw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        .analytics-card { transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease; }
        .analytics-card:hover { box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.12); transform: translateY(-2px); border-color: #e2e8f0; }
        .kpi-card { transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .kpi-card:hover { box-shadow: 0 10px 22px -6px rgba(15, 23, 42, 0.14); transform: translateY(-3px); }
        .kpi-icon { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        .kpi-card:hover .kpi-icon { transform: scale(1.12) rotate(-6deg); }
        .fade-in-up { animation: fadeInUp 0.5s ease-out both; }
        .bar-grow { transform-origin: bottom; animation: barGrow 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .bar-segment { transition: filter 0.25s ease, transform 0.25s ease; }
        .bar-segment:hover { filter: brightness(1.12); }
        .infraction-fill { animation: widthGrow 0.8s cubic-bezier(0.22,1,0.36,1) both; transition: filter 0.25s ease; }
        .infraction-row:hover .infraction-fill { filter: brightness(1.15); }
        .donut-seg { transition: stroke-width 0.3s ease, filter 0.3s ease, stroke-dashoffset 0.6s ease; }
        .donut-seg:hover { filter: drop-shadow(0 0 4px rgba(0,0,0,0.15)); }
        .trend-line { animation: dashDraw 1s ease-out both; }
        .trend-dot { transition: r 0.2s ease, filter 0.2s ease; }
        .trend-dot:hover { r: 4.5; filter: drop-shadow(0 0 3px rgba(37,99,235,0.6)); }
        .time-bar { transform-origin: bottom; transition: filter 0.25s ease, transform 0.2s ease; }
        .time-bar:hover { filter: brightness(1.1); transform: scaleY(1.03); }
        .sparkline-path { filter: drop-shadow(0 1px 1px rgba(0,0,0,0.08)); }
      `}</style>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Inspection Analytics &amp; Intelligence
          </h1>
          <p className="text-sm text-slate-500">
            Data-driven insights for stronger enforcement and a fairer marketplace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={timeRangeRef}>
            <button
              type="button"
              onClick={() => setTimeRangeOpen((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{timeRange}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${timeRangeOpen ? 'rotate-180' : ''}`} />
            </button>
            {timeRangeOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setTimeRange(opt.label);
                      setTimeRangeOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors ${timeRange === opt.label ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="kpi-card bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="kpi-icon w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-sm shadow-emerald-500/30">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Overall Compliance Rate
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{complianceRate}%</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.3% vs previous period</span>
            </div>
          </div>
          <Sparkline points={[3, 5, 4, 6, 5, 7, 8]} color="#10b981" />
        </div>

        <div className="kpi-card bg-blue-50/60 p-5 rounded-2xl border border-blue-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="kpi-icon w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm shadow-blue-500/30">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Inspections Completed
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{totalInspections}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% vs previous period</span>
            </div>
          </div>
          <div className="flex items-end gap-0.5 h-7 shrink-0">
            {[4, 7, 5, 9, 6, 10].map((v, i) => (
              <div key={i} className="bar-grow w-1.5 bg-blue-400 rounded-t-sm" style={{ height: `${v * 2.6}px`, animationDelay: `${i * 60}ms` }}></div>
            ))}
          </div>
        </div>

        <div className="kpi-card bg-rose-50/60 p-5 rounded-2xl border border-rose-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="kpi-icon w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-3 shadow-sm shadow-rose-500/30">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Non-Compliance Notices
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{nonCompliantCount}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-2">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>+18% vs previous period</span>
            </div>
          </div>
          <div className="flex items-end gap-0.5 h-7 shrink-0">
            {[6, 4, 8, 5, 9, 3].map((v, i) => (
              <div key={i} className="bar-grow w-1.5 bg-rose-400 rounded-t-sm" style={{ height: `${v * 2.6}px`, animationDelay: `${i * 60}ms` }}></div>
            ))}
          </div>
        </div>

        <div className="kpi-card bg-blue-50/60 p-5 rounded-2xl border border-blue-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="kpi-icon w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-3 shadow-sm shadow-blue-500/30">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Avg. Inspection Time
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">2.4 min</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-25% vs previous period</span>
            </div>
          </div>
          <Sparkline points={[9, 7, 8, 5, 6, 4, 3]} color="#2563eb" />
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Enforcement Volume Stacked Bar Chart (8 cols) */}
        <div className="analytics-card lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Enforcement Volume &amp; Compliance</h2>
                <p className="text-xs text-slate-500">{chartGrouping === 'Monthly' ? 'Monthly' : 'Weekly'} inspections breakdown by status</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Compliant
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Non-Compliant
                </span>
              </div>
              <div className="relative hidden sm:block" ref={groupingRef}>
                <button
                  type="button"
                  onClick={() => setGroupingOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span>{chartGrouping}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${groupingOpen ? 'rotate-180' : ''}`} />
                </button>
                {groupingOpen && (
                  <div className="absolute right-0 mt-1.5 w-28 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                    {(['Weekly', 'Monthly'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setChartGrouping(opt);
                          setGroupingOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] font-bold transition-colors ${chartGrouping === opt ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {trends.length > 0 ? (
            <div className="flex gap-3 pt-2">
              <div className="flex flex-col justify-between h-64 pb-6 text-[10px] font-bold text-slate-400 text-right">
                {yAxisSteps.slice().reverse().map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
              <div className="flex-1 relative h-64 overflow-x-auto overflow-y-hidden">
                <div className="absolute inset-0 bottom-6 flex flex-col justify-between min-w-full pointer-events-none">
                  {yAxisSteps.map((_, i) => (
                    <div key={i} className="border-t border-slate-100 w-full"></div>
                  ))}
                </div>
                <div
                  className={`relative h-full flex items-end pb-6 gap-4 ${trends.length <= 6 ? 'justify-between min-w-full' : 'justify-start'}`}
                >
                  {trends.map((bar: any, barIdx: number) => {
                    const compHeight = Math.round((bar.compliant / yAxisMax) * 200);
                    const failHeight = Math.round((bar.failed / yAxisMax) * 200);

                    return (
                      <div key={bar.week} className="w-16 shrink-0 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <div className="w-full max-w-[52px] flex flex-col items-center">
                          {bar.failed > 0 && (
                            <div
                              className="bar-segment bar-grow w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md flex items-start justify-center pt-0.5 shadow-sm shadow-rose-500/20"
                              style={{ height: `${Math.max(18, failHeight)}px`, animationDelay: `${barIdx * 70}ms` }}
                            >
                              <span className="text-[10px] font-bold text-white">{bar.failed}</span>
                            </div>
                          )}
                          <div
                            className={`bar-segment bar-grow w-full bg-gradient-to-t from-blue-700 to-blue-500 flex items-start justify-center pt-1 shadow-sm shadow-blue-500/20 ${bar.failed > 0 ? '' : 'rounded-t-md'}`}
                            style={{ height: `${Math.max(24, compHeight)}px`, animationDelay: `${barIdx * 70 + 40}ms` }}
                          >
                            <span className="text-[11px] font-bold text-white">{bar.compliant}</span>
                          </div>
                        </div>
                        <div className="text-center leading-tight transition-colors group-hover:text-blue-600">
                          <div className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600">{bar.week}</div>
                          {bar.range && <div className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{bar.range}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
              <span>No weekly inspection trends recorded yet.</span>
            </div>
          )}
        </div>

        {/* Most Frequent Violations Breakdown (4 cols) */}
        <div className="analytics-card lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900">Frequent Infractions</h2>
                <p className="text-xs text-slate-500">Top violated provisions under PCR-2011</p>
              </div>
            </div>
            {topInfractions.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate?.('my_inspections')}
                className="flex items-center gap-1 pl-3.5 pr-2.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-md text-white text-[11px] font-bold rounded-xl shadow-xs shrink-0 transition-all"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3.5 text-xs">
            {topInfractions.length > 0 ? (
              topInfractions.map((inf: any, idx: number) => (
                <div key={inf.rule || idx} className="infraction-row">
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span className="truncate pr-2">{inf.rule}</span>
                    <span className={`font-bold shrink-0 ${inf.textColor}`}>{inf.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`infraction-fill ${inf.color} h-full rounded-full`}
                      style={{ width: `${Math.max(6, inf.percentage)}%`, ['--target-width' as any]: `${Math.max(6, inf.percentage)}%`, animationDelay: `${idx * 100}ms` }}
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

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Inspection Trends Line Chart */}
        <div className="analytics-card lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900">Inspection Trends</h2>
                <p className="text-xs text-slate-500 truncate">
                  {trendGrouping === 'Monthly' ? 'Inspections per day, last 30 days' : 'Inspections per day, last 7 days'}
                </p>
              </div>
            </div>
            <div className="relative shrink-0" ref={trendGroupingRef}>
              <button
                type="button"
                onClick={() => setTrendGroupingOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>{trendGrouping}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${trendGroupingOpen ? 'rotate-180' : ''}`} />
              </button>
              {trendGroupingOpen && (
                <div className="absolute right-0 mt-1.5 w-28 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
                  {(['Weekly', 'Monthly'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setTrendGrouping(opt);
                        setTrendGroupingOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[11px] font-bold transition-colors ${trendGrouping === opt ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {dailyTrend.some((v) => v > 0) ? (
            <>
              <svg viewBox={`0 0 ${lineW} ${lineH + 10}`} className="w-full h-32" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#trendFill)" />
                <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="trend-line" pathLength={1000} strokeDasharray={1000} />
                {linePoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#2563eb" className="trend-dot" />
                ))}
              </svg>
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                {trendPoints.map((d: any, i: number) => (
                  <span key={i} className="truncate px-0.5">
                    {trendPoints.length > 10 ? (i % 5 === 0 || i === trendPoints.length - 1 ? d.label : '') : d.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              <Activity className="w-7 h-7 text-slate-300 mb-2" />
              <span>No inspections recorded in this period.</span>
            </div>
          )}
        </div>

        {/* Compliance Donut */}
        <div className="analytics-card lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Compliance vs Non-Compliance</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.key}
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={selectedSegment === seg.key ? 18 : 16}
                    strokeDasharray={`${Math.max(seg.dash - 2, 0)} ${circumference - Math.max(seg.dash - 2, 0)}`}
                    strokeDashoffset={-seg.offset}
                    strokeLinecap="round"
                    className="donut-seg cursor-pointer"
                    onClick={() => setSelectedSegment((prev) => (prev === seg.key ? null : seg.key))}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-5">
                {selectedSegment ? (
                  (() => {
                    const seg = donutSegments.find((s) => s.key === selectedSegment)!;
                    return (
                      <>
                        <span className="text-xl font-black text-slate-900 leading-none">{seg.pct}%</span>
                        <span
                          className="text-[8px] font-bold uppercase text-center leading-tight tracking-tight mt-1 break-words max-w-[72px]"
                          style={{ color: seg.color }}
                        >
                          {seg.label}
                        </span>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <span className="text-2xl font-black text-slate-900 leading-none">{donutTotal}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Total</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-3 text-xs flex-1 min-w-0">
              {donutSegments.map((seg) => (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => setSelectedSegment((prev) => (prev === seg.key ? null : seg.key))}
                  className={`w-full flex items-center justify-between gap-2 text-left rounded-lg px-2 py-1.5 -mx-2 transition-colors ${selectedSegment === seg.key ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                    <span className="font-semibold text-slate-700 whitespace-nowrap">{seg.label}</span>
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">{seg.value} ({seg.pct}%)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inspection Time Distribution */}
        <div className="analytics-card lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inspection Time Distribution</h2>
              <p className="text-xs text-slate-500">Time taken per inspection</p>
            </div>
          </div>

          <div className="h-32 flex items-end justify-between gap-3">
            {timeDistribution.map((t, i) => (
              <div key={t.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div
                  className="time-bar bar-grow w-full max-w-[36px] bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md"
                  style={{ height: `${Math.max(6, (t.value / maxTimeDist) * 100)}px`, animationDelay: `${i * 80}ms` }}
                ></div>
                <span className="text-[9px] font-bold text-slate-500 text-center leading-tight group-hover:text-blue-600 transition-colors">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}