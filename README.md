# Alfa Batch Stock Reporting
Internal stock inventory system for Alfa Industries built on Google Apps Script + Google Sheets.

## What It Does
- **Transactions** — record inward purchases and outward usage per raw material
- **Production** — log production runs, auto-deducts input materials from stock
- **Stock Summary** — live balance cards per raw material with avg rate and value
- **Batch Costing** — raw material cost breakdown per production batch
- Role-based login — admin sees everything, manager sees limited view
- Auto-refresh every 2 minutes, manual refresh button, last sync timestamp

---

## Files
| File | Purpose |
|------|---------|
| `index.html` | Full frontend — paste into Apps Script as HTML file named `index` |
| `Code.gs` | Backend — paste into Apps Script as Code.gs |
| `ARCHITECTURE.md` | How the code works, all functions explained |
| `RULES.md` | Critical rules — must follow or app breaks |

---

## First Time Setup

### Step 1 — Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new sheet — name it anything (e.g. "Alfa Stock")
3. Leave it empty — the app creates the tabs automatically

### Step 2 — Open Apps Script from the Sheet
1. In your Google Sheet click **Extensions → Apps Script**
2. This binds the script to the sheet — critical, do not open Apps Script directly

### Step 3 — Add Code.gs
1. You'll see a default `Code.gs` file with `function myFunction() {}`
2. Select all → delete → paste the contents of `Code.gs` from this repo
3. Save (Cmd+S or Ctrl+S)

### Step 4 — Add index.html
1. Click the **+** button next to Files on the left
2. Select **HTML**
3. Name it exactly: `index` (no .html extension)
4. Select all → delete → paste the contents of `index.html` from this repo
5. Save

### Step 5 — Deploy
1. Click **Deploy → New deployment**
2. Click the gear icon ⚙ → select **Web app**
3. Set **Execute as: Me**
4. Set **Who has access: Anyone**
5. Click **Deploy**
6. Copy the `/exec` URL — this is your app URL
7. Open it in Chrome — authorize when prompted (one time only)

### Step 6 — Share with team
Send the `/exec` URL to your team. That's all they need.

---

## Login Credentials
| User | Password | Access |
|------|----------|--------|
| admin | admin123 | Full access — all tabs, stock values, batch costing |
| manager | mgr456 | No stock values, no batch costing tab |

> To change passwords, edit the `ACCOUNTS` object in `index.html`

---

## How to Update the App

### Making a change:
1. Edit `index.html` (or `Code.gs`) locally
2. Push to GitHub
3. In Apps Script — open `index.html`, select all, paste new code, save
4. **Deploy → New deployment → Web app → Anyone → Deploy**
5. Share the new `/exec` URL with your team

> ⚠️ Always do a **New deployment** — never edit an existing one. Old URLs stop working after redeployment.

---

## Setting Up on GitHub (First Time)

### Step 1 — Create a GitHub account
Go to [github.com](https://github.com) → Sign up (free)

### Step 2 — Create a new repository
1. Click the **+** icon top right → **New repository**
2. Name it: `alfa-stock-inventory` (or anything you like)
3. Set to **Private**
4. Check **Add a README file**
5. Click **Create repository**

### Step 3 — Upload your files
1. On your repo page click **Add file → Upload files**
2. Drag and drop all files:
   - `index.html`
   - `Code.gs`
   - `README.md`
   - `ARCHITECTURE.md`
   - `RULES.md`
3. At the bottom type a commit message: `Initial commit — working version`
4. Click **Commit changes**

### Step 4 — Done!
Your code is now saved on GitHub with full version history.

---

## How to Update GitHub After Changes

### Option A — Edit directly on GitHub (easiest)
1. Open the file on GitHub (e.g. `index.html`)
2. Click the pencil ✏️ icon to edit
3. Make your changes
4. At the bottom write a commit message: `Fixed stock calculation bug` etc.
5. Click **Commit changes**
6. Then copy the updated code and paste into Apps Script → redeploy

### Option B — Upload new version
1. On your repo click **Add file → Upload files**
2. Drag the updated file — GitHub will replace the old version
3. Write a commit message
4. Click **Commit changes**

---

## Critical Rules (do not skip)
See `RULES.md` for the full list. Short version:
- Use `createTemplateFromFile` in Code.gs doGet — not `createHtmlOutputFromFile`
- `SCRIPT_URL` must use `"<?= scriptUrl ?>"` template syntax
- No CSS `var()` variables — use hardcoded hex values
- No SVG data URIs in CSS
- No single quotes inside JS strings
- Plain ES5 JavaScript only — no arrow functions, no const/let

---

## Google Sheet Structure (auto-created)
**Transactions sheet:**
ID | Product ID | Product Name | Date | Type | Qty | Unit | Price/Unit | Total Value | Reference | Notes

**Productions sheet:**
ID | Production ID | Date | Output PID | Output Name | Output Qty | Batch Ref | Notes | Inputs JSON | Total RM Cost

---

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (ES5) hosted via Google Apps Script
- **Backend:** Google Apps Script (JavaScript)
- **Database:** Google Sheets
- **Hosting:** Google Apps Script Web App
