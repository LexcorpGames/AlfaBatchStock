# Stock Inventory — Architecture & Code Guide

## How It Works
1. User opens /exec URL in browser
2. Code.gs doGet() serves index.html via createTemplateFromFile
3. scriptUrl is injected into index.html server-side replacing `<?= scriptUrl ?>`
4. index.html loads in browser — shows login screen
5. On login, JS calls loadAll() which fetches all data from Code.gs
6. All data stored in Google Sheets (Transactions + Productions tabs)
7. Every save/update/delete calls Code.gs via XHR GET request with action param
8. Auto-refresh pulls fresh data from sheet every 2 minutes

## Data Flow
```
Browser JS  →  XHR GET (SCRIPT_URL?action=saveTx&...)  →  Code.gs doGet()  →  Google Sheet
Browser JS  ←  JSON response {ok:true, data:[...]}      ←  Code.gs doGet()  ←  Google Sheet
```

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS (ES5 only) hosted via Google Apps Script
- Backend: Google Apps Script (server-side JavaScript)
- Database: Google Sheets (two tabs — Transactions, Productions)
- Hosting: Google Apps Script Web App (/exec URL)

---

## Code.gs Functions
| Function         | What it does |
|------------------|--------------|
| doGet(e)         | Routes all requests — serves HTML or handles data actions |
| getOrCreateSheet | Gets sheet by name, creates with headers if missing |
| sheetToObjects   | Converts sheet rows to JS objects using key mapping |
| findRowById      | Finds row number by ID for updates/deletes |
| dec(val)         | Safely decodes URI-encoded parameter values |
| getTx()          | Read all transactions from Transactions sheet |
| saveTx(p)        | Append new transaction row to sheet |
| updateTx(p)      | Update existing transaction row by ID |
| deleteTx(p)      | Delete transaction row by ID |
| getProd()        | Read all productions, parse inputs JSON |
| saveProd(p)      | Append new production row to sheet |
| updateProd(p)    | Update existing production row by ID |
| deleteProd(p)    | Delete production row by ID |

---

## index.html JS Functions
| Function          | What it does |
|-------------------|--------------|
| doLogin()         | Validates credentials, shows app, loads data |
| doLogout()        | Clears all state, returns to login screen, stops auto-refresh |
| applyRoleUI()     | Shows/hides tabs and fields based on admin/manager role |
| syncStatus()      | Updates the sync indicator in topnav |
| updateLastSync()  | Shows HH:MM:SS timestamp of last successful sync |
| manualRefresh()   | Triggers loadAll() with spinning button feedback |
| apiCall()         | XHR wrapper for all save/update/delete — tracks pendingSaves |
| loadAll()         | Fetches transactions + productions in parallel from sheet |
| showTab()         | Switches active tab, triggers render for stock/costing |
| submitTx()        | Validates + saves/updates a transaction |
| editTx()          | Populates form with existing transaction for editing |
| cancelTxEdit()    | Resets transaction form to new entry mode |
| renderTxTable()   | Renders transaction table with search + type filter |
| addInputRow()     | Adds a new input material row in production form |
| removeInputRow()  | Removes an input material row |
| renderInputRows() | Re-renders all input material rows |
| rowPidChange()    | Auto-fills product name when Product ID is typed |
| submitProd()      | Validates + saves production + creates auto outward/inward TXs |
| editProd()        | Populates form with existing production for editing |
| cancelProdEdit()  | Resets production form to new entry mode |
| renderProdTable() | Renders production history table with search |
| askDelete()       | Shows delete confirmation modal |
| confirmDelete()   | Executes delete after confirmation |
| getStock()        | Calculates current balance for a product from transaction history |
| getAvgPrice()     | Calculates weighted average purchase price for a product |
| getLastUnit()     | Gets most recently used unit for a product |
| getLastName()     | Gets most recently used name for a product |
| getOutputPids()   | Returns set of PIDs that are production outputs (excluded from stock) |
| renderStock()     | Renders stock summary cards with balance, rate, value |
| renderCosting()   | Renders batch costing breakdown cards (admin only) |

---

## Key Design Decisions

### Google Sheets as single source of truth
- No localStorage — causes conflicts between multiple users
- All data fetched fresh from sheet on login and every 2 minutes
- pendingSaves counter + beforeunload warning prevents data loss on tab close

### Stock calculated live
- No separate "current stock" field stored anywhere
- Stock = sum of all inward transactions minus sum of all outward transactions
- Calculated fresh every time renderStock() runs

### Output products excluded from Stock Summary
- Products that appear as outputs in Productions are excluded from raw material stock cards
- They are tracked separately as finished goods

### Production auto-transactions
- Saving a production entry automatically creates:
  - One outward transaction per input material (deducts from stock)
  - One inward transaction for the output product (adds finished goods)
- These are linked by the Production ID in the Reference field

### Role-based access
- admin: all tabs visible, stock values shown, batch costing visible
- manager: no stock values (hidden), no batch costing tab
- Checked client-side via ACCOUNTS object in index.html

---

## Styling
- Dark theme: #0d1117 bg, #161b22 cards, #1c2128 inputs
- Colors: blue #58a6ff, green #3fb950, red #f85149, orange #d29922
- Font: Inter for UI text, monospace for IDs/numbers/labels
- No CSS variables — all hardcoded hex (CSS var() breaks Apps Script)
- No SVG data URIs in CSS (breaks Apps Script parser)

---

## Google Sheet Structure

**Transactions sheet** (auto-created):
| Column | Key | Notes |
|--------|-----|-------|
| A | ID | Unique timestamp-based ID |
| B | Product ID | e.g. HAC-001 |
| C | Product Name | e.g. H Acid |
| D | Date | YYYY-MM-DD |
| E | Type | inward / outward |
| F | Qty | Number |
| G | Unit | kg / litre / gram etc |
| H | Price/Unit | Number |
| I | Total Value | Qty x Price |
| J | Reference | Invoice number or Production ID |
| K | Notes | Free text |

**Productions sheet** (auto-created):
| Column | Key | Notes |
|--------|-----|-------|
| A | ID | Unique timestamp-based ID |
| B | Production ID | e.g. PRD-001 |
| C | Date | YYYY-MM-DD |
| D | Output PID | Output product ID |
| E | Output Name | Output product name |
| F | Output Qty | kg produced |
| G | Batch Ref | Optional batch reference |
| H | Notes | Free text |
| I | Inputs JSON | JSON array of input materials with costs |
| J | Total RM Cost | Total raw material cost for the batch |
