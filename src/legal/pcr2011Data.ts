/**
 * Legal Metrology (Packaged Commodities) Rules, 2011 (PCR-2011)
 * Source of Truth: legal rule 2011 (1).pdf
 * Centralized deterministic data structures for legal rules and schedules.
 */

export interface MPESpecification {
  id: string;
  min_quantity: number; // inclusive
  max_quantity: number; // inclusive
  unit: string;
  error_value: number;
  error_type: 'absolute' | 'percentage';
  measurement_type: 'mass_or_volume' | 'length' | 'area' | 'number';
  rule_reference: string;
  schedule_reference: string;
  source_page: string;
}

export interface StandardQuantitySpec {
  commodity_name: string;
  category: string;
  permitted_quantities: {
    value: number;
    unit: string;
  }[];
  progression_rule?: string;
  schedule_reference: string;
  source_page: string;
}

// First Schedule - Table I: Maximum Permissible Error on Net Quantity for Mass or Volume
export const FIRST_SCHEDULE_MPE: MPESpecification[] = [
  {
    id: 'MPE-1',
    min_quantity: 0,
    max_quantity: 50,
    unit: 'g/ml',
    error_value: 9,
    error_type: 'percentage', // 9% of declared quantity as per First Schedule
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  },
  {
    id: 'MPE-2',
    min_quantity: 50.0001,
    max_quantity: 100,
    unit: 'g/ml',
    error_value: 4.5,
    error_type: 'absolute', // 4.5 g or ml
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  },
  {
    id: 'MPE-3',
    min_quantity: 100.0001,
    max_quantity: 200,
    unit: 'g/ml',
    error_value: 4.5,
    error_type: 'percentage', // 4.5%
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  },
  {
    id: 'MPE-4',
    min_quantity: 200.0001,
    max_quantity: 300,
    unit: 'g/ml',
    error_value: 9,
    error_type: 'absolute', // 9 g or ml
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  },
  {
    id: 'MPE-5',
    min_quantity: 300.0001,
    max_quantity: 500,
    unit: 'g/ml',
    error_value: 3,
    error_type: 'percentage', // 3%
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  },
  {
    id: 'MPE-6',
    min_quantity: 500.0001,
    max_quantity: 1000,
    unit: 'g/ml',
    error_value: 15,
    error_type: 'absolute', // 15 g or ml
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  },
  {
    id: 'MPE-7',
    min_quantity: 1000.0001,
    max_quantity: 10000,
    unit: 'g/ml',
    error_value: 1.5,
    error_type: 'percentage', // 1.5%
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  },
  {
    id: 'MPE-8',
    min_quantity: 10000.0001,
    max_quantity: 15000,
    unit: 'g/ml',
    error_value: 150,
    error_type: 'absolute', // 150 g or ml
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  },
  {
    id: 'MPE-9',
    min_quantity: 15000.0001,
    max_quantity: 50000,
    unit: 'g/ml',
    error_value: 1.0,
    error_type: 'percentage', // 1.0%
    measurement_type: 'mass_or_volume',
    rule_reference: 'Rule 22',
    schedule_reference: 'First Schedule Table I',
    source_page: 'Page 31'
  }
];

// First Schedule - Table II: Maximum Permissible Error for other measurements
export const FIRST_SCHEDULE_TABLE_II = [
  {
    type: 'length',
    condition: 'Up to 10 m',
    max_error_percentage: 2.0,
    source_page: 'Page 32'
  },
  {
    type: 'length',
    condition: 'Above 10 m',
    max_error_percentage: 1.0,
    source_page: 'Page 32'
  },
  {
    type: 'area',
    condition: 'Up to 10 sq m',
    max_error_percentage: 4.0,
    source_page: 'Page 32'
  },
  {
    type: 'area',
    condition: 'Above 10 sq m',
    max_error_percentage: 1.0,
    source_page: 'Page 32'
  },
  {
    type: 'number',
    condition: 'All quantities',
    max_error_percentage: 2.0,
    source_page: 'Page 32'
  }
];

// Second Schedule - Specified Standard Packages
export const SECOND_SCHEDULE_COMMODITIES: StandardQuantitySpec[] = [
  {
    commodity_name: 'Biscuits',
    category: 'Bakery',
    permitted_quantities: [
      { value: 25, unit: 'g' },
      { value: 50, unit: 'g' },
      { value: 75, unit: 'g' },
      { value: 100, unit: 'g' },
      { value: 150, unit: 'g' },
      { value: 200, unit: 'g' },
      { value: 250, unit: 'g' },
      { value: 300, unit: 'g' },
      { value: 400, unit: 'g' },
      { value: 500, unit: 'g' },
      { value: 1000, unit: 'g' }
    ],
    schedule_reference: 'Second Schedule item 3',
    source_page: 'Page 33'
  },
  {
    commodity_name: 'Potato Chips / Snack Foods',
    category: 'Packaged Snacks',
    permitted_quantities: [
      { value: 25, unit: 'g' },
      { value: 50, unit: 'g' },
      { value: 75, unit: 'g' },
      { value: 100, unit: 'g' },
      { value: 150, unit: 'g' },
      { value: 200, unit: 'g' },
      { value: 250, unit: 'g' },
      { value: 500, unit: 'g' },
      { value: 1000, unit: 'g' }
    ],
    schedule_reference: 'Second Schedule item 4',
    source_page: 'Page 33'
  },
  {
    commodity_name: 'Edible Oils, Vanaspati, Ghee, Butter Oil',
    category: 'Edible Oils & Fats',
    permitted_quantities: [
      { value: 50, unit: 'g' },
      { value: 100, unit: 'g' },
      { value: 200, unit: 'g' },
      { value: 500, unit: 'g' },
      { value: 1000, unit: 'g' },
      { value: 2000, unit: 'g' },
      { value: 3000, unit: 'g' },
      { value: 5000, unit: 'g' },
      { value: 15000, unit: 'g' },
      { value: 50, unit: 'ml' },
      { value: 100, unit: 'ml' },
      { value: 200, unit: 'ml' },
      { value: 500, unit: 'ml' },
      { value: 1000, unit: 'ml' },
      { value: 2000, unit: 'ml' },
      { value: 5000, unit: 'ml' },
      { value: 15000, unit: 'ml' }
    ],
    schedule_reference: 'Second Schedule item 6',
    source_page: 'Page 34'
  },
  {
    commodity_name: 'Tea / Coffee',
    category: 'Beverage Materials',
    permitted_quantities: [
      { value: 25, unit: 'g' },
      { value: 50, unit: 'g' },
      { value: 100, unit: 'g' },
      { value: 250, unit: 'g' },
      { value: 500, unit: 'g' },
      { value: 1000, unit: 'g' }
    ],
    schedule_reference: 'Second Schedule item 5',
    source_page: 'Page 34'
  },
  {
    commodity_name: 'Soaps (Toilet & Laundry)',
    category: 'Personal Care & Cleaning',
    permitted_quantities: [
      { value: 25, unit: 'g' },
      { value: 50, unit: 'g' },
      { value: 75, unit: 'g' },
      { value: 100, unit: 'g' },
      { value: 125, unit: 'g' },
      { value: 150, unit: 'g' }
    ],
    schedule_reference: 'Second Schedule item 10',
    source_page: 'Page 35'
  },
  {
    commodity_name: 'Aerated Soft Drinks / Mineral Water',
    category: 'Beverages',
    permitted_quantities: [
      { value: 100, unit: 'ml' },
      { value: 150, unit: 'ml' },
      { value: 200, unit: 'ml' },
      { value: 250, unit: 'ml' },
      { value: 300, unit: 'ml' },
      { value: 330, unit: 'ml' },
      { value: 500, unit: 'ml' },
      { value: 600, unit: 'ml' },
      { value: 750, unit: 'ml' },
      { value: 1000, unit: 'ml' },
      { value: 1500, unit: 'ml' },
      { value: 2000, unit: 'ml' },
      { value: 5000, unit: 'ml' }
    ],
    schedule_reference: 'Second Schedule item 12',
    source_page: 'Page 36'
  }
];

// Third Schedule - Commodities permitted to declare "When Packed"
export const THIRD_SCHEDULE_WHEN_PACKED = [
  'Laundry soap',
  'Non-soapy detergents',
  'Toilet soaps',
  'Bars and cakes of soap',
  'Lotions and creams other than cream of milk',
  'Camphor'
];

// Fourth Schedule - Declaration Units by Commodity
export const FOURTH_SCHEDULE_UNITS = [
  { commodity_category: 'Solid commodities', unit_type: 'weight', permitted_units: ['mg', 'g', 'kg'] },
  { commodity_category: 'Liquid articles', unit_type: 'volume', permitted_units: ['ml', 'l', 'L'] },
  { commodity_category: 'Semi-solid or viscous articles', unit_type: 'weight_or_volume', permitted_units: ['g', 'kg', 'ml', 'l', 'L'] },
  { commodity_category: 'Articles sold by length', unit_type: 'length', permitted_units: ['cm', 'm'] },
  { commodity_category: 'Articles sold by area', unit_type: 'area', permitted_units: ['sq cm', 'sq m'] },
  { commodity_category: 'Articles sold by number', unit_type: 'number', permitted_units: ['number', 'units', 'pieces', 'N'] }
];

// Fifth Schedule - Sample Sizes for Inspection
export const FIFTH_SCHEDULE_SAMPLING = {
  small_lot: {
    max_lot_size: 4000,
    prescribed_sample_size: 32,
    source_page: 'Page 40'
  },
  large_lot: {
    min_lot_size: 4001,
    prescribed_sample_size: 80,
    source_page: 'Page 40'
  }
};

// Full Legal Rules Reference Definitions (Rules 1 to 34)
export const PCR_2011_RULES = [
  {
    rule_id: 'LM-PC-R1',
    rule_number: 1,
    title: 'Short title, extent and commencement',
    summary: 'Legal Metrology (Packaged Commodities) Rules, 2011 came into force on the 1st day of March, 2011, extending to the whole of India.',
    chapter: 'Chapter I - Preliminary',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 1',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R2',
    rule_number: 2,
    title: 'Definitions',
    summary: 'Definitions for retail package, wholesale package, pre-packaged commodity, dealer, manufacturer, importer, packer, net quantity, principal display panel, etc.',
    chapter: 'Chapter I - Preliminary',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 1-4',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R3',
    rule_number: 3,
    title: 'Application of Chapter II (Provisions applicable to packages for retail sale)',
    summary: 'The provisions of Chapter II apply to packages intended for retail sale. Packages exceeding 25 kg or 25 litre (except cement and fertilizer up to 50 kg) and packages meant for industrial or institutional consumers are exempt.',
    chapter: 'Chapter II - Provisions Applicable to Packages Intended for Retail Sale',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 4',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R4',
    rule_number: 4,
    title: 'Regulation for pre-packing and sale of commodities in packaged form',
    summary: 'No person shall pre-pack or cause or permit to be pre-packed any commodity for sale, distribution or delivery unless the package bears thereon such declarations as required.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 4',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R5',
    rule_number: 5,
    title: 'Specific commodities to be packed in standard packages',
    summary: 'Commodities specified in the Second Schedule shall be packed in standard quantities specified therein.',
    chapter: 'Chapter II - Retail Sale Packages',
    schedules: ['Second Schedule'],
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 5',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R6',
    rule_number: 6,
    title: 'Declarations to be made on every package',
    summary: 'Mandatory declarations on retail package: Name & address of manufacturer/packer/importer, generic name of commodity, net quantity, month/year of manufacture or packing, retail sale price (MRP), dimensions where applicable, consumer care contact details.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 5-8',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R7',
    rule_number: 7,
    title: 'Principal display panel: its area, size and letter height',
    summary: 'Area of principal display panel on package, minimum height of numerals and letters based on panel area and net quantity.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 8-10',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R8',
    rule_number: 8,
    title: 'Declaration where to appear',
    summary: 'Every declaration specified in Rule 6 shall appear on the principal display panel and in prominent position as prescribed.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 10',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R9',
    rule_number: 9,
    title: 'Manner in which declaration shall be made',
    summary: 'Declarations shall be legible, prominent, definite, plain, conspicuous, and in contrasting color with the background.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 10-12',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R10',
    rule_number: 10,
    title: 'Declaration of name and address of manufacturer, packer, or importer',
    summary: 'Full postal address including street, city, pin code. For imported goods, name of manufacturer and country of origin with importer details.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 12',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R11',
    rule_number: 11,
    title: 'General provisions relating to declaration of quantity',
    summary: 'Declaration of net quantity shall be in terms of standard units of weight, measure or number.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 12-14',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R12',
    rule_number: 12,
    title: 'Manner in which units of quantity shall be expressed',
    summary: 'Mass in g/kg, liquid volume in ml/L, length in cm/m, area in sq cm/sq m, numbers in numeral form.',
    chapter: 'Chapter II - Retail Sale Packages',
    schedules: ['Fourth Schedule'],
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 14-16',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R13',
    rule_number: 13,
    title: 'Symbols for units',
    summary: 'Approved symbols: g for gram, kg for kilogram, ml or mL for millilitre, l or L for litre, m for metre, cm for centimetre.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 16-17',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R14',
    rule_number: 14,
    title: 'Declarations with regard to dimensions and weight of certain commodities',
    summary: 'Dimensions to be declared where size/area is relevant to the commodity price or consumer choice.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 17',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R15',
    rule_number: 15,
    title: 'Declaration with regard to dimensions and weight to be on a package containing certain commodities',
    summary: 'Declaration of both length and width/diameter for commodities such as bedsheets, tarpaulins, etc.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 17-18',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R16',
    rule_number: 16,
    title: 'Declaration to be made with regard to the number of usable sheets',
    summary: 'Usable sheets count and individual sheet dimensions for products like paper napkins, toilet rolls, aluminum foil.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 18',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R17',
    rule_number: 17,
    title: 'Declarations with regard to the dimensions of container type commodities',
    summary: 'Dimensions and capacity declarations on empty containers sold as packaged commodities.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 18',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R18',
    rule_number: 18,
    title: 'Provisions relating to wholesale dealer and retail dealer',
    summary: 'Retail dealer shall not alter, efface or obscure any declaration on package; wholesale dealer shall not sell packages at a price higher than the retail sale price.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 18-19',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R19',
    rule_number: 19,
    title: 'Inspection of packages at the premises of manufacturer or packer',
    summary: 'Authorised legal metrology officers may inspect packages at manufacturer/packer premises to verify net contents and declarations.',
    chapter: 'Chapter II - Retail Sale Packages',
    schedules: ['Fifth Schedule', 'Sixth Schedule', 'Seventh Schedule'],
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 19-21',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R20',
    rule_number: 20,
    title: 'Action to be taken on packages with deficient quantity at retail dealer premises',
    summary: 'Procedure for seizing and action when packages at retail premises show deficient net quantity.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 21',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R21',
    rule_number: 21,
    title: 'Inspection of packages at the premises of wholesale dealer',
    summary: 'Inspection protocol and sampling for wholesale dealer premises.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 21-22',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R22',
    rule_number: 22,
    title: 'Establishment of maximum permissible error',
    summary: 'Maximum permissible error on net quantity shall be as specified in the First Schedule. Quantity error must not exceed the specified tolerance.',
    chapter: 'Chapter II - Retail Sale Packages',
    schedules: ['First Schedule'],
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 22',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R23',
    rule_number: 23,
    title: 'Deceptive packages',
    summary: 'A package which is so designed or filled as to mislead the consumer as to its actual contents is deemed deceptive and prohibited.',
    chapter: 'Chapter II - Retail Sale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 22',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R24',
    rule_number: 24,
    title: 'Declarations to be made on every wholesale package',
    summary: 'Declarations on wholesale packages: Name and address of manufacturer/packer, generic commodity name, total number of retail packages or net quantity.',
    chapter: 'Chapter III - Wholesale Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 22-23',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R25',
    rule_number: 25,
    title: 'Provisions of Chapter II not to apply to packages intended for export',
    summary: 'Packages packed and intended solely for export outside India are exempt from the declarations prescribed under Chapter II.',
    chapter: 'Chapter IV - Export Packages',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 24',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R26',
    rule_number: 26,
    title: 'Exemptions in respect of certain packages',
    summary: 'Exemptions: (a) Packages containing commodities with net weight or measure <= 10 g or 10 ml (or <= 20 g for tobacco products); (b) Packages containing fast food items packed by restaurants/hotels; (c) Agricultural produce in bags > 50 kg; (d) Packages meant for industrial or institutional consumers.',
    chapter: 'Chapter V - Exemptions',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 24',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R27',
    rule_number: 27,
    title: 'Registration of manufacturers, packers and importers',
    summary: 'Every manufacturer, packer and importer who pre-packs commodities shall make an application to the Director or Controller for registration within 90 days.',
    chapter: 'Chapter VI - Registration',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Pages 24-26',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R28',
    rule_number: 28,
    title: 'Shorter address to be permitted in certain cases',
    summary: 'Where a company has registered office and branches, shorter address may be permitted if complete address is available in registered documents.',
    chapter: 'Chapter VI - Registration',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 26',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R29',
    rule_number: 29,
    title: 'Register of manufacturers, packers and importers',
    summary: 'Maintenance of central register of registered pre-packers and importers by the Director or Controller.',
    chapter: 'Chapter VI - Registration',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 26',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R30',
    rule_number: 30,
    title: 'Compilation of lists of manufacturers and packers',
    summary: 'Periodic compilation and publication of registered pre-packers for enforcement coordination.',
    chapter: 'Chapter VI - Registration',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 26',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R31',
    rule_number: 31,
    title: 'Provisions relating to advertisements',
    summary: 'Where an advertisement for pre-packaged commodity states retail price, it must also state net quantity.',
    chapter: 'Chapter VII - Miscellaneous',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 27',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R32',
    rule_number: 32,
    title: 'Penalty for contravention of Rules',
    summary: 'Whoever contravenes any provision of these rules for which no punishment is provided elsewhere in the Act shall be punished with fine.',
    chapter: 'Chapter VII - Miscellaneous',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 27',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R33',
    rule_number: 33,
    title: 'Power to relax',
    summary: 'Central Government power to relax provisions of these rules in special circumstances.',
    chapter: 'Chapter VII - Miscellaneous',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 27',
    legal_version: 'PCR-2011'
  },
  {
    rule_id: 'LM-PC-R34',
    rule_number: 34,
    title: 'Repeal and savings',
    summary: 'Standards of Weights and Measures (Packaged Commodities) Rules, 1977 repealed with savings clause.',
    chapter: 'Chapter VII - Miscellaneous',
    source_document: 'legal rule 2011 (1).pdf',
    source_page: 'Page 28',
    legal_version: 'PCR-2011'
  }
];
