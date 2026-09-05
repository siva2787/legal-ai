import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  ListChecks,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Scale,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { ComplianceSummary, RuleResult, ProductContext } from '../../types';

interface ComplianceResultsProps {
  summary: ComplianceSummary;
  ruleResults: RuleResult[];
  productContext: ProductContext;
  onViewDetailedRules: () => void;
  onGenerateReport: () => void;
  onBackToReview: () => void;
}

export function ComplianceResults({
  summary,
  ruleResults,
  productContext,
  onViewDetailedRules,
  onGenerateReport,
  onBackToReview
}: ComplianceResultsProps) {
  const isCompliant = summary.overall_status === 'COMPLIANT';
  const isNonCompliant = summary.overall_status === 'NON-COMPLIANT';

  return (
    <div id="compliance-results-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Workflow Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="hidden sm:inline">Upload</span>
          </div>
          <div className="h-0.5 w-10 sm:w-16 bg-emerald-500"></div>

          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="hidden sm:inline">AI Analysis</span>
          </div>
          <div className="h-0.5 w-10 sm:w-16 bg-emerald-500"></div>

          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="hidden sm:inline">Review Info</span>
          </div>
          <div className="h-0.5 w-10 sm:w-16 bg-emerald-500"></div>

          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              4
            </span>
            <span>Results</span>
          </div>
          <div className="h-0.5 w-10 sm:w-16 bg-slate-200"></div>

          <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm">
            <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              5
            </span>
            <span className="hidden sm:inline">Report</span>
          </div>
        </div>
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Compliance Results
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isCompliant
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isNonCompliant
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {summary.overall_status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {productContext.product_name} ({productContext.brand}) • Evaluated against Legal Metrology Rules, 2011
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="view-detailed-rules-btn"
            onClick={onViewDetailedRules}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 transition-all text-sm"
          >
            <ListChecks className="w-4 h-4 text-blue-600" />
            <span>Detailed Rule Results</span>
          </button>

          <button
            id="results-generate-report-btn"
            onClick={onGenerateReport}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Official Report</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overall Status Banner Card */}
      <div
        className={`rounded-2xl border p-6 shadow-xs ${
          isCompliant
            ? 'bg-emerald-50/50 border-emerald-200'
            : isNonCompliant
            ? 'bg-rose-50/50 border-rose-200'
            : 'bg-amber-50/50 border-amber-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isCompliant
                  ? 'bg-emerald-500 text-white'
                  : isNonCompliant
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {isCompliant ? (
                <ShieldCheck className="w-8 h-8" />
              ) : isNonCompliant ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                {isCompliant
                  ? 'Statutory Compliance Verified'
                  : isNonCompliant
                  ? 'Statutory Non-Compliance Detected'
                  : 'Action Required: Inspector Verification Needed'}
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {isCompliant
                  ? 'All mandatory declarations under Rule 6 and packaging schedules have been verified deterministically. Package is eligible for retail distribution.'
                  : 'One or more mandatory provisions or permissible error tolerances under PCR-2011 are violated. Notice of violation recommended.'}
              </p>
            </div>
          </div>

          {/* 4 Outcome Metric Pills */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-lg font-black text-emerald-600">{summary.rules_passed}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Passed</div>
            </div>

            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-lg font-black text-rose-600">{summary.rules_failed}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Failed</div>
            </div>

            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-lg font-black text-amber-600">{summary.needs_review}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Review</div>
            </div>

            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
              <div className="text-lg font-black text-slate-700">{summary.compliance_percentage}%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Evaluation List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Rule-by-Rule Verification Log</h3>
            <p className="text-xs text-slate-500">
              Evaluated deterministically with legal citations and extracted evidence references
            </p>
          </div>
          <button
            onClick={onViewDetailedRules}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Expand All Logic</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {ruleResults.map((result) => {
            const isPass = result.status === 'PASS';
            const isFail = result.status === 'FAIL';
            const isReview =
              result.status === 'REQUIRES_MANUAL_VERIFICATION' || result.status === 'NEEDS_REVIEW';

            const citation =
              result.legal_citation ||
              `${result.source_document || 'PCR-2011'} (${result.source_page || 'Schedule'})`;
            const textFinding = result.findings || result.explanation;
            const evidence = result.evidence_used || result.evidence_source_text || result.detected_value;

            return (
              <div
                key={result.check_id || result.rule_id}
                className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {result.rule_code || result.rule_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{citation}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{result.title}</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{textFinding}</div>
                  {evidence && (
                    <div className="text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-500">Evidence:</span> "{evidence}"
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      isPass
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isFail
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isReview
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isPass && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isFail && <AlertCircle className="w-3.5 h-3.5" />}
                    {isReview && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{result.status}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
