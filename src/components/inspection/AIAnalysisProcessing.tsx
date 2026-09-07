import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, CheckCircle2, Clock, ShieldCheck, Cpu, AlertTriangle, RotateCcw, ArrowLeft, FileSearch, FileText, Scale, FilePlus2 } from 'lucide-react';

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
  const [displayIdx, setDisplayIdx] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(10);
  const reachedNinetyAt = useRef<number | null>(null);

  const steps = [
    {
      label: 'Image Preprocessing',
      desc: 'Contrast normalization & panel isolation',
      tag: 'RUNNING OCR VISION',
      icon: FileSearch,
      iconClass: 'bg-slate-800 text-white',
    },
    {
      label: 'Optical Character Recognition',
      desc: 'Deep multilingual OCR extraction',
      tag: 'EXTRACTING PACKAGING',
      icon: FileText,
      iconClass: 'bg-amber-500 text-white',
    },
    {
      label: 'Layout & Geometry Detection',
      desc: 'Principal display panel bounds calculation',
      tag: 'METROLOGY RULES',
      icon: Scale,
      iconClass: 'bg-amber-400 text-white',
    },
    {
      label: 'Semantic Declaration Extraction',
      desc: 'MRP, Net Quantity, Batch, Mfg Date parsing',
      tag: 'RUNNING MODELS',
      icon: FilePlus2,
      iconClass: 'bg-blue-600 text-white',
    },
    {
      label: 'Deterministic Rule Verification',
      desc: 'Legal Metrology PCR-2011 standard checks',
      tag: 'FINALIZING',
      icon: ShieldCheck,
      iconClass: 'bg-emerald-500 text-white',
    },
  ];

  // Drive progress + step index while waiting on the real API call.
  // Each of the 5 steps gets an equal ~18%-wide band of the 10-90 range.
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 7, 90);
        if (next > 26 && next <= 42) setCurrentStepIndex(1);
        else if (next > 42 && next <= 58) setCurrentStepIndex(2);
        else if (next > 58 && next <= 74) setCurrentStepIndex(3);
        else if (next > 74) setCurrentStepIndex(4);
        return next;
      });
    }, 450);
    return () => clearInterval(timer);
  }, [status]);

  // Once we hit 90%, we're waiting on the backend, which can take up to ~10s.
  // Count down a real timer instead of deriving a (wrong) ETA from progress%.
  useEffect(() => {
    if (status !== 'loading' || progress < 90) return;
    if (reachedNinetyAt.current === null) {
      reachedNinetyAt.current = Date.now();
      setWaitSeconds(10);
    }
    const countdown = setInterval(() => {
      setWaitSeconds((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(countdown);
  }, [status, progress]);

  useEffect(() => {
    if (status === 'success') {
      setCurrentStepIndex(4);
      setProgress(100);
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
  }, [status, onComplete]);

  // Slide the old step out, then swap content and slide the new one in.
  useEffect(() => {
    if (currentStepIndex === displayIdx) return;
    setIsExiting(true);
    const t = setTimeout(() => {
      setDisplayIdx(currentStepIndex);
      setIsExiting(false);
    }, 280);
    return () => clearTimeout(t);
  }, [currentStepIndex, displayIdx]);

  const activeIdx = Math.min(displayIdx, steps.length - 1);
  const active = steps[activeIdx];
  const ActiveIcon = active.icon;

  const etaLabel =
    progress >= 90 && status === 'loading'
      ? `Estimated time remaining: up to ${waitSeconds} second(s)`
      : `Estimated time remaining: ${Math.max(2, Math.ceil((90 - progress) / 7) * 2)} second(s)`;

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
        </div>

        {/* Single-Step Animated Display: 2-line step description above the icon, both slide together */}
        <div className="relative flex flex-col items-center justify-center py-8 overflow-hidden">
          <div
            className="absolute w-64 h-64 rounded-full animate-glow-pulse pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(251,191,36,0.16) 0%, rgba(251,191,36,0.05) 45%, transparent 70%)',
            }}
          />
          <div
            key={activeIdx}
            className={`relative flex flex-col items-center ${isExiting ? 'animate-slide-out-step' : 'animate-slide-in-step'}`}
          >
            <div className="max-w-md space-y-1 mb-6">
              <p className="text-base font-bold text-slate-900">{active.label}</p>
              <p className="text-sm text-slate-500">{active.desc}</p>
            </div>

            <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${active.iconClass}`}>
              <ActiveIcon className="w-7 h-7" />
            </div>

            <div className="relative mt-6 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
              {active.tag}
            </div>

            <div className="relative mt-4 w-56 h-[3px] rounded-full bg-slate-200 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer-slide" />
            </div>
          </div>
        </div>

        {/* Compact step dots - shows overall sequence position */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {steps.map((step, idx) => (
            <span
              key={step.label}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIdx
                ? 'w-6 bg-blue-600 animate-dot-grow'
                : idx < currentStepIndex
                  ? 'w-1.5 bg-emerald-400'
                  : 'w-1.5 bg-slate-200'
                }`}
            />
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium pt-2">
          {progress}% - {etaLabel}
        </div>
      </div>
    </div>
  );
}