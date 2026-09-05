import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { evaluateCompliance } from './src/legal/ruleEngine';
import { PCR_2011_RULES, FIRST_SCHEDULE_MPE, SECOND_SCHEDULE_COMMODITIES } from './src/legal/pcr2011Data';
import { ProductContext, InspectionRecord } from './src/types';
import { DEFAULT_POTATO_CHIPS_PRODUCT } from './src/data/seedInspections';
import {
  initDatabase,
  authenticateUser,
  getUserByToken,
  deleteSession,
  updateUserProfile,
  getProductsFromDb,
  createProductInDb,
  deleteProductFromDb,
  saveInspectionToDb,
  getAllInspectionsFromDb,
  getInspectionByIdFromDb,
  deleteInspectionFromDb,
  getViolationsFromDb,
  getAlertsFromDb,
  markAlertAsReadInDb,
  createAlertInDb,
  getReportsFromDb,
  getReportByIdFromDb,
  getAuditLogsFromDb,
  getRealAnalytics,
  getUsersFromDb,
  logAudit
} from './server/db';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize SQLite database and tables
initDatabase();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth extraction middleware
function extractToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const queryToken = req.query.token as string;
  return queryToken || null;
}

// Lazy Gemini client initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!aiClient && apiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

// ----------------------------------------------------------------
// 1. AUTHENTICATION & SESSION ENDPOINTS
// ----------------------------------------------------------------

// Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: 'Identifier and password are required' });
  }

  const result = authenticateUser(identifier, password);
  if (!result) {
    return res.status(401).json({ success: false, error: 'Invalid credentials. Please verify your email/employee ID and password.' });
  }

  res.json({ success: true, user: result.user, token: result.token });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = extractToken(req);
  if (token) {
    deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Current User Profile
app.get('/api/auth/me', (req, res) => {
  const token = extractToken(req);
  if (!token) {
    // Default to seeded inspector if no token provided in prototype/dev mode
    const defaultUser = getUserByToken('tok_seed') || {
      name: 'Rohinth Kumaran',
      employee_id: 'LM-10334',
      role: 'Legal Metrology Inspector (Grade I)',
      department: 'Department of Consumer Affairs',
      zone: 'Kumbakonam & Thanjavur District, Tamil Nadu',
      email: 'rohinth.k@lm.gov.in',
      phone: '+91 98401 23456'
    };
    return res.json({ success: true, user: defaultUser });
  }

  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }

  res.json({ success: true, user });
});

// List authorized inspectors/users
app.get('/api/auth/users', (req, res) => {
  const users = getUsersFromDb();
  res.json({ success: true, count: users.length, users });
});

// Update Profile
app.put('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  let targetEmpId = req.body.employee_id;

  if (!targetEmpId && token) {
    const user = getUserByToken(token);
    if (user) {
      targetEmpId = user.employee_id;
    }
  }

  if (!targetEmpId) {
    targetEmpId = 'LM-10334';
  }

  const { employee_id, ...updates } = req.body;
  const updated = updateUserProfile(targetEmpId, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({ success: true, user: updated });
});

// ----------------------------------------------------------------
// 2. PRODUCTS ENDPOINTS
// ----------------------------------------------------------------

// List products
app.get('/api/products', (req, res) => {
  const q = req.query.q as string | undefined;
  const category = req.query.category as string | undefined;
  const products = getProductsFromDb(q, category);
  res.json({ success: true, count: products.length, products });
});

// Create product
app.post('/api/products', (req, res) => {
  const productData = req.body;
  if (!productData || !productData.product_name) {
    return res.status(400).json({ success: false, error: 'Product name is required' });
  }

  const created = createProductInDb(productData);
  res.status(201).json({ success: true, product: created });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  deleteProductFromDb(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

// ----------------------------------------------------------------
// 3. INSPECTIONS ENDPOINTS
// ----------------------------------------------------------------

// List inspections with search and status filtering
app.get('/api/inspections', (req, res) => {
  const search = req.query.q as string | undefined;
  const status = req.query.status as string | undefined;
  const inspections = getAllInspectionsFromDb(search, status);
  res.json({ success: true, count: inspections.length, inspections });
});

// Get single inspection
app.get('/api/inspections/:id', (req, res) => {
  const inspection = getInspectionByIdFromDb(req.params.id);
  if (!inspection) {
    return res.status(404).json({ success: false, error: 'Inspection not found' });
  }
  res.json({ success: true, inspection });
});

// Create and evaluate inspection
app.post('/api/inspections', (req, res) => {
  try {
    const { inspector_name, inspector_id, location, images, product_context } = req.body;

    if (!product_context || !product_context.product_name) {
      return res.status(400).json({ success: false, error: 'product_context with product_name is required' });
    }

    const newId = `insp-${Date.now()}`;
    let inspectionNumber = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const existing = getAllInspectionsFromDb(candidate);
      const collides = existing.some((i: any) => i.inspection_number === candidate);
      if (!collides) {
        inspectionNumber = candidate;
        break;
      }
    }
    if (!inspectionNumber) {
      inspectionNumber = `INS-2026-${Date.now().toString().slice(-6)}`;
    }

    const canonicalProduct: ProductContext = {
      ...product_context,
      evidence: product_context.evidence || {},
      corrections: product_context.corrections || []
    };

    // Run deterministic legal rule engine
    const { results, summary } = evaluateCompliance(canonicalProduct, {
      inspection_id: inspectionNumber,
      inspector_name: inspector_name || 'Rohinth Kumaran'
    });

    const record: InspectionRecord = {
      id: newId,
      inspection_number: inspectionNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inspector_name: inspector_name || 'Rohinth Kumaran',
      inspector_id: inspector_id || 'LM-10334',
      location: location || 'Inspector Hub, Chennai',
      workflow_status: 'COMPLETED',
      images: images || [],
      product_context: canonicalProduct,
      rule_results: results,
      compliance_summary: summary
    };

    // Persist to SQLite
    saveInspectionToDb(record);

    res.status(201).json({ success: true, inspection: record });
  } catch (err: any) {
    console.error('Error creating inspection:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create inspection' });
  }
});

// Update Canonical Facts & Re-evaluate
app.patch('/api/inspections/:id/facts', (req, res) => {
  try {
    const inspection = getInspectionByIdFromDb(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const { corrections, updated_facts } = req.body;
    if (corrections && Array.isArray(corrections)) {
      inspection.product_context.corrections.push(...corrections);
    }

    if (updated_facts) {
      inspection.product_context = {
        ...inspection.product_context,
        ...updated_facts
      };
    }

    // Re-run deterministic rule engine
    const { results, summary } = evaluateCompliance(inspection.product_context, {
      inspection_id: inspection.inspection_number,
      inspector_name: inspection.inspector_name
    });

    inspection.rule_results = results;
    inspection.compliance_summary = summary;
    inspection.updated_at = new Date().toISOString();

    // Persist changes
    saveInspectionToDb(inspection);

    res.json({ success: true, inspection });
  } catch (err: any) {
    console.error('Error updating facts:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to update facts' });
  }
});

// Delete inspection
app.delete('/api/inspections/:id', (req, res) => {
  deleteInspectionFromDb(req.params.id);
  res.json({ success: true, message: 'Inspection deleted' });
});

// ----------------------------------------------------------------
// 4. AI PACKAGE MULTIMODAL VISION OCR
// ----------------------------------------------------------------

app.post('/api/analyze-package', async (req, res) => {
  try {
    const { images, hints } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image uploaded. Please upload at least one clear package image (front or back panel).'
      });
    }

    const ai = getGeminiClient();

    // Prepare image payload for Gemini
    const validImageParts: any[] = [];
    for (const img of images.slice(0, 4)) {
      let base64Data = img.data_url || '';
      let mimeType = 'image/jpeg';
      if (base64Data.startsWith('data:')) {
        const match = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }

      if (base64Data && base64Data.length > 50) {
        validImageParts.push({
          inlineData: {
            data: base64Data,
            mimeType
          }
        });
      }
    }

    if (validImageParts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Uploaded images could not be read or are empty.'
      });
    }

    const promptText = `You are an expert Legal Metrology Vision and OCR Analyst for India's Legal Metrology (Packaged Commodities) Rules, 2011 (PCR-2011).
Inspect the package panel images and extract all mandatory statutory declarations with high fidelity.
Extract the following fields accurately:
1. product_name: Generic / common name of the commodity (e.g. Potato Chips, Whole Wheat Atta, Edible Sunflower Oil, Toothpaste)
2. brand: Brand name (e.g. Lay's, Aashirvaad, Fortune, Colgate)
3. category: Category (Food & Beverages, Personal Care, Household, Electronics, Pharmaceuticals, etc.)
4. net_quantity: Numeric net quantity value only (e.g. 50, 500, 1000, 1)
5. net_quantity_unit: Standard legal metric unit (g, kg, ml, l, m, number)
6. mrp: Retail sale price number in INR without currency symbols (e.g. 20, 50.00, 149.00)
7. manufacturer: Full name and address of manufacturer / packer / importer
8. country_of_origin: Country of origin (e.g. India)
9. batch_number: Batch / lot number (or "Not visible" if absent)
10. manufacturing_date: Month and year or date of manufacture / packing / import
11. best_before: Expiry date or Best Before declaration (or "Not visible" if absent)
12. consumer_care_details: Name, address, phone number, and email of person who can be contacted for consumer complaints under Rule 6(1)(n)
13. raw_ocr_text: Full transcribed text from all detected package panels
14. overall_confidence: Estimated extraction confidence between 0.0 and 1.0

Return strictly valid JSON adhering to the schema.`;

    let extracted: any = null;
    let aiError: string | null = null;

    if (!ai) {
      aiError = 'GEMINI_API_KEY is not configured on the server.';
    } else {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: {
            parts: [...validImageParts, { text: promptText }]
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                product_name: { type: Type.STRING },
                brand: { type: Type.STRING },
                category: { type: Type.STRING },
                net_quantity: { type: Type.NUMBER },
                net_quantity_unit: { type: Type.STRING },
                mrp: { type: Type.NUMBER },
                manufacturer: { type: Type.STRING },
                country_of_origin: { type: Type.STRING },
                batch_number: { type: Type.STRING },
                manufacturing_date: { type: Type.STRING },
                best_before: { type: Type.STRING },
                consumer_care_details: { type: Type.STRING },
                raw_ocr_text: { type: Type.STRING },
                overall_confidence: { type: Type.NUMBER }
              },
              required: ['product_name', 'net_quantity', 'net_quantity_unit', 'mrp']
            }
          }
        });

        if (response.text) {
          extracted = JSON.parse(response.text);
        }
      } catch (geminiError: any) {
        console.warn('Gemini vision API error during analysis:', geminiError.message);
        aiError = geminiError.message || 'Gemini vision API request failed.';
      }
    }

    // No hardcoded fallback: if AI extraction failed, report it to the caller instead of
    // silently returning fabricated product data.
    if (!extracted) {
      return res.status(502).json({
        success: false,
        ai_used: false,
        error: aiError || 'AI extraction failed and no data was returned.'
      });
    }

    // Structure canonical ProductContext with evidence
    const productContext: ProductContext = {
      ...DEFAULT_POTATO_CHIPS_PRODUCT,
      product_name: extracted.product_name,
      brand: extracted.brand || 'Unspecified',
      category: extracted.category || 'General Commodity',
      package_type: 'retail',
      market_type: 'general_consumer',
      consumer_type: 'retail',
      quantity_type: extracted.net_quantity_unit === 'ml' || extracted.net_quantity_unit === 'l' ? 'volume' : 'weight',
      net_quantity: extracted.net_quantity,
      net_quantity_unit: extracted.net_quantity_unit,
      mrp: extracted.mrp,
      manufacturer: extracted.manufacturer,
      manufacturer_address: extracted.manufacturer,
      country_of_origin: extracted.country_of_origin || 'India',
      manufacturing_date: extracted.manufacturing_date,
      best_before: extracted.best_before,
      batch_number: extracted.batch_number,
      consumer_care_details: extracted.consumer_care_details,
      raw_ocr_text: extracted.raw_ocr_text,
      evidence: {
        product_name: {
          field: 'product_name',
          value: extracted.product_name,
          confidence: extracted.overall_confidence || 0.95,
          source_text: extracted.product_name,
          extraction_method: 'multimodal_vision'
        },
        net_quantity: {
          field: 'net_quantity',
          value: extracted.net_quantity,
          unit: extracted.net_quantity_unit,
          confidence: 0.94,
          source_text: `${extracted.net_quantity} ${extracted.net_quantity_unit}`,
          extraction_method: 'multimodal_vision'
        },
        mrp: {
          field: 'mrp',
          value: extracted.mrp,
          unit: 'INR',
          confidence: 0.96,
          source_text: `MRP ₹${extracted.mrp}`,
          extraction_method: 'multimodal_vision'
        },
        manufacturer: {
          field: 'manufacturer',
          value: extracted.manufacturer,
          confidence: 0.92,
          source_text: extracted.manufacturer,
          extraction_method: 'multimodal_vision'
        },
        country_of_origin: {
          field: 'country_of_origin',
          value: extracted.country_of_origin,
          confidence: 0.95,
          source_text: `Country of Origin: ${extracted.country_of_origin}`,
          extraction_method: 'multimodal_vision'
        },
        batch_number: {
          field: 'batch_number',
          value: extracted.batch_number,
          confidence: 0.91,
          source_text: `Batch: ${extracted.batch_number}`,
          extraction_method: 'multimodal_vision'
        },
        manufacturing_date: {
          field: 'manufacturing_date',
          value: extracted.manufacturing_date,
          confidence: 0.93,
          source_text: `Pkg Date: ${extracted.manufacturing_date}`,
          extraction_method: 'multimodal_vision'
        },
        best_before: {
          field: 'best_before',
          value: extracted.best_before,
          confidence: 0.9,
          source_text: extracted.best_before,
          extraction_method: 'multimodal_vision'
        },
        consumer_care_details: {
          field: 'consumer_care_details',
          value: extracted.consumer_care_details,
          confidence: 0.88,
          source_text: extracted.consumer_care_details,
          extraction_method: 'multimodal_vision'
        }
      },
      corrections: []
    };

    res.json({
      success: true,
      ai_used: !aiError,
      ai_error: aiError,
      product_context: productContext,
      extracted_raw: extracted
    });
  } catch (err: any) {
    console.error('Package analysis error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error processing package image' });
  }
});

// Deterministic Compliance Evaluation Only (preview/re-evaluate)
app.post('/api/inspections/evaluate', (req, res) => {
  const { product_context, inspection_id } = req.body;
  if (!product_context) {
    return res.status(400).json({ success: false, error: 'product_context is required' });
  }

  const { results, summary } = evaluateCompliance(product_context, {
    inspection_id: inspection_id || 'INS-ACTIVE'
  });

  res.json({
    success: true,
    results,
    summary
  });
});

// ----------------------------------------------------------------
// 5. VIOLATIONS, REPORTS, ALERTS & AUDIT
// ----------------------------------------------------------------

// Violations list
app.get('/api/violations', (req, res) => {
  const violations = getViolationsFromDb();
  res.json({ success: true, count: violations.length, violations });
});

// Reports list
app.get('/api/reports', (req, res) => {
  const reports = getReportsFromDb();
  res.json({ success: true, count: reports.length, reports });
});

// Single report
app.get('/api/reports/:id', (req, res) => {
  const report = getReportByIdFromDb(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }
  res.json({ success: true, report });
});

// Single report via inspection alias
app.get('/api/inspections/:id/report', (req, res) => {
  const report = getReportByIdFromDb(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }
  res.json({ success: true, report });
});

// Alerts list
app.get('/api/alerts', (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const alerts = getAlertsFromDb(unreadOnly);
  res.json({ success: true, count: alerts.length, alerts });
});

// Mark alert read
app.patch('/api/alerts/:id/read', (req, res) => {
  markAlertAsReadInDb(req.params.id);
  res.json({ success: true, message: 'Alert marked as read' });
});

// Create alert
app.post('/api/alerts', (req, res) => {
  const { title, description, alert_type } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Title and description are required' });
  }
  createAlertInDb(title, description, alert_type || 'warning');
  res.status(201).json({ success: true, message: 'Alert created' });
});

// Audit Logs list
app.get('/api/audit-logs', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const logs = getAuditLogsFromDb(limit);
  res.json({ success: true, count: logs.length, logs });
});

// ----------------------------------------------------------------
// 6. REAL ANALYTICS & DASHBOARD METRICS
// ----------------------------------------------------------------

app.get('/api/analytics', (req, res) => {
  try {
    const analytics = getRealAnalytics();
    res.json({ success: true, ...analytics });
  } catch (err: any) {
    console.error('Analytics aggregation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to aggregate analytics' });
  }
});

// ----------------------------------------------------------------
// 7. KNOWLEDGE BASE STATUTORY SEARCH
// ----------------------------------------------------------------

app.get('/api/knowledge', (req, res) => {
  const q = ((req.query.q as string) || '').toLowerCase();
  const rules = PCR_2011_RULES.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.rule_id.toLowerCase().includes(q)
  );

  res.json({
    success: true,
    rules,
    first_schedule_mpe: FIRST_SCHEDULE_MPE,
    second_schedule_commodities: SECOND_SCHEDULE_COMMODITIES
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LegalMet AI Server',
    database: 'SQLite (WAL mode)',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------------------
// VITE & STATIC SERVING
// ----------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LegalMet AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();