import { InspectionRecord, ProductContext } from '../types';
import { evaluateCompliance } from '../legal/ruleEngine';

export const DEFAULT_POTATO_CHIPS_PRODUCT: ProductContext = {
  product_name: 'Potato Chips',
  brand: 'FarmFresh',
  category: 'Packaged Snacks',
  net_quantity: 50,
  net_quantity_unit: 'g',
  quantity_type: 'weight',
  mrp: 50.0,
  currency: 'INR',
  manufacturer: 'FreshFoods Pvt. Ltd.',
  manufacturer_address: 'Plot 42, Industrial Area, Phase II, New Delhi 110020',
  packer: 'FreshFoods Pvt. Ltd.',
  packer_address: 'Plot 42, Industrial Area, Phase II, New Delhi 110020',
  importer: '',
  importer_address: '',
  country_of_origin: 'India',
  batch_number: 'FF0825A',
  lot_number: 'L-2026-88',
  manufacturing_date: '10 AUG 2025',
  best_before: '10 FEB 2026',
  expiry_date: '10 FEB 2026',
  consumer_care_details: 'Not visible', // Needs review on front view
  dimensions: '18 cm x 12 cm',
  other_declarations: ['Vegetarian Green Dot', 'FSSAI Lic. No. 10018011000123'],
  package_type: 'retail',
  market_type: 'general_consumer',
  consumer_type: 'retail',
  exemptions_claimed: [],
  raw_ocr_text:
    'FarmFresh Potato Chips Classic Salted M.R.P. Rs. 50.00 (incl. of all taxes) Net Weight 50 g Mfg. Date 10/08/2025 Best Before 6 months from packaging Batch No: FF0825A FreshFoods Pvt. Ltd. Country of Origin: India',
  evidence: {
    product_name: {
      field: 'product_name',
      value: 'Potato Chips',
      confidence: 0.98,
      source_text: 'Potato Chips Classic Salted',
      extraction_method: 'multimodal_vision'
    },
    brand: {
      field: 'brand',
      value: 'FarmFresh',
      confidence: 0.99,
      source_text: 'FarmFresh',
      extraction_method: 'multimodal_vision'
    },
    net_quantity: {
      field: 'net_quantity',
      value: 50,
      unit: 'g',
      confidence: 0.97,
      source_text: 'Net Weight 50 g',
      extraction_method: 'multimodal_vision'
    },
    mrp: {
      field: 'mrp',
      value: 50.0,
      unit: 'INR',
      confidence: 0.98,
      source_text: 'M.R.P. ₹ 50.00 (incl. of all taxes)',
      extraction_method: 'multimodal_vision'
    },
    manufacturer: {
      field: 'manufacturer',
      value: 'FreshFoods Pvt. Ltd.',
      confidence: 0.96,
      source_text: 'Mfd by: FreshFoods Pvt. Ltd., Plot 42, Ind. Area, Delhi',
      extraction_method: 'multimodal_vision'
    },
    country_of_origin: {
      field: 'country_of_origin',
      value: 'India',
      confidence: 0.95,
      source_text: 'Country of Origin: India',
      extraction_method: 'multimodal_vision'
    },
    batch_number: {
      field: 'batch_number',
      value: 'FF0825A',
      confidence: 0.94,
      source_text: 'Batch No: FF0825A',
      extraction_method: 'multimodal_vision'
    },
    manufacturing_date: {
      field: 'manufacturing_date',
      value: '10 AUG 2025',
      confidence: 0.93,
      source_text: 'Mfg. Date 10 AUG 2025',
      extraction_method: 'multimodal_vision'
    },
    best_before: {
      field: 'best_before',
      value: '10 FEB 2026',
      confidence: 0.92,
      source_text: 'Best Before 10 FEB 2026',
      extraction_method: 'multimodal_vision'
    },
    consumer_care_details: {
      field: 'consumer_care_details',
      value: 'Not visible',
      confidence: 0.6,
      source_text: 'Not clearly visible on front panel',
      extraction_method: 'multimodal_vision'
    }
  },
  corrections: [],
  overall_confidence: 0.96,
  provenance: 'AI Multimodal Vision Extraction with LegalMet Engine',
  measured_quantity: null,
  measured_quantity_unit: 'g'
};

const chipsEvaluation = evaluateCompliance(DEFAULT_POTATO_CHIPS_PRODUCT, {
  inspection_id: 'INS-2026-1004'
});

export const SEED_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'insp-1004',
    inspection_number: 'INS-2026-1004',
    created_at: '2026-08-25T10:24:00Z',
    updated_at: '2026-08-25T10:28:00Z',
    inspector_name: 'Rohinth Kumaran',
    inspector_id: 'LM-10334',
    location: 'Kumbakonam, Tamil Nadu',
    workflow_status: 'COMPLETED',
    images: [
      {
        id: 'img-1',
        view_type: 'Front View',
        data_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
        file_name: 'chips_front.jpg',
        file_size: 1450000
      },
      {
        id: 'img-2',
        view_type: 'Back View',
        data_url: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=600&auto=format&fit=crop&q=80',
        file_name: 'chips_back.jpg',
        file_size: 1250000
      },
      {
        id: 'img-3',
        view_type: 'Side View',
        data_url: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=600&auto=format&fit=crop&q=80',
        file_name: 'chips_side.jpg',
        file_size: 980000
      }
    ],
    product_context: DEFAULT_POTATO_CHIPS_PRODUCT,
    rule_results: chipsEvaluation.results,
    compliance_summary: chipsEvaluation.summary
  },
  {
    id: 'insp-124',
    inspection_number: 'INS-2026-124',
    created_at: '2026-09-02T10:24:00Z',
    updated_at: '2026-09-02T10:30:00Z',
    inspector_name: 'Rohinth Kumaran',
    inspector_id: 'LM-10334',
    location: 'T. Nagar Market, Chennai',
    workflow_status: 'COMPLETED',
    images: [
      {
        id: 'img-124',
        view_type: 'Front View',
        data_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
        file_name: 'ketchup_bottle.jpg'
      }
    ],
    product_context: {
      ...DEFAULT_POTATO_CHIPS_PRODUCT,
      product_name: 'Tomato Ketchup',
      brand: 'FreshBite',
      category: 'Food & Beverages',
      net_quantity: 500,
      net_quantity_unit: 'g',
      mrp: 120.0,
      manufacturer: 'FreshBite Foods Ltd.',
      consumer_care_details: 'care@freshbite.in | Toll-Free: 1800-200-1122'
    },
    rule_results: [],
    compliance_summary: {
      overall_status: 'COMPLIANT',
      rules_passed: 15,
      rules_failed: 0,
      needs_review: 0,
      not_applicable: 0,
      total_rules: 15,
      compliance_percentage: 100,
      applicable_standards: [
        { name: 'PCR-2011', reference: 'Rule 6 & Second Schedule', version: '2011' }
      ],
      evaluated_at: '2026-09-02T10:30:00Z'
    }
  },
  {
    id: 'insp-123',
    inspection_number: 'INS-2026-123',
    created_at: '2026-09-01T16:18:00Z',
    updated_at: '2026-09-01T16:25:00Z',
    inspector_name: 'Rohinth Kumaran',
    inspector_id: 'LM-10334',
    location: 'Gandhi Road Wholesale Hub, Vellore',
    workflow_status: 'COMPLETED',
    images: [
      {
        id: 'img-123',
        view_type: 'Front View',
        data_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
        file_name: 'oil_can.jpg'
      }
    ],
    product_context: {
      ...DEFAULT_POTATO_CHIPS_PRODUCT,
      product_name: 'Sunflower Oil',
      brand: 'GoldDrop',
      category: 'Edible Oils & Fats',
      net_quantity: 900, // Non-standard pack size under Second Schedule (permitted 500ml, 1L, etc.)
      net_quantity_unit: 'ml',
      mrp: 145.0,
      manufacturer: 'GoldDrop Agro Products Pvt. Ltd.',
      consumer_care_details: 'Not declared on principal panel'
    },
    rule_results: [],
    compliance_summary: {
      overall_status: 'NON-COMPLIANT',
      rules_passed: 12,
      rules_failed: 2,
      needs_review: 1,
      not_applicable: 0,
      total_rules: 15,
      compliance_percentage: 80,
      applicable_standards: [
        { name: 'PCR-2011', reference: 'Rule 5 & Second Schedule', version: '2011' }
      ],
      evaluated_at: '2026-09-01T16:25:00Z'
    }
  },
  {
    id: 'insp-122',
    inspection_number: 'INS-2026-122',
    created_at: '2026-09-01T11:05:00Z',
    updated_at: '2026-09-01T11:15:00Z',
    inspector_name: 'Rohinth Kumaran',
    inspector_id: 'LM-10334',
    location: 'Metro Supermarket, Coimbatore',
    workflow_status: 'COMPLETED',
    images: [
      {
        id: 'img-122',
        view_type: 'Front View',
        data_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
        file_name: 'noodles_pack.jpg'
      }
    ],
    product_context: {
      ...DEFAULT_POTATO_CHIPS_PRODUCT,
      product_name: 'Masala Noodles',
      brand: 'TastyUp',
      category: 'Food & Beverages',
      net_quantity: 70,
      net_quantity_unit: 'g',
      mrp: 14.0,
      manufacturer: 'TastyUp Foods Ltd.'
    },
    rule_results: [],
    compliance_summary: {
      overall_status: 'COMPLIANT',
      rules_passed: 14,
      rules_failed: 0,
      needs_review: 1,
      not_applicable: 0,
      total_rules: 15,
      compliance_percentage: 93,
      applicable_standards: [
        { name: 'PCR-2011', reference: 'Rule 6 Declarations', version: '2011' }
      ],
      evaluated_at: '2026-09-01T11:15:00Z'
    }
  },
  {
    id: 'insp-121',
    inspection_number: 'INS-2026-121',
    created_at: '2026-08-31T15:40:00Z',
    updated_at: '2026-08-31T15:50:00Z',
    inspector_name: 'Rohinth Kumaran',
    inspector_id: 'LM-10334',
    location: 'Grain Mandi, Madurai',
    workflow_status: 'COMPLETED',
    images: [
      {
        id: 'img-121',
        view_type: 'Front View',
        data_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
        file_name: 'rice_bag.jpg'
      }
    ],
    product_context: {
      ...DEFAULT_POTATO_CHIPS_PRODUCT,
      product_name: 'Basmati Rice',
      brand: "Nature's Best",
      category: 'Food & Beverages',
      net_quantity: 5,
      net_quantity_unit: 'kg',
      mrp: 490.0,
      manufacturer: "Nature's Best Grains Pvt. Ltd."
    },
    rule_results: [],
    compliance_summary: {
      overall_status: 'REVIEW_REQUIRED',
      rules_passed: 13,
      rules_failed: 0,
      needs_review: 2,
      not_applicable: 0,
      total_rules: 15,
      compliance_percentage: 86,
      applicable_standards: [
        { name: 'PCR-2011', reference: 'Rule 6 & First Schedule', version: '2011' }
      ],
      evaluated_at: '2026-08-31T15:50:00Z'
    }
  },
  {
    id: 'insp-120',
    inspection_number: 'INS-2026-120',
    created_at: '2026-08-31T11:12:00Z',
    updated_at: '2026-08-31T11:20:00Z',
    inspector_name: 'Rohinth Kumaran',
    inspector_id: 'LM-10334',
    location: 'Railway Station Retail Stalls, Trichy',
    workflow_status: 'COMPLETED',
    images: [
      {
        id: 'img-120',
        view_type: 'Front View',
        data_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
        file_name: 'biscuits_pack.jpg'
      }
    ],
    product_context: {
      ...DEFAULT_POTATO_CHIPS_PRODUCT,
      product_name: 'Butter Biscuits',
      brand: 'Good Day',
      category: 'Food & Beverages',
      net_quantity: 100,
      net_quantity_unit: 'g',
      mrp: 30.0,
      manufacturer: 'Britannia Industries Ltd.'
    },
    rule_results: [],
    compliance_summary: {
      overall_status: 'COMPLIANT',
      rules_passed: 15,
      rules_failed: 0,
      needs_review: 0,
      not_applicable: 0,
      total_rules: 15,
      compliance_percentage: 100,
      applicable_standards: [
        { name: 'PCR-2011', reference: 'Rule 5 & Second Schedule', version: '2011' }
      ],
      evaluated_at: '2026-08-31T11:20:00Z'
    }
  }
];
