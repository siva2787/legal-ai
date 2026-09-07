import React, { useRef, useState } from 'react';
import {
  Download, Printer, AlertTriangle, ShieldCheck, ChevronLeft, Loader2,
  CheckCircle2, XCircle, AlertCircle, MinusCircle, ListChecks, BookOpenCheck, PenLine
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas-pro';
import { InspectionRecord, ProductContext, RuleResult, FactEvidence } from '../../types';
import { LegalMetLogo, AshokaEmblem } from '../common/BrandAssets';

interface ReportPreviewProps {
  inspection: InspectionRecord;
  onReturnToDashboard: () => void;
  onBackToResults: () => void;
}

const PRINT_FIX_STYLES = `
@media print {
  html, body { height: auto !important; overflow: visible !important; }
  #root, #app, .app-shell, .app-container, main {
    height: auto !important; max-height: none !important; overflow: visible !important;
  }
  #report-preview-page {
    overflow: visible !important; height: auto !important; max-height: none !important; position: static !important;
  }
  #official-inspection-report-document {
    overflow: visible !important; height: auto !important; max-height: none !important;
  }
  table, tr, td, th { page-break-inside: avoid; }
  h2, .avoid-break { page-break-inside: avoid; page-break-after: avoid; }
  @page { size: A4; margin: 12mm; }
}
`;

const NAVY: [number, number, number] = [15, 23, 42];
const SLATE_600: [number, number, number] = [71, 85, 105];
const SLATE_400: [number, number, number] = [148, 163, 184];
const BORDER: [number, number, number] = [226, 232, 240];
const PANEL_BG: [number, number, number] = [248, 250, 252];
const BLUE: [number, number, number] = [29, 78, 216];
const SAFFRON: [number, number, number] = [255, 153, 51];
const GREEN_FLAG: [number, number, number] = [19, 136, 8];
const EMERALD_BG: [number, number, number] = [209, 250, 229];
const EMERALD_TX: [number, number, number] = [4, 120, 87];
const ROSE_BG: [number, number, number] = [254, 226, 226];
const ROSE_TX: [number, number, number] = [190, 18, 60];
const AMBER_BG: [number, number, number] = [254, 243, 199];
const AMBER_TX: [number, number, number] = [180, 83, 9];
const SLATE_BG: [number, number, number] = [241, 245, 249];
const SLATE_TX: [number, number, number] = [71, 85, 105];

const RULE_CATEGORIES: { label: string; min: number; max: number }[] = [
  { label: 'General Provisions', min: 1, max: 4 },
  { label: 'Standard Quantities', min: 5, max: 5 },
  { label: 'Declarations', min: 6, max: 13 },
  { label: 'Dimensions & Related', min: 14, max: 17 },
  { label: 'Wholesale / Retail', min: 18, max: 21 },
  { label: 'MPE', min: 22, max: 22 },
  { label: 'Deceptive Packages', min: 23, max: 23 },
  { label: 'Other Provisions', min: 24, max: 34 }
];

function ruleRangeLabel(min: number, max: number): string {
  return min === max ? `Rule ${min}` : `Rules ${min} \u2013 ${max}`;
}

function isReviewStatus(status: string): boolean {
  return status === 'NEEDS_REVIEW' || status === 'REQUIRES_MANUAL_VERIFICATION' || status === 'UNABLE_TO_DETERMINE';
}

function buildRuleCategoryRows(ruleResults: RuleResult[]) {
  return RULE_CATEGORIES.map((cat) => {
    const rows = ruleResults.filter((r) => r.rule_number >= cat.min && r.rule_number <= cat.max);
    const passed = rows.filter((r) => r.status === 'PASS').length;
    const failed = rows.filter((r) => r.status === 'FAIL').length;
    const review = rows.filter((r) => isReviewStatus(r.status)).length;
    const na = rows.filter((r) => r.status === 'NOT_APPLICABLE').length;
    return {
      label: cat.label,
      rangeLabel: ruleRangeLabel(cat.min, cat.max),
      applicable: rows.length,
      passed,
      failed,
      review,
      na
    };
  }).filter((c) => c.applicable > 0);
}

interface DeclarationRow {
  label: string;
  value: string;
  confidencePct: number | null;
}

function confidenceOf(evidence: Record<string, FactEvidence> | undefined, key: string): number | null {
  const e = evidence?.[key];
  if (!e || typeof e.confidence !== 'number') return null;
  const c = e.confidence <= 1 ? e.confidence * 100 : e.confidence;
  return Math.round(c);
}

function buildDeclarationRows(ctx: ProductContext): DeclarationRow[] {
  const rows: DeclarationRow[] = [
    { label: 'Product Name', value: ctx.product_name || 'N/A', confidencePct: confidenceOf(ctx.evidence, 'product_name') },
    { label: 'Brand', value: ctx.brand || 'N/A', confidencePct: confidenceOf(ctx.evidence, 'brand') },
    {
      label: 'Net Quantity',
      value: ctx.net_quantity != null ? `${ctx.net_quantity} ${ctx.net_quantity_unit || ''}`.trim() : 'N/A',
      confidencePct: confidenceOf(ctx.evidence, 'net_quantity')
    },
    {
      label: 'MRP',
      value: ctx.mrp != null ? `\u20b9 ${ctx.mrp.toFixed(2)} (incl. of all taxes)` : 'N/A',
      confidencePct: confidenceOf(ctx.evidence, 'mrp')
    },
    { label: 'Manufacturer', value: ctx.manufacturer || 'N/A', confidencePct: confidenceOf(ctx.evidence, 'manufacturer') },
    { label: 'Country of Origin', value: ctx.country_of_origin || 'N/A', confidencePct: confidenceOf(ctx.evidence, 'country_of_origin') },
    { label: 'Batch / Lot No.', value: ctx.batch_number || ctx.lot_number || 'N/A', confidencePct: confidenceOf(ctx.evidence, 'batch_number') },
    { label: 'Manufacturing Date', value: ctx.manufacturing_date || 'N/A', confidencePct: confidenceOf(ctx.evidence, 'manufacturing_date') },
    { label: 'Best Before', value: ctx.best_before || 'N/A', confidencePct: confidenceOf(ctx.evidence, 'best_before') },
    { label: 'Consumer Care', value: ctx.consumer_care_details || 'N/A', confidencePct: confidenceOf(ctx.evidence, 'consumer_care_details') }
  ];
  return rows;
}

interface KeyFinding {
  status: 'fail' | 'warn' | 'pass';
  text: string;
}

function buildKeyFindings(ruleResults: RuleResult[]): KeyFinding[] {
  const fails = ruleResults.filter((r) => r.status === 'FAIL').map((r) => ({ status: 'fail' as const, text: r.findings || r.explanation }));
  const reviews = ruleResults.filter((r) => isReviewStatus(r.status)).map((r) => ({ status: 'warn' as const, text: r.findings || r.explanation }));
  const passes = ruleResults.filter((r) => r.status === 'PASS').map((r) => ({ status: 'pass' as const, text: r.findings || r.explanation }));
  const combined: KeyFinding[] = [...fails, ...reviews];
  if (combined.length < 5) combined.push(...passes.slice(0, 5 - combined.length));
  return combined.slice(0, 5);
}

function findingIcon(status: KeyFinding['status']) {
  if (status === 'fail') return <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
  if (status === 'warn') return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
  return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
}

function statusBadgeClasses(status: string): string {
  if (status === 'PASS') return 'bg-emerald-100 text-emerald-800';
  if (status === 'FAIL') return 'bg-rose-100 text-rose-800';
  if (status === 'NOT_APPLICABLE') return 'bg-slate-100 text-slate-600';
  return 'bg-amber-100 text-amber-800';
}

async function renderReactPng(node: React.ReactElement, sizePx = 240): Promise<string> {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-9999px';
  host.style.top = '0';
  host.style.width = `${sizePx}px`;
  host.style.height = `${sizePx}px`;
  host.style.background = '#ffffff';
  document.body.appendChild(host);

  const { createRoot } = await import('react-dom/client');
  const root = createRoot(host);
  await new Promise<void>((resolve) => {
    root.render(node);
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const canvas = await html2canvas(host, { scale: 4, backgroundColor: '#ffffff' });
  root.unmount();
  document.body.removeChild(host);
  return canvas.toDataURL('image/png');
}

function pdfImageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  return dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
}

function statusColors(status: string): { bg: [number, number, number]; tx: [number, number, number] } {
  if (status === 'PASS') return { bg: EMERALD_BG, tx: EMERALD_TX };
  if (status === 'FAIL') return { bg: ROSE_BG, tx: ROSE_TX };
  if (status === 'NOT_APPLICABLE') return { bg: SLATE_BG, tx: SLATE_TX };
  return { bg: AMBER_BG, tx: AMBER_TX };
}

export function ReportPreview({ inspection, onReturnToDashboard, onBackToResults }: ReportPreviewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { product_context, compliance_summary, rule_results, images } = inspection;
  const isCompliant = compliance_summary?.overall_status === 'COMPLIANT';
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const mainImage = images.find((img) => img.view_type === 'Front View') || images[0];
  const thumbnailImages = images.slice(0, 3);

  const inspectionTypeLabel = product_context.package_type
    ? `${product_context.package_type.charAt(0).toUpperCase()}${product_context.package_type.slice(1)} Package`
    : 'N/A';
  const remarksText = (product_context.inspector_notes || '').trim() || 'Regular market inspection';

  const declarationRows = buildDeclarationRows(product_context);
  const ruleCategoryRows = buildRuleCategoryRows(rule_results);
  const categoryTotals = ruleCategoryRows.reduce(
    (acc, c) => ({
      applicable: acc.applicable + c.applicable,
      passed: acc.passed + c.passed,
      failed: acc.failed + c.failed,
      review: acc.review + c.review,
      na: acc.na + c.na
    }),
    { applicable: 0, passed: 0, failed: 0, review: 0, na: 0 }
  );
  const keyFindings = buildKeyFindings(rule_results);

  const primaryStandard = compliance_summary?.applicable_standards?.[0];
  const ruleNumbers = rule_results.map((r) => r.rule_number).filter((n) => typeof n === 'number');
  const minRule = ruleNumbers.length ? Math.min(...ruleNumbers) : null;
  const maxRule = ruleNumbers.length ? Math.max(...ruleNumbers) : null;

  const generatedOn = new Date();

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const [logoPng, emblemPng] = await Promise.all([
        renderReactPng(<LegalMetLogo className="w-full h-full" />, 160),
        renderReactPng(<AshokaEmblem className="w-full h-full" />, 240)
      ]);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 14;
      const contentW = pageW - marginX * 2;
      let y = 0;

      doc.setFillColor(...SAFFRON);
      doc.rect(0, 0, pageW / 3, 3, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(pageW / 3, 0, pageW / 3, 3, 'F');
      doc.setFillColor(...GREEN_FLAG);
      doc.rect((pageW / 3) * 2, 0, pageW / 3, 3, 'F');
      y = 9;

      const logoSize = 12;
      doc.addImage(logoPng, 'PNG', marginX, y, logoSize, logoSize);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...NAVY);
      doc.text('LegalMet AI', marginX + logoSize + 3, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...SLATE_600);
      doc.text('AI-Assisted Packaged Commodity Compliance Inspection', marginX + logoSize + 3, y + 9);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(...SLATE_400);
      doc.text('Smarter Inspections for a Fairer India', marginX + logoSize + 3, y + 12.5);

      const emblemSize = 11;
      doc.addImage(emblemPng, 'PNG', pageW - marginX - emblemSize, y, emblemSize, emblemSize);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...NAVY);
      doc.text('Government of India', pageW - marginX - emblemSize - 3, y + 4, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...SLATE_600);
      doc.text('Department of Consumer Affairs', pageW - marginX - emblemSize - 3, y + 8, { align: 'right' });
      doc.text('Legal Metrology', pageW - marginX - emblemSize - 3, y + 11.5, { align: 'right' });

      y += logoSize + 6;
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.6);
      doc.line(marginX, y, pageW - marginX, y);
      y += 7;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...NAVY);
      doc.text('Inspection Report', marginX, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_600);
      doc.text('Legal Metrology (Packaged Commodities) Rules, 2011', marginX, y + 5);

      const genBoxW = 45;
      const genBoxH = 12;
      const idBoxX = pageW - marginX - genBoxW;
      const genBoxX = idBoxX - genBoxW - 4;
      doc.setFillColor(...PANEL_BG);
      doc.setDrawColor(...BORDER);
      doc.roundedRect(genBoxX, y - 8, genBoxW, genBoxH, 1.5, 1.5, 'FD');
      doc.roundedRect(idBoxX, y - 8, genBoxW, genBoxH, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...SLATE_400);
      doc.text('REPORT GENERATED ON', genBoxX + 3, y - 4);
      doc.text('REPORT ID', idBoxX + 3, y - 4);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...NAVY);
      doc.text(
        `${generatedOn.toLocaleDateString('en-GB')}  ${generatedOn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        genBoxX + 3,
        y
      );
      doc.text(inspection.inspection_number || inspection.id, idBoxX + 3, y);
      y += 10;

      autoTable(doc, {
        startY: y,
        margin: { left: marginX, right: marginX },
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 7.6, textColor: NAVY, lineColor: BORDER, lineWidth: 0.2, cellPadding: 2.2 },
        body: [
          [
            { content: 'Inspection ID', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: inspection.inspection_number || inspection.id, styles: { fontStyle: 'bold' } },
            { content: 'Inspection Date', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: new Date(inspection.created_at).toLocaleDateString('en-GB'), styles: { fontStyle: 'bold' } }
          ],
          [
            { content: 'Inspector', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: `${inspection.inspector_name} (${inspection.inspector_id})`, styles: { fontStyle: 'bold' } },
            { content: 'Location', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: inspection.location || 'N/A', styles: { fontStyle: 'bold' } }
          ],
          [
            { content: 'Inspection Type', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: inspectionTypeLabel, styles: { fontStyle: 'bold' } },
            { content: 'Remarks', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: remarksText, styles: { fontStyle: 'normal' } }
          ]
        ],
        columnStyles: {
          0: { cellWidth: contentW * 0.2 },
          1: { cellWidth: contentW * 0.3 },
          2: { cellWidth: contentW * 0.2 },
          3: { cellWidth: contentW * 0.3 }
        }
      });
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 6;

      if (mainImage?.data_url) {
        try {
          const imgW = 30;
          const imgH = 30;
          doc.setDrawColor(...BORDER);
          doc.rect(marginX, y, imgW, imgH);
          doc.addImage(mainImage.data_url, pdfImageFormat(mainImage.data_url), marginX + 0.5, y + 0.5, imgW - 1, imgH - 1);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(...SLATE_400);
          doc.text(mainImage.view_type, marginX, y + imgH + 3.5, { align: 'left' });
        } catch {
          // image failed to embed; continue without it
        }
      }

      const textX = mainImage?.data_url ? marginX + 36 : marginX;
      const textW = contentW - (mainImage?.data_url ? 36 : 0);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text('1.  PACKAGE & COMMODITY PARTICULARS', textX, y + 4);

      autoTable(doc, {
        startY: y + 7,
        margin: { left: textX, right: marginX },
        tableWidth: textW,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 7.4, textColor: NAVY, lineColor: BORDER, lineWidth: 0.2, cellPadding: 1.8 },
        body: [
          [
            { content: 'Product Name', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: product_context.product_name || 'N/A', styles: { fontStyle: 'bold' } },
            { content: 'Brand', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: product_context.brand || 'N/A', styles: { fontStyle: 'bold' } }
          ],
          [
            { content: 'Net Quantity', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: `${product_context.net_quantity ?? 'N/A'} ${product_context.net_quantity_unit || ''}`.trim(), styles: { fontStyle: 'bold' } },
            { content: 'MRP', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: product_context.mrp != null ? `Rs. ${product_context.mrp.toFixed(2)}` : 'N/A', styles: { fontStyle: 'bold' } }
          ],
          [
            { content: 'Manufacturer', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: product_context.manufacturer || 'N/A', colSpan: 3, styles: { fontStyle: 'normal' } }
          ],
          [
            { content: 'Batch / Lot No.', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: product_context.batch_number || 'N/A', styles: { fontStyle: 'bold' } },
            { content: 'Country of Origin', styles: { fontStyle: 'bold', textColor: SLATE_600, fillColor: PANEL_BG } },
            { content: product_context.country_of_origin || 'N/A', styles: { fontStyle: 'bold' } }
          ]
        ]
      });
      // @ts-ignore
      const packagingTableEnd = doc.lastAutoTable.finalY;
      y = Math.max(packagingTableEnd, y + 30) + 8;

      if (y > pageH - 60) {
        doc.addPage();
        y = 16;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text('2.  OVERALL COMPLIANCE STATUS', marginX, y);
      y += 3;

      const bannerH = 15;
      const bannerColor = isCompliant ? EMERALD_BG : ROSE_BG;
      const bannerText = isCompliant ? EMERALD_TX : ROSE_TX;
      doc.setFillColor(...bannerColor);
      doc.roundedRect(marginX, y, contentW, bannerH, 2, 2, 'F');
      doc.setTextColor(...bannerText);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(compliance_summary?.overall_status.replace('_', ' ') || 'N/A', marginX + 5, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(
        `Passed ${compliance_summary?.rules_passed ?? 0}  \u2022  Failed ${compliance_summary?.rules_failed ?? 0}  \u2022  Review ${compliance_summary?.needs_review ?? 0}  \u2022  N/A ${compliance_summary?.not_applicable ?? 0}`,
        marginX + 5,
        y + 12
      );
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`${compliance_summary?.compliance_percentage ?? 0}%`, pageW - marginX - 5, y + 9.5, { align: 'right' });
      y += bannerH + 7;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text('3.  KEY DECLARATIONS EXTRACTED', marginX, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        margin: { left: marginX, right: pageW / 2 + 2 },
        tableWidth: contentW / 2 - 2,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 6.8, textColor: NAVY, lineColor: BORDER, lineWidth: 0.2, cellPadding: 1.6 },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6.8 },
        head: [['Declaration', 'Value', 'Conf.']],
        body: declarationRows.map((d) => [d.label, d.value, d.confidencePct != null ? `${d.confidencePct}%` : '\u2014'])
      });
      // @ts-ignore
      const declTableEnd = doc.lastAutoTable.finalY;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text('4.  RULE-WISE SUMMARY', pageW / 2 + 2, y - 3);

      autoTable(doc, {
        startY: y,
        margin: { left: pageW / 2 + 2, right: marginX },
        tableWidth: contentW / 2 - 2,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 6.6, textColor: NAVY, lineColor: BORDER, lineWidth: 0.2, cellPadding: 1.5, halign: 'center' },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6.6 },
        head: [['Category', 'App.', 'P', 'F', 'R', 'N/A']],
        body: [
          ...ruleCategoryRows.map((c) => [c.label, String(c.applicable), String(c.passed), String(c.failed), String(c.review), String(c.na)]),
          [
            { content: 'Total', styles: { fontStyle: 'bold' } },
            { content: String(categoryTotals.applicable), styles: { fontStyle: 'bold' } },
            { content: String(categoryTotals.passed), styles: { fontStyle: 'bold' } },
            { content: String(categoryTotals.failed), styles: { fontStyle: 'bold' } },
            { content: String(categoryTotals.review), styles: { fontStyle: 'bold' } },
            { content: String(categoryTotals.na), styles: { fontStyle: 'bold' } }
          ]
        ],
        columnStyles: { 0: { halign: 'left', cellWidth: (contentW / 2 - 2) * 0.44 } }
      });
      // @ts-ignore
      const ruleTableEnd = doc.lastAutoTable.finalY;
      y = Math.max(declTableEnd, ruleTableEnd) + 8;

      if (y > pageH - 70) {
        doc.addPage();
        y = 16;
      }

      const halfW = contentW / 2 - 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text('5.  KEY FINDINGS', marginX, y);
      let fy = y + 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      keyFindings.forEach((f) => {
        doc.setTextColor(f.status === 'fail' ? ROSE_TX[0] : f.status === 'warn' ? AMBER_TX[0] : EMERALD_TX[0], f.status === 'fail' ? ROSE_TX[1] : f.status === 'warn' ? AMBER_TX[1] : EMERALD_TX[1], f.status === 'fail' ? ROSE_TX[2] : f.status === 'warn' ? AMBER_TX[2] : EMERALD_TX[2]);
        doc.text(f.status === 'fail' ? 'x' : f.status === 'warn' ? '!' : '\u2713', marginX, fy);
        doc.setTextColor(...NAVY);
        const wrapped = doc.splitTextToSize(f.text, halfW - 5);
        doc.text(wrapped, marginX + 4, fy);
        fy += wrapped.length * 3.4 + 1.5;
      });

      const legalX = marginX + halfW + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text('6.  LEGAL REFERENCE', legalX, y);
      let ly = y + 5;
      const legalRows: [string, string][] = [
        ['Source Document', primaryStandard?.name || rule_results[0]?.source_document || 'N/A'],
        ['Relevant Rules', minRule != null && maxRule != null ? `${minRule} \u2013 ${maxRule}` : 'N/A'],
        ['Version', primaryStandard?.version || rule_results[0]?.rule_version || 'N/A'],
        ['Reference', primaryStandard?.reference || 'Government of India, Ministry of Consumer Affairs, Food & Public Distribution']
      ];
      legalRows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...SLATE_400);
        doc.text(label.toUpperCase(), legalX, ly);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        const wrapped = doc.splitTextToSize(value, halfW - 2);
        doc.text(wrapped, legalX, ly + 3.5);
        ly += wrapped.length * 3.2 + 5;
      });

      y = Math.max(fy, ly) + 6;
      if (y > pageH - 45) {
        doc.addPage();
        y = 16;
      }

      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.4);
      doc.line(marginX, y, pageW - marginX, y);
      y += 7;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...NAVY);
      doc.text("INSPECTOR'S REMARKS", marginX, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_600);
      const remarksWrapped = doc.splitTextToSize(remarksText, halfW);
      doc.text(remarksWrapped, marginX, y + 5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(13);
      doc.setTextColor(...NAVY);
      doc.text(inspection.inspector_name, pageW - marginX, y + 2, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('Inspector, Legal Metrology', pageW - marginX, y + 7, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...SLATE_400);
      doc.text(inspection.location || '', pageW - marginX, y + 10.5, { align: 'right' });

      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...SLATE_400);
        doc.text(`Page ${p} of ${totalPages}`, pageW - marginX, pageH - 8, { align: 'right' });
        doc.text('LegalMet AI \u2014 Transparent Markets. Empowered Consumers. A Fairer India.', marginX, pageH - 8);
      }

      doc.save(`${inspection.inspection_number || 'inspection-report'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Check console for details.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div id="report-preview-page" className="p-6 max-w-6xl mx-auto space-y-6">
      <style>{PRINT_FIX_STYLES}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button onClick={onBackToResults} className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all text-xs w-fit">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>

        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 transition-all text-xs">
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all text-xs">
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
          </button>

          <button onClick={onReturnToDashboard} className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all">
            Done
          </button>
        </div>
      </div>

      <div ref={reportRef} id="official-inspection-report-document" className="bg-white rounded-2xl border border-slate-300 shadow-lg overflow-hidden print:shadow-none print:border-none">
        <div className="h-1.5 flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        <div className="p-8 sm:p-10 space-y-8 print:p-0">
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200 avoid-break">
            <div className="flex items-center gap-3">
              <LegalMetLogo className="w-12 h-12" />
              <div>
                <div className="text-xl font-black text-slate-900 leading-tight">LegalMet AI</div>
                <div className="text-[11px] font-semibold text-slate-500 leading-tight">AI-Assisted Packaged Commodity Compliance Inspection</div>
                <div className="text-[10px] italic text-slate-400 leading-tight">Smarter Inspections for a Fairer India</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-xs font-black text-slate-900 leading-tight">Government of India</div>
                <div className="text-[11px] font-semibold text-slate-500 leading-tight">Department of Consumer Affairs</div>
                <div className="text-[11px] font-semibold text-slate-500 leading-tight">Legal Metrology</div>
              </div>
              <AshokaEmblem className="w-12 h-12" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 avoid-break">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Inspection Report</h1>
              <div className="text-xs font-semibold text-slate-500">Legal Metrology (Packaged Commodities) Rules, 2011</div>
            </div>
            <div className="flex gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Report Generated On</div>
                <div className="font-bold text-slate-900">
                  {generatedOn.toLocaleDateString('en-GB')} {generatedOn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Report ID</div>
                <div className="font-bold text-slate-900">{inspection.inspection_number || inspection.id}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 avoid-break">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wide text-slate-700 pb-1 border-b border-slate-100">Inspection Details</div>
              {[
                ['Inspection ID', inspection.inspection_number || inspection.id],
                ['Inspection Date', new Date(inspection.created_at).toLocaleDateString('en-GB')],
                ['Inspector Name', inspection.inspector_name],
                ['Inspector ID', inspection.inspector_id],
                ['Location', inspection.location || 'N/A'],
                ['Inspection Type', inspectionTypeLabel],
                ['Remarks', remarksText]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-semibold shrink-0">{label}</span>
                  <span className="text-slate-900 font-bold text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wide text-slate-700 pb-1 border-b border-slate-100">Product Information</div>
              {[
                ['Product Name', product_context.product_name || 'N/A'],
                ['Brand', product_context.brand || 'N/A'],
                ['Category', product_context.category || 'N/A'],
                ['Net Quantity', `${product_context.net_quantity ?? 'N/A'} ${product_context.net_quantity_unit || ''}`.trim()],
                ['MRP', product_context.mrp != null ? `\u20b9 ${product_context.mrp.toFixed(2)} (incl. of all taxes)` : 'N/A'],
                ['Manufacturer', product_context.manufacturer || 'N/A'],
                ['Country of Origin', product_context.country_of_origin || 'N/A'],
                ['Batch / Lot No.', product_context.batch_number || product_context.lot_number || 'N/A'],
                ['Mfg. Date', product_context.manufacturing_date || 'N/A'],
                ['Best Before', product_context.best_before || 'N/A'],
                ['Consumer Care', product_context.consumer_care_details || 'N/A']
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-semibold shrink-0">{label}</span>
                  <span className="text-slate-900 font-bold text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="text-xs font-black uppercase tracking-wide text-slate-700 pb-1 border-b border-slate-100">Product Images</div>
              {mainImage?.data_url ? (
                <img src={mainImage.data_url} alt={mainImage.view_type} className="w-full h-40 object-contain rounded-lg border border-slate-200 bg-slate-50" />
              ) : (
                <div className="w-full h-40 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400">No image</div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {thumbnailImages.map((img) => (
                  <div key={img.id} className="space-y-1">
                    <img src={img.data_url} alt={img.view_type} className="w-full h-14 object-contain rounded border border-slate-200 bg-slate-50" />
                    <div className="text-[9px] text-center text-slate-400 font-semibold">{img.view_type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 flex flex-col lg:flex-row items-center gap-6 avoid-break ${isCompliant ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center gap-3 flex-1">
              {isCompliant ? <ShieldCheck className="w-9 h-9 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-9 h-9 text-rose-600 shrink-0" />}
              <div>
                <div className="text-xs font-bold text-slate-600 uppercase">Overall Compliance Status</div>
                <div className={`text-2xl font-black ${isCompliant ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {compliance_summary?.overall_status.replace('_', ' ') || 'N/A'}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {isCompliant
                    ? 'This product complies with the applicable provisions of the Legal Metrology (Packaged Commodities) Rules, 2011.'
                    : 'This product does not fully comply with the applicable provisions of the Legal Metrology (Packaged Commodities) Rules, 2011.'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {[
                { label: 'Rules Passed', value: compliance_summary?.rules_passed ?? 0, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
                { label: 'Rules Failed', value: compliance_summary?.rules_failed ?? 0, icon: <XCircle className="w-5 h-5 text-rose-600" /> },
                { label: 'Needs Review', value: compliance_summary?.needs_review ?? 0, icon: <AlertCircle className="w-5 h-5 text-amber-500" /> },
                { label: 'Not Applicable', value: compliance_summary?.not_applicable ?? 0, icon: <MinusCircle className="w-5 h-5 text-slate-400" /> }
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-white/60 shadow-sm px-4 py-3 text-center min-w-[92px]">
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <div className="text-lg font-black text-slate-900">{s.value}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="text-xs font-black uppercase tracking-wide text-slate-700">Key Declarations Extracted</div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-2 text-left font-bold">Declaration</th>
                    <th className="p-2 text-left font-bold">Detected Value</th>
                    <th className="p-2 text-right font-bold">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {declarationRows.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2 font-semibold text-slate-600">{row.label}</td>
                      <td className="p-2 font-bold text-slate-900">{row.value}</td>
                      <td className="p-2 text-right font-bold text-slate-700">{row.confidencePct != null ? `${row.confidencePct}%` : '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="text-xs font-black uppercase tracking-wide text-slate-700">Rule-wise Summary</div>
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-1.5 text-left font-bold">Rule Category</th>
                    <th className="p-1.5 text-center font-bold">App.</th>
                    <th className="p-1.5 text-center font-bold text-emerald-700">Passed</th>
                    <th className="p-1.5 text-center font-bold text-rose-700">Failed</th>
                    <th className="p-1.5 text-center font-bold text-amber-700">Review</th>
                    <th className="p-1.5 text-center font-bold text-slate-500">N/A</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ruleCategoryRows.map((c) => (
                    <tr key={c.label}>
                      <td className="p-1.5 font-semibold text-slate-700">
                        {c.label} <span className="text-slate-400 font-normal">({c.rangeLabel})</span>
                      </td>
                      <td className="p-1.5 text-center font-bold text-slate-900">{c.applicable}</td>
                      <td className="p-1.5 text-center font-bold text-emerald-700">{c.passed}</td>
                      <td className="p-1.5 text-center font-bold text-rose-700">{c.failed}</td>
                      <td className="p-1.5 text-center font-bold text-amber-700">{c.review}</td>
                      <td className="p-1.5 text-center font-bold text-slate-500">{c.na}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-black text-slate-900">
                    <td className="p-1.5">Total</td>
                    <td className="p-1.5 text-center">{categoryTotals.applicable}</td>
                    <td className="p-1.5 text-center text-emerald-700">{categoryTotals.passed}</td>
                    <td className="p-1.5 text-center text-rose-700">{categoryTotals.failed}</td>
                    <td className="p-1.5 text-center text-amber-700">{categoryTotals.review}</td>
                    <td className="p-1.5 text-center text-slate-500">{categoryTotals.na}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-700">
                <ListChecks className="w-4 h-4 text-slate-500" />
                <span>Key Findings</span>
              </div>
              <div className="space-y-2">
                {keyFindings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    {findingIcon(f.status)}
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-700">
                <BookOpenCheck className="w-4 h-4 text-slate-500" />
                <span>Legal Reference</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Legal Metrology (Packaged Commodities) Rules, 2011</div>
              {[
                ['Source Document', primaryStandard?.name || rule_results[0]?.source_document || 'N/A'],
                ['Relevant Rules', minRule != null && maxRule != null ? `${minRule} \u2013 ${maxRule}` : 'N/A'],
                ['Version', primaryStandard?.version || rule_results[0]?.rule_version || 'N/A'],
                ['Reference', primaryStandard?.reference || 'Government of India, Ministry of Consumer Affairs, Food & Public Distribution']
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-semibold shrink-0">{label}</span>
                  <span className="text-slate-900 font-bold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 avoid-break">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-700">
                <PenLine className="w-4 h-4 text-slate-500" />
                <span>Inspector's Remarks</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{remarksText}</p>
            </div>
            <div className="text-center sm:text-right space-y-1">
              <div className="text-xs font-black uppercase tracking-wide text-slate-700 mb-2">Authorised Signature</div>
              <div className="text-2xl italic font-serif text-slate-800">{inspection.inspector_name}</div>
              <div className="text-xs font-bold text-slate-900">{inspection.inspector_name}</div>
              <div className="text-[11px] text-slate-500">Inspector, Legal Metrology</div>
              <div className="text-[10px] text-slate-400">{inspection.location || ''}</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 print:px-0">
          <div className="flex items-center gap-2">
            <LegalMetLogo className="w-6 h-6" />
            <div className="text-[11px]">
              <div className="font-bold">LegalMet AI</div>
              <div className="text-slate-400">Government of India | Department of Consumer Affairs | Legal Metrology</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">Transparent Markets &nbsp;|&nbsp; Empowered Consumers &nbsp;|&nbsp; A Fairer India</div>
        </div>
      </div>
    </div>
  );
}