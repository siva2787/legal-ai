import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Check,
  ChevronRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Info,
  Maximize2,
  RotateCw
} from 'lucide-react';
import { ProductContext, PackageImage, FieldCorrection } from '../../types';

interface ExtractedInfoReviewProps {
  productContext: ProductContext;
  images: PackageImage[];
  onProceedToResults: (updatedContext: ProductContext) => void;
  onBackToUpload: () => void;
}

export function ExtractedInfoReview({
  productContext,
  images,
  onProceedToResults,
  onBackToUpload
}: ExtractedInfoReviewProps) {
  const [context, setContext] = useState<ProductContext>({ ...productContext });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [measuredQuantity, setMeasuredQuantity] = useState<string>(
    context.measured_quantity ? String(context.measured_quantity) : ''
  );

  const startEdit = (field: keyof ProductContext, currentVal: any) => {
    setEditingField(field as string);
    setTempValue(String(currentVal || ''));
    setCorrectionReason('Field clarity correction by inspector');
  };

  const saveEdit = (field: keyof ProductContext) => {
    const oldVal = context[field];
    const updated: ProductContext = {
      ...context,
      [field]: typeof oldVal === 'number' ? parseFloat(tempValue) || 0 : tempValue
    };

    // Record audit trail correction
    const correction: FieldCorrection = {
      field: field as string,
      original_value: oldVal,
      corrected_value: tempValue,
      corrected_by: 'Rohinth Kumaran',
      timestamp: new Date().toISOString(),
      reason: correctionReason || 'Inspector manual review correction'
    };

    updated.corrections = [...(updated.corrections || []), correction];
    setContext(updated);
    setEditingField(null);
  };

  const handleRunCompliance = () => {
    const finalContext = {
      ...context,
      measured_quantity: measuredQuantity ? parseFloat(measuredQuantity) : null
    };
    onProceedToResults(finalContext);
  };

  const currentImage = images[activeImageIndex] || images[0];

  return (
    <div id="extracted-info-review-page" className="p-6 max-w-7xl mx-auto space-y-6">
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

          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </span>
            <span>Review Info</span>
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

      {/* Header bar with primary action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Extracted Information Review
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              96% High Confidence
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Review and verify AI-extracted declarations before running deterministic compliance verification.
          </p>
        </div>

        <button
          id="run-compliance-check-btn"
          onClick={handleRunCompliance}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all text-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Run Compliance Check</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Left (Visual inspection with bounding overlays) & Right (Extracted facts list) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Evidence Inspection */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Package Evidence</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Inspection Panel</span>
            </div>
          </div>

          {/* Main Visual Image Display */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-4/3 flex items-center justify-center group">
            {currentImage?.data_url ? (
              <img
                src={currentImage.data_url}
                alt={currentImage.view_type}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-400 text-xs">No image provided</div>
            )}

            {/* Bounding Box HUD Overlays — driven by real extracted values & confidence */}
            {context.brand && (
              <div className="absolute top-10 left-12 border-2 border-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm text-[10px] text-emerald-300 font-bold backdrop-blur-2xs pointer-events-none">
                Brand: {context.brand} [{(context.evidence?.brand?.confidence ?? context.evidence?.product_name?.confidence ?? 0).toFixed(2)}]
              </div>
            )}
            {context.net_quantity != null && (
              <div className="absolute bottom-16 right-10 border-2 border-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm text-[10px] text-blue-300 font-bold backdrop-blur-2xs pointer-events-none">
                Net Qty: {context.net_quantity} {context.net_quantity_unit} [{(context.evidence?.net_quantity?.confidence ?? 0).toFixed(2)}]
              </div>
            )}
            {context.mrp != null && (
              <div className="absolute bottom-6 left-12 border-2 border-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-sm text-[10px] text-purple-300 font-bold backdrop-blur-2xs pointer-events-none">
                MRP: ₹ {Number(context.mrp).toFixed(2)} [{(context.evidence?.mrp?.confidence ?? 0).toFixed(2)}]
              </div>
            )}
          </div>

          {/* Thumbnail View Switcher */}
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                className={`p-1.5 rounded-lg border text-left transition-all ${activeImageIndex === idx
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <div className="aspect-video rounded-sm overflow-hidden bg-slate-100 mb-1">
                  <img src={img.data_url} alt={img.view_type} className="w-full h-full object-cover" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 truncate">{img.view_type}</div>
              </button>
            ))}
          </div>

          {/* Physical Measurement / Weighing Machine Input */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Physical Measurement (Rule 22 MPE Testing)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Input laboratory or field measured net quantity to verify Maximum Permissible Error (MPE) under First Schedule.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                step="0.1"
                value={measuredQuantity}
                onChange={(e) => setMeasuredQuantity(e.target.value)}
                placeholder="e.g. 48.5"
                className="w-32 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-600">{context.net_quantity_unit}</span>
              <span className="text-[11px] text-slate-400">
                (Declared: {context.net_quantity} {context.net_quantity_unit})
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Declarations Form & Audit Trail */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Extracted Declarations</h2>
            <div className="text-xs text-slate-500">
              Click edit on any field to correct or refine
            </div>
          </div>

          <div className="space-y-3">
            {/* Field Row: Product Name */}
            <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Generic Commodity Name
                </div>
                {editingField === 'product_name' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="text-sm font-bold border border-slate-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => saveEdit('product_name')}
                      className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-slate-900">{context.product_name}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  98%
                </span>
                <button
                  onClick={() => startEdit('product_name', context.product_name)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Field Row: Brand */}
            <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Brand Name
                </div>
                {editingField === 'brand' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="text-sm font-bold border border-slate-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => saveEdit('brand')}
                      className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-slate-900">{context.brand}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  99%
                </span>
                <button
                  onClick={() => startEdit('brand', context.brand)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Field Row: Net Quantity */}
            <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Declared Net Quantity
                </div>
                {editingField === 'net_quantity' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-24 text-sm font-bold border border-slate-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => saveEdit('net_quantity')}
                      className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-slate-900">
                    {context.net_quantity} {context.net_quantity_unit}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  97%
                </span>
                <button
                  onClick={() => startEdit('net_quantity', context.net_quantity)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Field Row: MRP */}
            <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Maximum Retail Price (MRP)
                </div>
                {editingField === 'mrp' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-24 text-sm font-bold border border-slate-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => saveEdit('mrp')}
                      className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-slate-900">
                    ₹ {context.mrp.toFixed(2)} (incl. of all taxes)
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  98%
                </span>
                <button
                  onClick={() => startEdit('mrp', context.mrp)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Field Row: Manufacturer */}
            <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Manufacturer / Packer
                </div>
                <div className="text-sm font-bold text-slate-900">{context.manufacturer}</div>
                <div className="text-xs text-slate-500">{context.manufacturer_address}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  96%
                </span>
              </div>
            </div>

            {/* Field Row: Batch & Dates */}
            <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Batch No. & Dates
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Batch: {context.batch_number} | Mfg: {context.manufacturing_date}
                </div>
                <div className="text-xs text-slate-500">Best Before: {context.best_before}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  94%
                </span>
              </div>
            </div>

            {/* Field Row: Consumer Care (Flagged as Needs Verification) */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 transition-colors flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Consumer Care Details
                </div>
                {editingField === 'consumer_care_details' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      placeholder="e.g. care@freshfoods.in | 1800-11-2233"
                      className="w-64 text-xs font-bold border border-slate-300 rounded px-2 py-1 bg-white"
                    />
                    <button
                      onClick={() => saveEdit('consumer_care_details')}
                      className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-amber-900 mt-0.5">
                    {context.consumer_care_details || 'Not visible on front panel (Needs Inspector Verification)'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Needs Review
                </span>
                <button
                  onClick={() => startEdit('consumer_care_details', context.consumer_care_details)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Audit Trail of Corrections */}
          {context.corrections && context.corrections.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <div className="font-bold text-slate-700 mb-1">Audit Trail ({context.corrections.length} correction):</div>
              {context.corrections.map((corr, idx) => (
                <div key={idx} className="text-slate-500 text-[11px]">
                  • Modified <strong>{corr.field}</strong> from "{corr.original_value}" to "{corr.corrected_value}" by {corr.corrected_by}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}