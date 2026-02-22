# DopeOffice PDF Merger — Next.js

A Next.js + TypeScript port of the DopeOffice PDF & Document Studio. Merge PDFs, reorder pages, rotate pages, and download—with the same UI and features as the original Flask app.

## Prerequisites

- **Node.js** 18+
- **Python 3** with the PDF merger backend (for upload and merge)

The Next.js app proxies `/api/upload` and `/api/merge` to the Python Flask backend. You must run the Python server for full functionality.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the Python backend

From the project root (or `pdfmerger` folder):

```bash
cd ../pdfmerger   # or wherever app.py lives
pip install flask werkzeug PyMuPDF python-docx reportlab
python app.py
```

The Python server runs on **http://localhost:8080** by default.

### 3. Start the Next.js dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `PYTHON_BACKEND_URL` — Python backend URL (default: `http://localhost:8080`)

Create a `.env.local` file if you need a different backend URL:

```
PYTHON_BACKEND_URL=http://localhost:8080
```

## Features

- Upload PDF and DOCX files (drag & drop or click)
- Reorder files and pages via drag & drop
- Rotate pages
- Grid and Read view modes
- Light/Dark theme
- Merge selected pages and download

## Project Structure

- `app/page.tsx` — Main PDF merger UI (client component)
- `app/api/upload/route.ts` — Proxies uploads to Python backend
- `app/api/merge/route.ts` — Proxies merge requests to Python backend
- `app/globals.css` — DopeOffice styles (Industrial Blueprint Luxe theme)
- `lib/types.ts` — TypeScript types for uploaded files and merge payload
