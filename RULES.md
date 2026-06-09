# Apps Script Rules — MUST FOLLOW or app breaks

## The 6 Rules That Took 3 Days to Learn

### Rule 1 — Use createTemplateFromFile NOT createHtmlOutputFromFile
Code.gs doGet must always be:
```
var t = HtmlService.createTemplateFromFile('index');
t.scriptUrl = ScriptApp.getService().getUrl();
return t.evaluate()...
```
NEVER use:
```
HtmlService.createHtmlOutputFromFile('index')  ← BREAKS LOGIN (doLogin not defined)
```

### Rule 2 — SCRIPT_URL must use template syntax with DOUBLE quotes
In index.html the URL line must be exactly:
```
var SCRIPT_URL = "<?= scriptUrl ?>";
```
- Double quotes only — single quotes break the Apps Script template parser
- Gets replaced server-side by Code.gs before the page loads
- Never hardcode the URL directly — it changes with every new deployment

### Rule 3 — Double quotes ONLY in all JavaScript strings
Apps Script HTML parser breaks on single quotes inside JS strings.
```
WRONG: '<div style="font-family:'Inter',sans-serif">'
RIGHT: '<div style="font-family:Inter,sans-serif">'
```
This includes ALL inline HTML generated in JS — table rows, cards, badges etc.

### Rule 4 — No CSS var() variables
Apps Script sanitizer breaks on var(--color) syntax.
```
WRONG: color: var(--blue);
RIGHT: color: #58a6ff;
```
Replace every single CSS variable with its actual hex/value before deploying.

### Rule 5 — No SVG data URIs in CSS
Apps Script HTML parser chokes on encoded SVG strings in CSS.
```
WRONG: background-image: url("data:image/svg+xml,...")
RIGHT: select{cursor:pointer;appearance:none;padding-right:28px}
```
Just remove the background-image entirely — the dropdown still works.

### Rule 6 — Plain ES5 JavaScript only
Apps Script sandbox rejects modern JS syntax.
```
No arrow functions:     x => x          →  function(x){ return x; }
No spread operator:     {...obj}         →  manual property copy
No template literals:   `hello ${name}` →  "hello " + name
No const/let:           const x = 1     →  var x = 1;
No async/await:         await fetch()   →  use .then() chains or XHR
```

---

## Multi-User Rules

### No localStorage
localStorage is per-browser — causes data conflicts between users.
Google Sheets is the single source of truth for all users.
Never store transactions or productions in localStorage.

### pendingSaves counter
apiCall() uses a pendingSaves counter.
When pendingSaves > 0, a beforeunload warning fires if user tries to close tab.
This prevents data loss from closing the browser mid-save.

### Auto-refresh
App auto-refreshes from Google Sheets every 2 minutes.
All users see the same data within 2 minutes of each other.
Manual refresh button available for immediate sync.

---

## Deployment Rules
- Always do NEW deployment after any code change
- Never edit an existing deployment — create a new one every time
- Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → Deploy
- Must open Apps Script from INSIDE the sheet (Extensions → Apps Script) for getActiveSpreadsheet() to work
- Old deployment URLs still work but serve old code — always use the latest URL

## File Structure in Apps Script
- Code.gs  (backend — one file)
- index    (HTML file — must be named exactly "index", no .html extension when naming in Apps Script)

## Common Errors and Fixes
| Error | Cause | Fix |
|-------|-------|-----|
| SyntaxError: Unexpected string | CSS var() or SVG data URI | Replace var() with hex, remove SVG |
| doLogin is not defined | Using createHtmlOutputFromFile | Switch to createTemplateFromFile |
| Load error after login | SCRIPT_URL not injected | Check doGet uses createTemplateFromFile and t.scriptUrl is set |
| Data not saving | fetch() cancelled on tab close | XHR + pendingSaves + beforeunload warning |
| Blank page | Script truncated during paste | Check index.html ends with </html> |
