export type ComplianceStatus =
  | 'PASS'
  | 'FAIL'
  | 'REQUIRES_MANUAL_VERIFICATION'
  | 'NEEDS_REVIEW'
  | 'NOT_APPLICABLE'
  | 'UNABLE_TO_DETERMINE';

export type InspectionWorkflowStatus =
  | 'CREATED'
  | 'UPLOADED'
  | 'ANALYZING'
  | 'REVIEW_REQUIRED'
  | 'READY_FOR_COMPLIANCE'
  | 'COMPLETED'
  | 'FAILED';

export interface BoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface FactEvidence {
  field: string;
  value: string | number | boolean | null;
  unit?: string;
  confidence: number;
  source_text: string;
  evidence_location?: {
    image_id?: string;
    image_view?: 'front' | 'back' | 'side' | 'other';
    bounding_box?: BoundingBox;
  };
  extraction_method: 'multimodal_vision' | 'ocr_regex' | 'manual_entry';
}

export interface FactCorrection {
  field: string;
  original_value: any;
  corrected_value: any;
  reason?: string;
  correction_reason?: string;
  corrected_by: string;
  timestamp?: string;
  corrected_at?: string;
  original_evidence?: FactEvidence;
}

export type FieldCorrection = FactCorrection;

export interface PackageImage {
  id: string;
  view_type: 'Front View' | 'Back View' | 'Side View' | 'Additional View';
  data_url: string;
  file_name: string;
  file_size?: number;
}

export interface ProductContext {
  product_name: string;
  brand: string;
  category: string;
  
  net_quantity: number | null;
  net_quantity_unit: string;
  quantity_type: 'weight' | 'volume' | 'length' | 'area' | 'number';
  
  mrp: number | null;
  currency: string;
  
  manufacturer: string;
  manufacturer_address: string;
  
  packer: string;
  packer_address: string;
  
  importer: string;
  importer_address: string;
  
  country_of_origin: string;
  
  batch_number: string;
  lot_number: string;
  
  manufacturing_date: string;
  best_before: string;
  expiry_date: string;
  
  consumer_care_details: string;
  dimensions: string;
  
  other_declarations: string[];
  
  package_type: 'retail' | 'wholesale' | 'export' | 'small';
  market_type: 'general_consumer' | 'industrial_consumer' | 'institutional_consumer';
  consumer_type: 'retail' | 'institutional' | 'industrial';
  
  exemptions_claimed: string[];
  
  raw_ocr_text: string;
  evidence: Record<string, FactEvidence>;
  corrections: FactCorrection[];
  
  overall_confidence: number;
  provenance: string;
  
  // Physical measurements entered by inspector
  measured_quantity: number | null;
  measured_quantity_unit: string;
  measured_gross_weight?: number | null;
  measured_tare_weight?: number | null;
  inspector_notes?: string;
}

export interface RuleConditionResult {
  description: string;
  passed: boolean;
}

export interface RuleResult {
  check_id: string;
  inspection_id?: string;
  rule_id: string;
  rule_code: string;
  rule_number: number;
  sub_rule?: string;
  clause?: string;
  title: string;
  requirement: string;
  applicability: boolean;
  exemption_applied: boolean;
  exemption_details?: string;
  detected_value: string;
  expected_condition: string;
  required_value?: string;
  measured_value?: string;
  status: ComplianceStatus;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  explanation: string;
  findings?: string;
  legal_citation?: string;
  evidence_used?: string;
  conditions?: RuleConditionResult[];
  evidence_source_text?: string;
  evidence_image_id?: string;
  evidence_location?: string;
  source_document: string;
  source_page: string;
  source_text: string;
  schedule_reference?: string;
  rule_version: string;
  manual_verification_required: boolean;
}

export interface ComplianceSummary {
  overall_status: 'COMPLIANT' | 'NON-COMPLIANT' | 'REVIEW_REQUIRED' | 'NOT_APPLICABLE';
  rules_passed: number;
  rules_failed: number;
  needs_review: number;
  not_applicable: number;
  total_rules: number;
  compliance_percentage: number;
  applicable_standards: Array<{
    name: string;
    reference: string;
    version: string;
  }>;
  evaluated_at: string;
}

export interface InspectionRecord {
  id: string;
  inspection_number: string;
  created_at: string;
  updated_at: string;
  inspector_name: string;
  inspector_id: string;
  location: string;
  workflow_status: InspectionWorkflowStatus;
  
  images: PackageImage[];
  product_context: ProductContext;
  rule_results: RuleResult[];
  compliance_summary: ComplianceSummary | null;
}

export interface UserProfile {
  name: string;
  role: string;
  employee_id: string;
  email: string;
  phone: string;
  department: string;
  region: string;
  zone?: string;
  avatar_url?: string;
}

export interface LegalRuleInfo {
  rule_id: string;
  rule_code?: string;
  rule_number: number;
  title: string;
  summary: string;
  legal_text?: string;
  chapter: string;
  provisions?: string[];
  exemptions?: string[];
  schedules?: string[];
  source_document: string;
  source_page: string;
  legal_version: string;
}
