// ============================================================
//  STOCK INVENTORY — Code.gs
//  WORKING VERSION — uses createTemplateFromFile + scriptUrl
//  Last updated: May 2026
// ============================================================

var SHEET_TX   = 'Transactions';
var SHEET_PROD = 'Productions';
var TX_KEYS    = ['id','pid','name','date','type','qty','unit','price','total','ref','notes'];
var TX_HEADERS = ['ID','Product ID','Product Name','Date','Type','Qty','Unit','Price/Unit','Total Value','Reference','Notes'];
var PROD_KEYS    = ['id','prid','date','outPid','outNm','outQty','batch','notes','inputsJson','totalRMCost'];
var PROD_HEADERS = ['ID','Production ID','Date','Output PID','Output Name','Output Qty','Batch Ref','Notes','Inputs JSON','Total RM Cost'];

function doGet(e) {
  var action = (e.parameter || {}).action;
  if (!action) {
    var t = HtmlService.createTemplateFromFile('index');
    t.scriptUrl = ScriptApp.getService().getUrl();
    return t.evaluate()
      .setTitle('Stock Inventory')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  var result;
  try {
    var p = e.parameter || {};
    switch (action) {
      case 'getTx':      result = getTx();        break;
      case 'saveTx':     result = saveTx(p);      break;
      case 'updateTx':   result = updateTx(p);    break;
      case 'deleteTx':   result = deleteTx(p);    break;
      case 'getProd':    result = getProd();       break;
      case 'saveProd':   result = saveProd(p);     break;
      case 'updateProd': result = updateProd(p);  break;
      case 'deleteProd': result = deleteProd(p);  break;
      default: result = { ok: false, error: 'Unknown action' };
    }
  } catch(err) {
    result = { ok: false, error: err.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f3f3');
  }
  return sh;
}

function sheetToObjects(sh, keys) {
  var data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(function(row) {
    var obj = {};
    keys.forEach(function(k, i) { obj[k] = row[i] !== undefined ? String(row[i]) : ''; });
    return obj;
  }).filter(function(obj) { return obj.id && obj.id.trim() !== ''; });
}

function findRowById(sh, id) {
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id).trim()) return i + 1;
  }
  return -1;
}

function dec(val) {
  try { return val ? decodeURIComponent(String(val)) : ''; }
  catch(e) { return val || ''; }
}

function getTx() {
  var sh = getOrCreateSheet(SHEET_TX, TX_HEADERS);
  var rows = sheetToObjects(sh, TX_KEYS);
  return { ok: true, data: rows.map(function(r) {
    return { id:r.id, pid:r.pid, name:r.name, date:r.date, type:r.type,
      qty:parseFloat(r.qty)||0, unit:r.unit, price:parseFloat(r.price)||0,
      total:parseFloat(r.total)||0, ref:r.ref, notes:r.notes };
  })};
}

function saveTx(p) {
  var sh = getOrCreateSheet(SHEET_TX, TX_HEADERS);
  var id = dec(p.id) || Date.now().toString();
  sh.appendRow([id, dec(p.pid), dec(p.name), dec(p.date), dec(p.type),
    parseFloat(p.qty)||0, dec(p.unit), parseFloat(p.price)||0,
    parseFloat(p.total)||0, dec(p.ref), dec(p.notes)]);
  return { ok: true, id: id };
}

function updateTx(p) {
  var sh = getOrCreateSheet(SHEET_TX, TX_HEADERS);
  var row = findRowById(sh, dec(p.id));
  if (row < 0) return { ok: false, error: 'Row not found' };
  sh.getRange(row,2).setValue(dec(p.pid));
  sh.getRange(row,3).setValue(dec(p.name));
  sh.getRange(row,4).setValue(dec(p.date));
  sh.getRange(row,5).setValue(dec(p.type));
  sh.getRange(row,6).setValue(parseFloat(p.qty)||0);
  sh.getRange(row,7).setValue(dec(p.unit));
  sh.getRange(row,8).setValue(parseFloat(p.price)||0);
  sh.getRange(row,9).setValue(parseFloat(p.total)||0);
  sh.getRange(row,10).setValue(dec(p.ref));
  sh.getRange(row,11).setValue(dec(p.notes));
  return { ok: true };
}

function deleteTx(p) {
  var sh = getOrCreateSheet(SHEET_TX, TX_HEADERS);
  var row = findRowById(sh, dec(p.id));
  if (row < 0) return { ok: false, error: 'Row not found' };
  sh.deleteRow(row);
  return { ok: true };
}

function getProd() {
  var sh = getOrCreateSheet(SHEET_PROD, PROD_HEADERS);
  var rows = sheetToObjects(sh, PROD_KEYS);
  return { ok: true, data: rows.map(function(r) {
    var inputs = [];
    try { inputs = JSON.parse(r.inputsJson || '[]'); } catch(e) {}
    return { id:r.id, prid:r.prid, date:r.date, outPid:r.outPid, outNm:r.outNm,
      outQty:parseFloat(r.outQty)||0, batch:r.batch, notes:r.notes,
      totalRMCost:parseFloat(r.totalRMCost)||0, inputs:inputs };
  })};
}

function saveProd(p) {
  var sh = getOrCreateSheet(SHEET_PROD, PROD_HEADERS);
  var id = dec(p.id) || Date.now().toString();
  sh.appendRow([id, dec(p.prid), dec(p.date), dec(p.outPid), dec(p.outNm),
    parseFloat(p.outQty)||0, dec(p.batch), dec(p.notes),
    dec(p.inputsJson), parseFloat(p.totalRMCost)||0]);
  return { ok: true, id: id };
}

function updateProd(p) {
  var sh = getOrCreateSheet(SHEET_PROD, PROD_HEADERS);
  var row = findRowById(sh, dec(p.id));
  if (row < 0) return { ok: false, error: 'Row not found' };
  sh.getRange(row,2).setValue(dec(p.prid));
  sh.getRange(row,3).setValue(dec(p.date));
  sh.getRange(row,4).setValue(dec(p.outPid));
  sh.getRange(row,5).setValue(dec(p.outNm));
  sh.getRange(row,6).setValue(parseFloat(p.outQty)||0);
  sh.getRange(row,7).setValue(dec(p.batch));
  sh.getRange(row,8).setValue(dec(p.notes));
  sh.getRange(row,9).setValue(dec(p.inputsJson));
  sh.getRange(row,10).setValue(parseFloat(p.totalRMCost)||0);
  return { ok: true };
}

function deleteProd(p) {
  var sh = getOrCreateSheet(SHEET_PROD, PROD_HEADERS);
  var row = findRowById(sh, dec(p.id));
  if (row < 0) return { ok: false, error: 'Row not found' };
  sh.deleteRow(row);
  return { ok: true };
}
