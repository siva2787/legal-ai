import { DatabaseSync, StatementSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { SEED_INSPECTIONS } from '../src/data/seedInspections';
import { PCR_2011_RULES } from '../src/legal/pcr2011Data';
import { InspectionRecord, ProductContext, UserProfile } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DATABASE_URL || path.join(DATA_DIR, 'legalmet.sqlite');
const rawDb = new DatabaseSync(DB_PATH);

rawDb.exec('PRAGMA journal_mode = WAL');
rawDb.exec('PRAGMA foreign_keys = ON');

// Thin wrapper so the rest of this file (written against the better-sqlite3 API)
// works unchanged against node:sqlite's built-in DatabaseSync (no native compile needed).
export const db = {
  prepare(sql: string): StatementSync {
    return rawDb.prepare(sql);
  },
  exec(sql: string): void {
    rawDb.exec(sql);
  },
  transaction<TArgs extends any[]>(fn: (...args: TArgs) => void) {
    return (...args: TArgs) => {
      rawDb.exec('BEGIN');
      try {
        fn(...args);
        rawDb.exec('COMMIT');
      } catch (err) {
        rawDb.exec('ROLLBACK');
        throw err;
      }
    };
  }
};

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      zone TEXT NOT NULL,
      phone TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      manufacturer TEXT NOT NULL,
      country_of_origin TEXT DEFAULT 'India',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
      brand_name TEXT NOT NULL,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      declared_net_quantity REAL,
      net_quantity_unit TEXT,
      quantity_type TEXT,
      mrp REAL,
      manufacturer TEXT,
      manufacturer_address TEXT,
      consumer_care_details TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY,
      inspection_number TEXT UNIQUE NOT NULL,
      inspector_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      inspector_name TEXT NOT NULL,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      workflow_status TEXT NOT NULL,
      product_context_json TEXT NOT NULL,
      images_json TEXT NOT NULL,
      overall_status TEXT NOT NULL,
      compliance_percentage REAL NOT NULL,
      rules_passed INTEGER NOT NULL,
      rules_failed INTEGER NOT NULL,
      needs_review INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      rule_code TEXT NOT NULL,
      rule_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      chapter TEXT NOT NULL,
      summary TEXT NOT NULL,
      source_document TEXT NOT NULL,
      source_page TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inspection_results (
      id TEXT PRIMARY KEY,
      inspection_id TEXT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
      rule_id TEXT NOT NULL,
      rule_code TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      severity TEXT NOT NULL,
      confidence REAL NOT NULL,
      requirement TEXT NOT NULL,
      detected_value TEXT NOT NULL,
      explanation TEXT NOT NULL,
      findings TEXT,
      evidence_used TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS violations (
      id TEXT PRIMARY KEY,
      inspection_id TEXT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
      rule_id TEXT NOT NULL,
      rule_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      violation_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      legal_citation TEXT NOT NULL,
      details TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      report_number TEXT UNIQUE NOT NULL,
      inspection_id TEXT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
      inspection_number TEXT NOT NULL,
      inspector_name TEXT NOT NULL,
      inspector_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      overall_status TEXT NOT NULL,
      compliance_score REAL NOT NULL,
      verification_hash TEXT NOT NULL,
      dossier_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      inspection_id TEXT REFERENCES inspections(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details_json TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default inspector user and team officers if not exists
  const defaultPasswordHash = crypto.createHash('sha256').update('Inspector@2026').digest('hex');
  const officers = [
    {
      id: 'usr-10334',
      employee_id: 'LM-10334',
      name: 'Rohinth Kumaran',
      email: 'rohinth.k@lm.gov.in',
      role: 'Legal Metrology Inspector (Grade I)',
      department: 'Department of Consumer Affairs',
      zone: 'Kumbakonam & Thanjavur District, Tamil Nadu',
      phone: '+91 98401 23456'
    },
    {
      id: 'usr-10335',
      employee_id: 'LM-10335',
      name: 'Vishwa T.',
      email: 'vishwa.t@lm.gov.in',
      role: 'Senior Metrological Officer',
      department: 'Department of Consumer Affairs',
      zone: 'Chennai Central Zone',
      phone: '+91 98401 23457'
    },
    {
      id: 'usr-10336',
      employee_id: 'LM-10336',
      name: 'Siva Anand',
      email: 'siva.a@lm.gov.in',
      role: 'Deputy Controller of Legal Metrology',
      department: 'Department of Consumer Affairs',
      zone: 'Tamil Nadu State Headquarters',
      phone: '+91 98401 23458'
    },
    {
      id: 'usr-10337',
      employee_id: 'LM-10337',
      name: 'K. Meenakshi',
      email: 'meenakshi.k@lm.gov.in',
      role: 'Laboratory Verification Specialist',
      department: 'Department of Consumer Affairs',
      zone: 'Standards & Calibration Lab, Trichy',
      phone: '+91 98401 23459'
    }
  ];

  for (const officer of officers) {
    const exists = db.prepare('SELECT id FROM users WHERE id = ? OR email = ?').get(officer.id, officer.email);
    if (!exists) {
      db.prepare(`
        INSERT INTO users (id, employee_id, name, email, password_hash, role, department, zone, phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        officer.id,
        officer.employee_id,
        officer.name,
        officer.email,
        defaultPasswordHash,
        officer.role,
        officer.department,
        officer.zone,
        officer.phone,
        new Date().toISOString(),
        new Date().toISOString()
      );
    }
  }

  // Seed rules reference table from PCR_2011_RULES
  const existingRulesCount = (db.prepare('SELECT COUNT(*) as count FROM rules').get() as any).count;
  if (existingRulesCount === 0) {
    const insertRule = db.prepare(`
      INSERT INTO rules (id, rule_code, rule_number, title, chapter, summary, source_document, source_page)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertManyRules = db.transaction((rulesList: typeof PCR_2011_RULES) => {
      for (const r of rulesList) {
        insertRule.run(
          r.rule_id,
          `Rule ${r.rule_number}`,
          r.rule_number,
          r.title,
          r.chapter,
          r.summary,
          r.source_document,
          r.source_page
        );
      }
    });
    insertManyRules(PCR_2011_RULES);
  }

  // Seed inspections and related entities if table empty
  const existingInspectionsCount = (db.prepare('SELECT COUNT(*) as count FROM inspections').get() as any).count;
  if (existingInspectionsCount === 0) {
    for (const record of SEED_INSPECTIONS) {
      saveInspectionToDb(record);
    }
  }
}

// ----------------- AUTH SERVICES -----------------

export function authenticateUser(identifier: string, passwordPlain: string): { user: UserProfile; token: string } | null {
  const hash = crypto.createHash('sha256').update(passwordPlain).digest('hex');
  const userRow = db.prepare(`
    SELECT * FROM users WHERE (email = ? OR employee_id = ?) AND password_hash = ?
  `).get(identifier, identifier, hash) as any;

  if (!userRow) return null;

  const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userRow.id, new Date().toISOString(), expiresAt);

  // Log audit
  logAudit(userRow.id, userRow.name, 'USER_LOGIN', 'USER', userRow.id, { email: userRow.email });

  return {
    user: {
      name: userRow.name,
      employee_id: userRow.employee_id,
      role: userRow.role,
      department: userRow.department,
      region: userRow.zone,
      zone: userRow.zone,
      email: userRow.email,
      phone: userRow.phone
    },
    token
  };
}

export function getUserByToken(token: string): UserProfile | null {
  const session = db.prepare(`
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, new Date().toISOString()) as any;

  if (!session) return null;

  return {
    name: session.name,
    employee_id: session.employee_id,
    role: session.role,
    department: session.department,
    region: session.zone,
    zone: session.zone,
    email: session.email,
    phone: session.phone
  };
}

export function deleteSession(token: string) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function updateUserProfile(employeeId: string, updates: Partial<UserProfile>): UserProfile | null {
  const user = db.prepare('SELECT * FROM users WHERE employee_id = ?').get(employeeId) as any;
  if (!user) return null;

  const newName = updates.name || user.name;
  const newEmail = updates.email || user.email;
  const newPhone = updates.phone || user.phone;
  const newZone = updates.zone || updates.region || user.zone;

  db.prepare(`
    UPDATE users SET name = ?, email = ?, phone = ?, zone = ?, updated_at = ?
    WHERE id = ?
  `).run(newName, newEmail, newPhone, newZone, new Date().toISOString(), user.id);

  logAudit(user.id, newName, 'PROFILE_UPDATED', 'USER', user.id, updates);

  return {
    name: newName,
    employee_id: user.employee_id,
    role: user.role,
    department: user.department,
    region: newZone,
    zone: newZone,
    email: newEmail,
    phone: newPhone
  };
}

// ----------------- AUDIT LOGS -----------------

export function logAudit(userId: string | null, userName: string, action: string, entityType: string, entityId: string, details?: any) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName,
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : null,
      new Date().toISOString()
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

export function getAuditLogsFromDb(limit: number = 50) {
  return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit);
}

// ----------------- PRODUCTS & BRANDS -----------------

export function getProductsFromDb(search?: string, category?: string) {
  let sql = `
    SELECT p.*, b.country_of_origin as brand_country,
    (SELECT COUNT(*) FROM inspections i WHERE i.product_id = p.id) as inspection_count,
    (SELECT COUNT(*) FROM violations v WHERE v.product_name = p.product_name) as violation_count,
    (SELECT overall_status FROM inspections i WHERE i.product_id = p.id ORDER BY created_at DESC LIMIT 1) as latest_status
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    sql += ` AND (p.product_name LIKE ? OR p.brand_name LIKE ? OR p.manufacturer LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  if (category && category !== 'ALL') {
    sql += ` AND p.category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY p.created_at DESC`;

  return db.prepare(sql).all(...params);
}

export function createProductInDb(product: Partial<ProductContext>) {
  const brandName = product.brand || 'General';
  let brandRow = db.prepare('SELECT id FROM brands WHERE name = ?').get(brandName) as any;
  if (!brandRow) {
    const brandId = `brd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO brands (id, name, manufacturer, country_of_origin, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      brandId,
      brandName,
      product.manufacturer || 'Unknown',
      product.country_of_origin || 'India',
      new Date().toISOString()
    );
    brandRow = { id: brandId };
  }

  const id = `prd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO products (
      id, brand_id, brand_name, product_name, category,
      declared_net_quantity, net_quantity_unit, quantity_type, mrp,
      manufacturer, manufacturer_address, consumer_care_details, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    brandRow.id,
    brandName,
    product.product_name || 'Unnamed Product',
    product.category || 'General Commodity',
    product.net_quantity || null,
    product.net_quantity_unit || null,
    product.quantity_type || 'weight',
    product.mrp || null,
    product.manufacturer || null,
    product.manufacturer_address || null,
    product.consumer_care_details || null,
    new Date().toISOString(),
    new Date().toISOString()
  );

  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

export function deleteProductFromDb(id: string) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

// ----------------- INSPECTIONS -----------------

export function saveInspectionToDb(record: InspectionRecord) {
  const saveTx = db.transaction(() => {
    // 1. Ensure Brand exists
    const brandName = record.product_context.brand || 'General';
    let brandRow = db.prepare('SELECT id FROM brands WHERE name = ?').get(brandName) as any;
    if (!brandRow) {
      const brandId = `brd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO brands (id, name, manufacturer, country_of_origin, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        brandId,
        brandName,
        record.product_context.manufacturer || 'Unknown',
        record.product_context.country_of_origin || 'India',
        new Date().toISOString()
      );
      brandRow = { id: brandId };
    }

    // 2. Ensure Product exists
    const productName = record.product_context.product_name;
    let productRow = db.prepare('SELECT id FROM products WHERE product_name = ? AND brand_name = ?').get(productName, brandName) as any;
    let productId = productRow?.id;
    if (!productId) {
      productId = `prd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO products (
          id, brand_id, brand_name, product_name, category,
          declared_net_quantity, net_quantity_unit, quantity_type, mrp,
          manufacturer, manufacturer_address, consumer_care_details, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        productId,
        brandRow.id,
        brandName,
        productName,
        record.product_context.category || 'General Commodity',
        record.product_context.net_quantity,
        record.product_context.net_quantity_unit,
        record.product_context.quantity_type || 'weight',
        record.product_context.mrp,
        record.product_context.manufacturer,
        record.product_context.manufacturer_address,
        record.product_context.consumer_care_details,
        record.created_at,
        record.updated_at
      );
    }

    // 3. Resolve Inspector ID to users.id to strictly satisfy foreign key constraint
    let actualInspectorId = record.inspector_id;
    const userRow = db.prepare('SELECT id FROM users WHERE id = ? OR employee_id = ?').get(record.inspector_id, record.inspector_id) as any;
    if (userRow) {
      actualInspectorId = userRow.id;
    } else {
      const defaultUser = db.prepare('SELECT id FROM users LIMIT 1').get() as any;
      actualInspectorId = defaultUser?.id || 'usr-10334';
    }

    // 4. Upsert Inspection Record
    db.prepare(`
      INSERT OR REPLACE INTO inspections (
        id, inspection_number, inspector_id, inspector_name, product_id,
        product_name, brand, category, location, workflow_status,
        product_context_json, images_json, overall_status, compliance_percentage,
        rules_passed, rules_failed, needs_review, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id,
      record.inspection_number,
      actualInspectorId,
      record.inspector_name,
      productId,
      productName,
      brandName,
      record.product_context.category || 'General Commodity',
      record.location,
      record.workflow_status,
      JSON.stringify(record.product_context),
      JSON.stringify(record.images),
      record.compliance_summary?.overall_status || 'COMPLIANT',
      record.compliance_summary?.compliance_percentage || 100,
      record.compliance_summary?.rules_passed || 0,
      record.compliance_summary?.rules_failed || 0,
      record.compliance_summary?.needs_review || 0,
      record.created_at,
      record.updated_at
    );

    // 4. Save Inspection Results
    db.prepare('DELETE FROM inspection_results WHERE inspection_id = ?').run(record.id);
    const insertResult = db.prepare(`
      INSERT INTO inspection_results (
        id, inspection_id, rule_id, rule_code, title, status, severity,
        confidence, requirement, detected_value, explanation, findings, evidence_used, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const res of record.rule_results) {
      insertResult.run(
        res.check_id || `chk-${Math.random().toString(36).substring(2, 9)}`,
        record.id,
        res.rule_id,
        res.rule_code || res.rule_id,
        res.title,
        res.status,
        res.severity,
        res.confidence,
        res.requirement || '',
        res.detected_value || '',
        res.explanation || '',
        res.findings || res.explanation || '',
        res.evidence_used || res.evidence_source_text || '',
        record.created_at
      );
    }

    // 5. Generate Violations if any rules failed
    db.prepare('DELETE FROM violations WHERE inspection_id = ?').run(record.id);
    const insertViolation = db.prepare(`
      INSERT INTO violations (
        id, inspection_id, rule_id, rule_code, product_name, brand, manufacturer,
        violation_type, severity, legal_citation, details, recommended_action, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const failedRules = record.rule_results.filter((r) => r.status === 'FAIL');
    for (const fail of failedRules) {
      insertViolation.run(
        `viol-${record.id}-${fail.rule_id}`,
        record.id,
        fail.rule_id,
        fail.rule_code || fail.rule_id,
        productName,
        brandName,
        record.product_context.manufacturer || 'Unknown Manufacturer',
        fail.title,
        fail.severity,
        fail.legal_citation || 'Legal Metrology (Packaged Commodities) Rules, 2011',
        fail.explanation || fail.findings || 'Statutory violation detected',
        'Issue statutory notice under Section 18 of Legal Metrology Act, 2009',
        'OPEN',
        record.created_at
      );

      // Create an alert for critical violations
      db.prepare(`
        INSERT INTO alerts (id, inspection_id, title, description, alert_type, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `alt-${record.id}-${fail.rule_id}`,
        record.id,
        `Statutory Non-Compliance: ${fail.title}`,
        `${productName} (${brandName}) violates ${fail.rule_code || fail.rule_id}. ${fail.explanation || ''}`,
        'critical',
        0,
        record.created_at
      );
    }

    // 6. Generate/Upsert Report Dossier
    const reportNum = `REP-${record.inspection_number.replace('INS-', '')}`;
    const verificationHash = crypto.createHash('sha256').update(`${record.id}-${record.inspection_number}-${record.created_at}`).digest('hex');

    db.prepare(`
      INSERT OR REPLACE INTO reports (
        id, report_number, inspection_id, inspection_number, inspector_name,
        inspector_id, product_name, brand, overall_status, compliance_score,
        verification_hash, dossier_json, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `rep-${record.id}`,
      reportNum,
      record.id,
      record.inspection_number,
      record.inspector_name,
      record.inspector_id,
      productName,
      brandName,
      record.compliance_summary?.overall_status || 'COMPLIANT',
      record.compliance_summary?.compliance_percentage || 100,
      verificationHash,
      JSON.stringify(record),
      record.created_at
    );

    // 7. Record Audit Log
    // audit_logs.user_id is a FK to users.id (internal PK), not employee_id,
    // so resolve it first; fall back to null (column is nullable) if no match.
    const auditUserRow = record.inspector_id
      ? (db.prepare('SELECT id FROM users WHERE employee_id = ?').get(record.inspector_id) as any)
      : null;
    logAudit(
      auditUserRow?.id || null,
      record.inspector_name,
      'INSPECTION_PERSISTED',
      'INSPECTION',
      record.id,
      {
        inspection_number: record.inspection_number,
        product: productName,
        status: record.compliance_summary?.overall_status,
        failed_count: failedRules.length
      }
    );
  });

  saveTx();
}

export function getAllInspectionsFromDb(search?: string, status?: string): InspectionRecord[] {
  let sql = 'SELECT * FROM inspections WHERE 1=1';
  const params: any[] = [];

  if (search) {
    sql += ' AND (product_name LIKE ? OR brand LIKE ? OR inspection_number LIKE ? OR location LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  if (status && status !== 'ALL') {
    sql += ' AND overall_status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((row) => {
    const results = db.prepare(`
      SELECT * FROM inspection_results WHERE inspection_id = ?
    `).all(row.id) as any[];

    return {
      id: row.id,
      inspection_number: row.inspection_number,
      created_at: row.created_at,
      updated_at: row.updated_at,
      inspector_name: row.inspector_name,
      inspector_id: row.inspector_id,
      location: row.location,
      workflow_status: row.workflow_status,
      product_context: JSON.parse(row.product_context_json),
      images: JSON.parse(row.images_json),
      rule_results: results.map((r) => ({
        check_id: r.id,
        inspection_id: r.inspection_id,
        rule_id: r.rule_id,
        rule_code: r.rule_code,
        rule_number: parseInt(r.rule_code.replace(/[^0-9]/g, '')) || 6,
        title: r.title,
        status: r.status,
        severity: r.severity,
        confidence: r.confidence,
        requirement: r.requirement,
        detected_value: r.detected_value,
        expected_condition: r.requirement,
        explanation: r.explanation,
        findings: r.findings,
        evidence_used: r.evidence_used,
        applicability: true,
        exemption_applied: false,
        source_document: 'PCR-2011',
        source_page: 'Rule reference',
        source_text: r.requirement,
        rule_version: '2011',
        manual_verification_required: r.status === 'REQUIRES_MANUAL_VERIFICATION'
      })),
      compliance_summary: {
        overall_status: row.overall_status,
        compliance_percentage: row.compliance_percentage,
        rules_passed: row.rules_passed,
        rules_failed: row.rules_failed,
        needs_review: row.needs_review,
        not_applicable: 0,
        total_rules: row.rules_passed + row.rules_failed + row.needs_review,
        applicable_standards: [
          { name: 'Legal Metrology Act, 2009', reference: 'Sections 18, 36', version: '2009' },
          { name: 'Legal Metrology (Packaged Commodities) Rules, 2011', reference: 'Rules 3, 5, 6, 8, 9, 22, 26', version: '2011' }
        ],
        evaluated_at: row.updated_at
      }
    };
  });
}

export function getInspectionByIdFromDb(id: string): InspectionRecord | null {
  const row = db.prepare('SELECT * FROM inspections WHERE id = ? OR inspection_number = ?').get(id, id) as any;
  if (!row) return null;

  const results = db.prepare('SELECT * FROM inspection_results WHERE inspection_id = ?').all(row.id) as any[];

  return {
    id: row.id,
    inspection_number: row.inspection_number,
    created_at: row.created_at,
    updated_at: row.updated_at,
    inspector_name: row.inspector_name,
    inspector_id: row.inspector_id,
    location: row.location,
    workflow_status: row.workflow_status,
    product_context: JSON.parse(row.product_context_json),
    images: JSON.parse(row.images_json),
    rule_results: results.map((r) => ({
      check_id: r.id,
      inspection_id: r.inspection_id,
      rule_id: r.rule_id,
      rule_code: r.rule_code,
      rule_number: parseInt(r.rule_code.replace(/[^0-9]/g, '')) || 6,
      title: r.title,
      status: r.status,
      severity: r.severity,
      confidence: r.confidence,
      requirement: r.requirement,
      detected_value: r.detected_value,
      expected_condition: r.requirement,
      explanation: r.explanation,
      findings: r.findings,
      evidence_used: r.evidence_used,
      applicability: true,
      exemption_applied: false,
      source_document: 'PCR-2011',
      source_page: 'Rule reference',
      source_text: r.requirement,
      rule_version: '2011',
      manual_verification_required: r.status === 'REQUIRES_MANUAL_VERIFICATION'
    })),
    compliance_summary: {
      overall_status: row.overall_status,
      compliance_percentage: row.compliance_percentage,
      rules_passed: row.rules_passed,
      rules_failed: row.rules_failed,
      needs_review: row.needs_review,
      not_applicable: 0,
      total_rules: row.rules_passed + row.rules_failed + row.needs_review,
      applicable_standards: [
        { name: 'Legal Metrology Act, 2009', reference: 'Sections 18, 36', version: '2009' },
        { name: 'Legal Metrology (Packaged Commodities) Rules, 2011', reference: 'Rules 3, 5, 6, 8, 9, 22, 26', version: '2011' }
      ],
      evaluated_at: row.updated_at
    }
  };
}

export function deleteInspectionFromDb(id: string) {
  db.prepare('DELETE FROM inspections WHERE id = ?').run(id);
}

// ----------------- VIOLATIONS & ALERTS -----------------

export function getViolationsFromDb() {
  return db.prepare(`
    SELECT * FROM violations ORDER BY created_at DESC
  `).all();
}

export function getAlertsFromDb(unreadOnly: boolean = false) {
  let sql = 'SELECT * FROM alerts';
  if (unreadOnly) {
    sql += ' WHERE is_read = 0';
  }
  sql += ' ORDER BY created_at DESC';
  return db.prepare(sql).all();
}

export function markAlertAsReadInDb(id: string) {
  db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(id);
}

export function createAlertInDb(title: string, description: string, alertType: string = 'warning') {
  const id = `alt-${Date.now()}`;
  db.prepare(`
    INSERT INTO alerts (id, title, description, alert_type, is_read, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(id, title, description, alertType, new Date().toISOString());
}

// ----------------- REPORTS -----------------

export function getReportsFromDb() {
  return db.prepare(`
    SELECT r.*, i.location, i.category, i.workflow_status
    FROM reports r
    JOIN inspections i ON r.inspection_id = i.id
    ORDER BY r.created_at DESC
  `).all();
}

export function getReportByIdFromDb(id: string) {
  return db.prepare('SELECT * FROM reports WHERE id = ? OR inspection_id = ? OR report_number = ?').get(id, id, id);
}

// ----------------- REAL ANALYTICS AGGREGATION -----------------

export function getRealAnalytics() {
  const inspections = db.prepare('SELECT * FROM inspections').all() as any[];
  const total = inspections.length;
  let compliant = 0;
  let nonCompliant = 0;
  let review = 0;

  for (const ins of inspections) {
    if (ins.overall_status === 'COMPLIANT') compliant++;
    else if (ins.overall_status === 'NON-COMPLIANT') nonCompliant++;
    else review++;
  }

  const productsCovered = (db.prepare('SELECT COUNT(DISTINCT product_name) as count FROM inspections').get() as any).count || 0;
  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  // Real category aggregation
  const categoriesRaw = db.prepare(`
    SELECT category as name, COUNT(*) as count
    FROM inspections
    GROUP BY category
    ORDER BY count DESC
  `).all() as any[];

  const categories = categoriesRaw.map((c) => ({
    name: c.name || 'Uncategorized',
    count: c.count,
    percentage: total > 0 ? Math.round((c.count / total) * 100) : 0
  }));

  // Real top infractions
  const totalViolations = ((db.prepare('SELECT COUNT(*) as count FROM violations').get() as any)?.count) || 0;
  const topInfractionsRaw = db.prepare(`
    SELECT v.rule_code, COALESCE(r.title, v.legal_citation, v.rule_code) as rule_title, COUNT(*) as count
    FROM violations v
    LEFT JOIN rules r ON v.rule_id = r.id OR v.rule_code = r.rule_code
    GROUP BY v.rule_code
    ORDER BY count DESC
    LIMIT 5
  `).all() as any[];

  const infractionColors = ['bg-rose-500', 'bg-amber-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500'];
  const topInfractions = topInfractionsRaw.map((inf, i) => ({
    rule: `${inf.rule_code} - ${inf.rule_title}`,
    rule_code: inf.rule_code,
    count: inf.count,
    percentage: totalViolations > 0 ? Math.round((inf.count / totalViolations) * 100) : 0,
    color: infractionColors[i % infractionColors.length]
  }));

  // Real weekly inspection trends
  const recentInspections = db.prepare(`
    SELECT strftime('%Y-W%W', created_at) as week,
           COUNT(*) as total,
           SUM(CASE WHEN overall_status = 'COMPLIANT' THEN 1 ELSE 0 END) as compliant,
           SUM(CASE WHEN overall_status = 'NON-COMPLIANT' THEN 1 ELSE 0 END) as failed
    FROM inspections
    GROUP BY week
    ORDER BY week DESC
    LIMIT 6
  `).all() as any[];

  const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-indigo-500', 'bg-sky-500'];
  const categoriesBreakdown = categories.map((c, i) => ({
    category: c.name,
    count: c.count,
    percentage: c.percentage,
    color: colors[i % colors.length]
  }));

  return {
    total_inspections: total,
    compliant_count: compliant,
    non_compliant_count: nonCompliant,
    review_count: review,
    products_covered: productsCovered,
    compliance_rate: complianceRate,
    categories: categories,
    categories_breakdown: categoriesBreakdown,
    top_infractions: topInfractions,
    weekly_trends: recentInspections.reverse()
  };
}

export function getUsersFromDb() {
  return db.prepare('SELECT id, employee_id, name, email, role, department, zone, phone FROM users ORDER BY created_at ASC').all();
}