import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Clock, ShieldCheck, Cpu, AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

interface AIAnalysisProcessingProps {
  status: 'loading' | 'success' | 'error';
  errorMessage?: string | null;
  onComplete: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

export function AIAnalysisProcessing({ status, errorMessage, onComplete, onRetry, onCancel }: AIAnalysisProcessingProps) {
  // Progress creeps toward 90% while we wait on the real API call, then only
  // completes to 100% once the backend actually confirms success.
  const [progress, setProgress] = useState(10);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { label: 'Image Preprocessing', desc: 'Contrast normalization & panel isolation' },
    { label: 'Optical Character Recognition', desc: 'Deep multilingual OCR extraction' },
    { label: 'Layout & Geometry Detection', desc: 'Principal display panel bounds calculation' },
    { label: 'Semantic Declaration Extraction', desc: 'MRP, Net Quantity, Batch, Mfg Date parsing' },
    { label: 'Deterministic Rule Verification', desc: 'Legal Metrology PCR-2011 standard checks' }
  ];

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 7, 90);
        if (next > 25 && next <= 50) setCurrentStepIndex(1);
        else if (next > 50 && next <= 70) setCurrentStepIndex(2);
        else if (next > 70) setCurrentStepIndex(3);
        return next;
      });
    }, 450);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === 'success') {
      setCurrentStepIndex(4);
      setProgress(100);
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
  }, [status, onComplete]);

  if (status === 'error') {
    return (
      <div id="ai-analysis-processing-page" className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-md text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Analysis Failed</h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              {errorMessage || 'The package image could not be analyzed. Please check your connection and try again.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Upload
            </button>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4" /> Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="ai-analysis-processing-page" className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="hidden sm:inline">Upload</span>
          </div>
          <div className="h-0.5 w-10 sm:w-16 bg-emerald-500"></div>

          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              2
            </span>
            <span>AI Analysis</span>
          </div>
          <div className="h-0.5 w-10 sm:w-16 bg-slate-200"></div>

          <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm">
            <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              3
            </span>
            <span className="hidden sm:inline">Review Info</span>
          </div>
          <div className="h-0.5 w-10 sm:w-16 bg-slate-200"></div>

          <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm">
            <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              4
            </span>
            <span className="hidden sm:inline">Results</span>
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

      {/* Main Analysis Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>Multimodal Vision & Rule Pipeline</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AI Analysis in Progress
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Analyzing package images, isolating principal display panel, extracting declarations, and preparing deterministic rule verifications...
          </p>
        </div>

        {/* Circular Progress Display */}
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#2563EB"
              strokeWidth="10"
              strokeDasharray="314.15"
              strokeDashoffset={314.15 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-900">{progress}%</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              {progress === 100 ? 'Verified' : 'Processing'}
            </span>
          </div>
        </div>

        {/* Step Breakdown */}
        <div className="max-w-md mx-auto space-y-3 text-left">
          {steps.map((step, idx) => {
            const isDone = currentStepIndex > idx || progress === 100;
            const isCurrent = currentStepIndex === idx && progress < 100;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : isCurrent
                    ? 'bg-blue-50/80 border-blue-300 text-blue-950 shadow-xs ring-2 ring-blue-500/10'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                    }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{step.label}</div>
                  <div className="text-[11px] text-slate-500 truncate">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 font-medium pt-2">
          Estimated time remaining: {Math.max(1, Math.ceil((100 - progress) / 35))} second(s)
        </div>
      </div>
    </div>
  );
}