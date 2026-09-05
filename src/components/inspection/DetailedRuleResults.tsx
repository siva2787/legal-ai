import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  BookOpen,
  Scale,
  Edit3,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { RuleResult, ComplianceSummary, ProductContext } from '../../types';

interface DetailedRuleResultsProps {
  ruleResults: RuleResult[];
  summary: ComplianceSummary;
  productContext: ProductContext;
  onBackToResults: () => void;
  onProceedToReport: () => void;
}

export function DetailedRuleResults({
  ruleResults,
  summary,
  productContext,
  onBackToResults,
  onProceedToReport
}: DetailedRuleResultsProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({
    [ruleResults[0]?.rule_id || '']: true
  });

  const toggleExpand = (ruleId: string) => {
    setExpandedRules((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const filteredResults = ruleResults.filter((r) => {
    const isReview =
      r.status === 'REQUIRES_MANUAL_VERIFICATION' || (r.status as string) === 'NEEDS_REVIEW';
    const matchesStatus =
      filterStatus === 'ALL' ||
      r.status === filterStatus ||
      (filterStatus === 'NEEDS_REVIEW' && isReview);

    const citation =
      r.legal_citation || `${r.source_document || 'PCR-2011'} (${r.source_page || 'Schedule'})`;
    const finding = r.findings || r.explanation;

    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div id="detailed-rule-results-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToResults}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Compliance Overview</span>
          </button>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Detailed Rule Results
          </h1>
          <p className="text-sm text-slate-500">
            Rule-by-rule evaluation with statutory citations and evidence traceability for {productContext.product_name}.
          </p>
        </div>

        <button
          id="detailed-rules-report-btn"
          onClick={onProceedToReport}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all text-sm"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Inspection Report</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: `All (${ruleResults.length})` },
            { id: 'PASS', label: `Passed (${summary.rules_passed})` },
            { id: 'FAIL', label: `Failed (${summary.rules_failed})` },
            { id: 'NEEDS_REVIEW', label: `Needs Review (${summary.needs_review})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules or citations..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Expandable Rules List */}
      <div className="space-y-3">
        {filteredResults.map((result) => {
          const isExpanded = !!expandedRules[result.rule_id];
          const isPass = result.status === 'PASS';
          const isFail = result.status === 'FAIL';
          const isReview =
            result.status === 'REQUIRES_MANUAL_VERIFICATION' || (result.status as string) === 'NEEDS_REVIEW';

          const citation =
            result.legal_citation ||
            `${result.source_document || 'PCR-2011'} (${result.source_page || 'Schedule'})`;
          const finding = result.findings || result.explanation;
          const evidence =
            result.evidence_used || result.evidence_source_text || result.detected_value;

          return (
            <div
              key={result.check_id || result.rule_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Header Bar */}
              <div
                onClick={() => toggleExpand(result.rule_id)}
                className="p-4 cursor-pointer hover:bg-slate-50/70 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isPass
                        ? 'bg-emerald-100 text-emerald-700'
                        : isFail
                        ? 'bg-rose-100 text-rose-700'
                        : isReview
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPass && <CheckCircle2 className="w-4 h-4" />}
                    {isFail && <AlertCircle className="w-4 h-4" />}
                    {isReview && <AlertTriangle className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {result.rule_code || result.rule_id}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {citation}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{result.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isPass
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isFail
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isReview
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {result.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/40 space-y-4 text-xs">
                  {/* Evaluated findings */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                      Deterministic Finding
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs">{finding}</p>
                  </div>

                  {/* Requirements & Detected Value */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                        Statutory Requirement
                      </div>
                      <div className="text-slate-800 text-xs font-medium">
                        {result.requirement || result.expected_condition}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                        Package Detected Value
                      </div>
                      <div className="text-slate-800 font-mono text-xs font-bold">
                        {result.detected_value || 'None detected'}
                      </div>
                    </div>
                  </div>

                  {/* Evidence & Confidence */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                        Package Evidence Reference
                      </div>
                      <div className="font-mono text-slate-800 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                        {evidence || 'General package surface review'}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                          Extraction Confidence
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-900">
                            {(result.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-2">
                        Evaluated deterministically via LegalMet statutory rule engine
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
