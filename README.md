<div align="center">
  <h1>⚖️ LegalMet AI</h1>
  <p><strong>Fair Markets. Trusted India.</strong></p>
  <p>AI-powered Legal Metrology compliance inspection platform for packaged commodities, built for the Legal Metrology (Packaged Commodities) Rules, 2011.</p>
</div>

---

## 🔗 Live Demo

**App:** [https://legal-ai-zt9f.onrender.com](https://legal-ai-zt9f.onrender.com)

## 📋 Overview

LegalMet AI helps Legal Metrology inspectors verify packaged commodity compliance in the field. Inspectors upload package images (front, back, side), and the platform uses multimodal AI vision (Gemini) to extract mandatory declarations — MRP, net quantity, manufacturing date, batch number, consumer care details — then runs them through a deterministic rule engine against PCR-2011 statutory requirements to flag violations automatically.

## ✨ Features

- 📸 **Image Capture & Upload** — live camera capture (via `getUserMedia`), drag-and-drop, and file browse for package images
- 🤖 **AI-Powered Extraction** — Gemini multimodal vision OCR extracts declared label fields automatically
- ⚖️ **Deterministic Rule Engine** — validates extracted data against PCR-2011 rules (Rule 6, First Schedule MPE, Second Schedule commodities)
- 📊 **Dashboard & Analytics** — real-time compliance metrics, violation trends, inspection history
- 🔔 **Alerts & Reports** — auto-generated violation alerts and downloadable inspection reports
- 👥 **User & Team Management** — role-based inspector accounts with audit logging
- 📚 **Knowledge Base** — searchable statutory reference for PCR-2011 rules

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express (served from the same process as the frontend) |
| Database | SQLite (WAL mode) |
| AI | Google Gemini API (`@google/genai`) |
| Icons | Lucide React |

> **Architecture note:** This is a single-process app — `server.ts` serves both the REST API (`/api/*`) and the built frontend (`dist/`) from one Express server. It does **not** use a split serverless/static architecture, so it must be deployed on a platform that runs a persistent Node process (Render, Railway, Fly.io, Cloud Run) — not static-only hosts like Vercel/Netlify.

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/siva2787/legal-ai.git
   cd legal-ai
   npm install
   ```

2. Copy `.env.example` to `.env` and set your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Start the dev server (runs Express + Vite middleware together):
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## 📦 Build & Deploy

```bash
npm run build     # builds the frontend into dist/
npm start         # runs the production Express server (serves dist/ + API)
```

### Deploying on Render

1. Create a new **Web Service** on [Render](https://render.com), connect this repo.
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `NODE_ENV=production npx tsx server.ts`
4. Add environment variable `GEMINI_API_KEY` in the Render dashboard.
5. After the first deploy, add `APP_URL` with the live Render URL.

> ⚠️ Render's free tier spins down after 15 minutes of inactivity and uses ephemeral disk (SQLite data resets on restart). A [GitHub Actions keep-alive workflow](.github/workflows/keep-alive.yml) pings `/api/health` every 10 minutes to prevent sleep during demos.

## 📁 Project Structure

```
legalmet/
├── .github/workflows/   # CI / keep-alive automation
├── server.ts            # Express server — API routes + static frontend serving
├── server/db.ts         # SQLite data access layer
├── src/
│   ├── components/      # React UI (dashboard, inspection flow, layout)
│   ├── legal/           # PCR-2011 rule engine & statutory data
│   ├── data/            # seed data
│   └── types.ts         # shared TypeScript types
├── data/                # SQLite database files (gitignored in production)
└── vite.config.ts
```

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Inspector authentication |
| `GET` | `/api/inspections` | List inspections |
| `POST` | `/api/inspections` | Create & evaluate a new inspection |
| `POST` | `/api/inspections/evaluate` | Re-run rule evaluation on product data |
| `GET` | `/api/violations` | List flagged violations |
| `GET` | `/api/analytics` | Dashboard metrics |
| `GET` | `/api/knowledge` | Search PCR-2011 statutory rules |
| `GET` | `/api/health` | Health check |

## 📜 Legal Basis

Built around the **Legal Metrology (Packaged Commodities) Rules, 2011**, under the Ministry of Consumer Affairs, Food & Public Distribution, Government of India — covering mandatory declarations required on pre-packaged commodities intended for retail sale (Rule 6), and permissible error limits (First Schedule).

## 📄 License

This project was built for a hackathon (Team 404 — Technova). Add a license of your choice before public/commercial use.
