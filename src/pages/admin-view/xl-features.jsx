import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const colIndexToName = (n) => {
  let name = "";
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
};

const colNameToIndex = (s) => {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    n = n * 26 + (s.charCodeAt(i) - 64);
  }
  return n - 1;
};

const coordsToCell = (r, c) => `${colIndexToName(c)}${r + 1}`;
const cellToCoords = (cell) => {
  if (!cell) return null;
  const m = /^([A-Z]+)(\d+)$/.exec(String(cell).toUpperCase());
  if (!m) return null;
  const c = colNameToIndex(m[1]);
  const r = parseInt(m[2], 10) - 1;
  return { r, c };
};

const parseRange = (rangeStr) => {
  const parts = rangeStr.split(":");
  if (parts.length === 1) {
    const cell = cellToCoords(parts[0]);
    return cell ? [{ r: cell.r, c: cell.c }] : [];
  }
  const a = cellToCoords(parts[0]);
  const b = cellToCoords(parts[1]);
  if (!a || !b) return [];
  const cells = [];
  const r1 = Math.min(a.r, b.r);
  const r2 = Math.max(a.r, b.r);
  const c1 = Math.min(a.c, b.c);
  const c2 = Math.max(a.c, b.c);
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      cells.push({ r, c });
    }
  }
  return cells;
};

const tokenizeFormula = (formula) => {
  const tokens = [];
  let i = 0;
  const s = String(formula).trim();
  while (i < s.length) {
    const ch = s[i];
    if (ch === " ") {
      i++;
      continue;
    }
    if (/[()+\-*/%,]/.test(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9:_]/.test(s[j])) j++;
      const t = s.slice(i, j);
      tokens.push({ type: "ident", value: t });
      i = j;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      tokens.push({ type: "number", value: parseFloat(s.slice(i, j)) });
      i = j;
      continue;
    }

    i++;
  }
  return tokens;
};

function evaluateFormulaString(formula, getCellValue, cellKey = null, seen = new Set()) {
  if (!formula) return "";
  if (!String(formula).startsWith("=")) return String(formula);

  const expr = String(formula).slice(1).trim();

  if (cellKey) {
    if (seen.has(cellKey)) return "#CYCLE";
  }

  const evalArgRaw = (raw, localSeen) => {
    if (typeof raw !== "string") return Number(raw) || 0;
    const s = raw.trim();

    if (/^[A-Za-z]+\d+(:[A-Za-z]+\d+)?$/.test(s)) {
      if (s.includes(":")) {
        const cells = parseRange(s);
        return cells.map((c) => {
          const key = coordsToCell(c.r, c.c);
          const val = getCellValue(c.r, c.c);
          if (typeof val === "string" && val.startsWith("=")) {
       
            const nextSeen = new Set(localSeen);
            if (cellKey) nextSeen.add(cellKey);
            const ev = evaluateFormulaString(val, getCellValue, key, nextSeen);
            return Number(ev) || 0;
          }
          return Number(val) || 0;
        });
      } else {
        const coords = cellToCoords(s);
        if (!coords) return 0;
        const key = coordsToCell(coords.r, coords.c);
        const val = getCellValue(coords.r, coords.c);
        if (typeof val === "string" && val.startsWith("=")) {
          const nextSeen = new Set(localSeen);
          if (cellKey) nextSeen.add(cellKey);
          return Number(evaluateFormulaString(val, getCellValue, key, nextSeen)) || 0;
        }
        return Number(val) || 0;
      }
    }
  
    if (s.startsWith("=")) {
      const nextSeen = new Set(localSeen);
      if (cellKey) nextSeen.add(cellKey);
      return Number(evaluateFormulaString(s, getCellValue, cellKey, nextSeen)) || 0;
    }
    return Number(s) || 0;
  };

  const funcMatch = /^([A-Za-z]+)\((.*)\)$/.exec(expr);
  if (funcMatch) {
    const fname = funcMatch[1].toUpperCase();
    const inner = funcMatch[2];
    const args = [];
    let depth = 0;
    let cur = "";
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (ch === "(") {
        depth++;
        cur += ch;
      } else if (ch === ")") {
        depth--;
        cur += ch;
      } else if (ch === "," && depth === 0) {
        args.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    if (cur.trim() !== "") args.push(cur.trim());

    const flattened = args.flatMap((a) => {
      const v = evalArgRaw(a, new Set([...(cellKey ? [cellKey] : []) , ...seen]));
      return Array.isArray(v) ? v : [v];
    });

    switch (fname) {
      case "SUM":
        return String(flattened.reduce((s, x) => s + Number(x || 0), 0));
      case "AVERAGE":
        return String(flattened.reduce((s, x) => s + Number(x || 0), 0) / Math.max(1, flattened.length));
      case "MIN":
        return String(Math.min(...flattened.map((n) => Number(n || 0))));
      case "MAX":
        return String(Math.max(...flattened.map((n) => Number(n || 0))));
      case "COUNT":
        return String(flattened.filter((x) => x !== null && x !== "" && !Number.isNaN(Number(x))).length);
      default:
        return "#N/A";
    }
  }

  const replaced = expr.replace(/([A-Za-z]+\d+)/g, (m) => {
    const coords = cellToCoords(m);
    if (!coords) return "0";
    const key = coordsToCell(coords.r, coords.c);
    const raw = getCellValue(coords.r, coords.c);
    if (typeof raw === "string" && raw.startsWith("=")) {
    
      if (cellKey) seen.add(cellKey);
      const v = evaluateFormulaString(raw, getCellValue, key, new Set(seen));
      return Number(v) || 0;
    }
    if (raw === undefined || raw === null || raw === "") return "0";
    if (!isNaN(Number(raw))) return String(Number(raw));

    return `"${String(raw).replace(/"/g, '\\"')}`;
  });

  if (!/^[0-9+\-*/().%,"'\s]+$/.test(replaced)) {
    return "#ERR";
  }
  try {
 
    const fn = new Function(`return (${replaced})`);
    const res = fn();
    if (res === Infinity || res === -Infinity) return "#DIV/0";
    if (Number.isNaN(res)) return "#ERR";
    return String(res);
  } catch (e) {
    return "#ERR";
  }
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nxt = text[i + 1];
    if (ch === '"') {
      if (inQuotes && nxt === '"') {
        cur += '"'; 
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && (ch === ',')) {
      row.push(cur);
      cur = '';
      continue;
    }
    if (!inQuotes && (ch === '\n' || (ch === '\r' && text[i + 1] === '\n'))) {
    
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
      if (ch === '\r' && text[i + 1] === '\n') i++;
      continue;
    }
    cur += ch;
  }

  if (cur !== '' || inQuotes) row.push(cur);
  if (row.length > 0) rows.push(row);
  return rows;
}

export default function XLWorkbook({ rows = 50, cols = 26, storageKey = "xl_workbook_v2" }) {
  const [rowCount, setRowCount] = useState(rows);
  const [colCount, setColCount] = useState(cols);

  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw).data || {};
    } catch (e) {}
    return {};
  });

  const [colWidths, setColWidths] = useState(() => Array(cols).fill(120));
  const [freezeTop, setFreezeTop] = useState(true);
  const [freezeLeft, setFreezeLeft] = useState(true);

  const [sel, setSel] = useState({ r: 0, c: 0, r2: 0, c2: 0, editing: false });
  const [formulaBar, setFormulaBar] = useState("");

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const getKey = (r, c) => coordsToCell(r, c);
  const getRaw = useCallback((r, c) => {
    const k = getKey(r, c);
    return data[k] ? data[k].value : "";
  }, [data]);
  const getCellObj = useCallback((r, c) => {
    const k = getKey(r, c);
    return data[k] || { value: "", format: {} };
  }, [data]);

  const pushHistory = useCallback(() => {
    setHistory((h) => [...h, { data: JSON.parse(JSON.stringify(data)), rowCount, colCount, colWidths: [...colWidths] }]);
    setHistory((h) => (h.length > 100 ? h.slice(h.length - 100) : h));
  }, [data, rowCount, colCount, colWidths]);

  const setCell = useCallback((r, c, value, format) => {
    const k = coordsToCell(r, c);
    pushHistory();
    setFuture([]);
    setData((prev) => {
      const next = { ...prev };
      if (value === "" || value === null || typeof value === 'undefined') {
        delete next[k];
      } else {
        next[k] = { value, format: format || (prev[k] ? prev[k].format : {}) || {} };
      }
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setFuture((f) => [ { data: JSON.parse(JSON.stringify(data)), rowCount, colCount, colWidths: [...colWidths] }, ...f ]);
      setData(last.data || {});
      setRowCount(last.rowCount || rows);
      setColCount(last.colCount || cols);
      setColWidths(last.colWidths || Array(last.colCount || cols).fill(120));
      return h.slice(0, -1);
    });
  }, [data, rowCount, colCount, colWidths, rows, cols]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const nextSnap = f[0];
      setHistory((h) => [...h, { data: JSON.parse(JSON.stringify(data)), rowCount, colCount, colWidths: [...colWidths] }]);
      setData(nextSnap.data || {});
      setRowCount(nextSnap.rowCount || rows);
      setColCount(nextSnap.colCount || cols);
      setColWidths(nextSnap.colWidths || Array(nextSnap.colCount || cols).fill(120));
      return f.slice(1);
    });
  }, [data, rowCount, colCount, colWidths, rows, cols]);

  const evaluateCell = useCallback((r, c) => {
    const raw = getRaw(r, c);
    const k = coordsToCell(r, c);
    if (typeof raw === 'string' && raw.startsWith('=')) {
      return evaluateFormulaString(raw, (rr, cc) => getRaw(rr, cc), k, new Set());
    }
    return raw;
  }, [getRaw]);

  useEffect(() => {
    const payload = { data, rowCount, colCount, colWidths };
    try { localStorage.setItem(storageKey, JSON.stringify(payload)); } catch (e) {}
  }, [data, rowCount, colCount, colWidths, storageKey]);

  useEffect(() => {
    const handler = (e) => {
      if (sel.editing) {
 
        if (e.key === 'Escape') {
          setSel((s) => ({ ...s, editing: false }));
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => ({ ...s, r: Math.min(rowCount - 1, s.r + 1), r2: Math.min(rowCount - 1, s.r2 + 1) }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => ({ ...s, r: Math.max(0, s.r - 1), r2: Math.max(0, s.r2 - 1) }));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSel((s) => ({ ...s, c: Math.max(0, s.c - 1), c2: Math.max(0, s.c2 - 1) }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSel((s) => ({ ...s, c: Math.min(colCount - 1, s.c + 1), c2: Math.min(colCount - 1, s.c2 + 1) }));
      } else if (e.key === 'Enter') {
        e.preventDefault();
 
        setSel((s) => ({ ...s, editing: true }));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setSel((s) => {
          const dir = e.shiftKey ? -1 : 1;
          const nc = Math.min(colCount - 1, Math.max(0, s.c + dir));
          return { ...s, c: nc, c2: nc };
        });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelectionToClipboard();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteFromClipboard();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
 
        const { r, c, r2, c2 } = sel;
        const rr1 = Math.min(r, r2);
        const rr2 = Math.max(r, r2);
        const cc1 = Math.min(c, c2);
        const cc2 = Math.max(c, c2);
        pushHistory();
        setData((prev) => {
          const next = { ...prev };
          for (let rr = rr1; rr <= rr2; rr++) {
            for (let cc = cc1; cc <= cc2; cc++) {
              delete next[coordsToCell(rr, cc)];
            }
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sel, rowCount, colCount, undo, redo, pushHistory]);


  const exportCSV = useCallback(() => {
  
    let maxR = 0;
    let maxC = 0;
    Object.keys(data).forEach((k) => {
      const coords = cellToCoords(k);
      if (!coords) return;
      maxR = Math.max(maxR, coords.r);
      maxC = Math.max(maxC, coords.c);
    });
    maxR = Math.max(maxR, rowCount - 1);
    maxC = Math.max(maxC, colCount - 1);
    const lines = [];
    for (let r = 0; r <= maxR; r++) {
      const colsA = [];
      for (let c = 0; c <= maxC; c++) {
        const v = getRaw(r, c);
        if (v === undefined || v === null) colsA.push("");
        else {
          const s = String(v);
        
          if (/[,"\n\r]/.test(s)) colsA.push(`"${s.replace(/"/g, '""')}"`);
          else colsA.push(s);
        }
      }
      lines.push(colsA.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sheet.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [data, rowCount, colCount, getRaw]);

  const importCSV = useCallback((text) => {
    const parsed = parseCSV(text);
    const next = {};
    for (let r = 0; r < parsed.length; r++) {
      for (let c = 0; c < parsed[r].length; c++) {
        const v = parsed[r][c];
        if (v !== '') next[coordsToCell(r, c)] = { value: v };
      }
    }
    pushHistory();
    setFuture([]);
    setData(next);
    setRowCount(Math.max(rowCount, parsed.length));
    setColCount(Math.max(colCount, parsed[0] ? parsed[0].length : colCount));
  }, [pushHistory, rowCount, colCount]);

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => importCSV(String(ev.target.result));
    reader.readAsText(f);
    e.target.value = null;
  };

  const copySelectionToClipboard = useCallback(async () => {
    const { r, c, r2, c2 } = sel;
    const rr1 = Math.min(r, r2);
    const rr2 = Math.max(r, r2);
    const cc1 = Math.min(c, c2);
    const cc2 = Math.max(c, c2);
    const lines = [];
    for (let rr = rr1; rr <= rr2; rr++) {
      const cols = [];
      for (let cc = cc1; cc <= cc2; cc++) {
        const v = getRaw(rr, cc) || '';
        cols.push(String(v));
      }
      lines.push(cols.join('\t'));
    }
    const txt = lines.join('\n');
    try {
      await navigator.clipboard.writeText(txt);
    } catch (e) {
      const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
  }, [sel, getRaw]);

  const pasteFromClipboard = useCallback(async () => {
    let txt = '';
    try {
      txt = await navigator.clipboard.readText();
    } catch (e) {
      txt = prompt('Paste data here (tab/CSV)');
    }
    if (!txt) return;
    const rowsTxt = txt.split(/\r?\n/).filter((l) => l.length > 0);
    const rr1 = sel.r;
    const cc1 = sel.c;
    pushHistory();
    setFuture([]);
    setData((prev) => {
      const next = { ...prev };
      for (let i = 0; i < rowsTxt.length; i++) {
        const cols = rowsTxt[i].split(/\t|,/);
        for (let j = 0; j < cols.length; j++) {
          const rpos = rr1 + i;
          const cpos = cc1 + j;
          if (rpos >= 0 && cpos >= 0) {
            next[coordsToCell(rpos, cpos)] = { value: cols[j] };
          }
        }
      }
      return next;
    });
  }, [sel, pushHistory]);

  const addRow = useCallback((index = rowCount) => {
    pushHistory(); setFuture([]);
    const next = {};
    Object.keys(data).forEach((k) => {
      const coords = cellToCoords(k); if (!coords) return; let { r, c } = coords; if (r >= index) r += 1; next[coordsToCell(r, c)] = data[k];
    });
    setData(next); setRowCount((s) => s + 1);
  }, [data, pushHistory, rowCount]);

  const removeRow = useCallback((index = rowCount - 1) => {
    pushHistory(); setFuture([]);
    const next = {};
    Object.keys(data).forEach((k) => {
      const coords = cellToCoords(k); if (!coords) return; let { r, c } = coords; if (r === index) return; if (r > index) r -= 1; next[coordsToCell(r, c)] = data[k];
    });
    setData(next); setRowCount((s) => Math.max(1, s - 1));
  }, [data, pushHistory, rowCount]);

  const addCol = useCallback((index = colCount) => {
    pushHistory(); setFuture([]);
    const next = {};
    Object.keys(data).forEach((k) => {
      const coords = cellToCoords(k); if (!coords) return; let { r, c } = coords; if (c >= index) c += 1; next[coordsToCell(r, c)] = data[k];
    });
    setData(next); setColCount((s) => s + 1); setColWidths((w) => { const copy = [...w]; copy.splice(index, 0, 120); return copy; });
  }, [data, pushHistory, colCount]);

  const removeCol = useCallback((index = colCount - 1) => {
    pushHistory(); setFuture([]);
    const next = {};
    Object.keys(data).forEach((k) => {
      const coords = cellToCoords(k); if (!coords) return; let { r, c } = coords; if (c === index) return; if (c > index) c -= 1; next[coordsToCell(r, c)] = data[k];
    });
    setData(next); setColCount((s) => Math.max(1, s - 1)); setColWidths((w) => { const copy = [...w]; copy.splice(index, 1); return copy; });
  }, [data, pushHistory, colCount]);

  // sort selected column
  const sortColumn = useCallback((direction = 'asc') => {
    const c = sel.c;
    const rowsArr = [];
    for (let r = 0; r < rowCount; r++) {
      const v = getRaw(r, c);
      rowsArr.push({ r, v });
    }
    rowsArr.sort((a, b) => {
      const av = a.v === undefined ? '' : a.v;
      const bv = b.v === undefined ? '' : b.v;
      if (!isNaN(Number(av)) && !isNaN(Number(bv))) return direction === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
      return direction === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    const next = {};
    for (let r = 0; r < rowsArr.length; r++) {
      for (let c2 = 0; c2 < colCount; c2++) {
        const oldKey = coordsToCell(rowsArr[r].r, c2);
        const newKey = coordsToCell(r, c2);
        if (data[oldKey]) next[newKey] = data[oldKey];
      }
    }
    pushHistory(); setFuture([]); setData(next);
  }, [sel, rowCount, colCount, data, getRaw, pushHistory]);

  const startResize = useCallback((index, startX) => {
    const initial = colWidths[index] || 120;
    const onMove = (e) => {
      const dx = e.clientX - startX;
      setColWidths((w) => { const copy = [...w]; copy[index] = Math.max(40, initial + dx); return copy; });
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, [colWidths]);

  const toggleFormat = useCallback((fmt) => {
    const { r, c, r2, c2 } = sel;
    const rr1 = Math.min(r, r2); const rr2 = Math.max(r, r2);
    const cc1 = Math.min(c, c2); const cc2 = Math.max(c, c2);
    pushHistory(); setFuture([]);
    setData((prev) => {
      const next = { ...prev };
      for (let rr = rr1; rr <= rr2; rr++) {
        for (let cc = cc1; cc <= cc2; cc++) {
          const k = coordsToCell(rr, cc);
          const cur = next[k] ? { ...next[k] } : { value: '' , format: {} };
          cur.format = { ...(cur.format || {}) };
          cur.format[fmt] = !cur.format[fmt];
          next[k] = cur;
        }
      }
      return next;
    });
  }, [sel, pushHistory]);

  const clearAll = useCallback(() => { pushHistory(); setFuture([]); setData({}); setRowCount(rows); setColCount(cols); setColWidths(Array(cols).fill(120)); }, [pushHistory, rows, cols]);

  const saveToFile = useCallback(() => {
    const obj = { rowCount, colCount, colWidths, data };
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'xl-workbook.json'; a.click(); URL.revokeObjectURL(url);
  }, [rowCount, colCount, colWidths, data]);

  const loadFromFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target.result));
        if (parsed) {
          pushHistory(); setFuture([]);
          setData(parsed.data || {});
          setRowCount(parsed.rowCount || rows);
          setColCount(parsed.colCount || cols);
          setColWidths(parsed.colWidths || Array(parsed.colCount || cols).fill(120));
        }
      } catch (e) { alert('Invalid file'); }
    };
    reader.readAsText(file);
  }, [pushHistory, rows, cols]);

  useEffect(() => {
    if (sel.editing && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.select();
      setFormulaBar(getRaw(sel.r, sel.c));
    }
  }, [sel.editing, sel.r, sel.c, getRaw]);

  const onCellDoubleClick = (r, c) => setSel({ r, c, r2: r, c2: c, editing: true });
  const onCellClick = (r, c, e) => {
    if (e.shiftKey) setSel((s) => ({ ...s, r2: r, c2: c }));
    else { setSel({ r, c, r2: r, c2: c, editing: false }); setFormulaBar(getRaw(r, c)); }
  };

  const onEditorCommit = () => {
    setSel((s) => ({ ...s, editing: false }));
    setCell(sel.r, sel.c, formulaBar);
  };

  const headers = useMemo(() => Array.from({ length: colCount }).map((_, i) => colIndexToName(i)), [colCount]);

  function Cell({ r, c }) {
    const key = coordsToCell(r, c);
    const cellObj = data[key] || { value: '', format: {} };
    const raw = cellObj.value;
    const editing = sel.editing && sel.r === r && sel.c === c;
    const selected = r >= Math.min(sel.r, sel.r2) && r <= Math.max(sel.r, sel.r2) && c >= Math.min(sel.c, sel.c2) && c <= Math.max(sel.c, sel.c2);
    const display = useMemo(() => {
      if (typeof raw === 'string' && raw.startsWith('=')) return evaluateCell(r, c);
      return raw;
    }, [raw, r, c, data]);

    const style = { width: colWidths[c] || 120, minWidth: colWidths[c] || 120 };
    const className = `border border-gray-200 relative p-2 min-h-[36px] overflow-hidden ${selected ? 'bg-blue-50' : 'bg-white'}`;

    const cellStyle = { ...style };
    if (freezeLeft && c === 0) {
      cellStyle.position = 'sticky'; cellStyle.left = 0; cellStyle.zIndex = 5; cellStyle.background = selected ? '#eef2ff' : '#fff';
      cellStyle.boxShadow = '2px 0 0 rgba(0,0,0,0.03)';
    }

    return (
      <div
        onDoubleClick={() => onCellDoubleClick(r, c)}
        onClick={(e) => onCellClick(r, c, e)}
        className={className}
        style={cellStyle}
      >
        {editing ? (
          <input
            ref={editorRef}
            value={formulaBar}
            onChange={(e) => setFormulaBar(e.target.value)}
            onBlur={onEditorCommit}
            onKeyDown={(ev) => { if (ev.key === 'Enter') onEditorCommit(); }}
            className="w-full h-full outline-none"
          />
        ) : (
          <div className="text-sm select-none whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontWeight: cellObj.format?.bold ? 700 : 400, fontStyle: cellObj.format?.italic ? 'italic' : 'normal' }}>
            {display}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setSel((s) => ({ ...s, editing: true }))}>Edit</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => addRow()}>Add Row</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => removeRow()}>Remove Row</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => addCol()}>Add Col</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => removeCol()}>Remove Col</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={copySelectionToClipboard}>Copy</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={pasteFromClipboard}>Paste</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={exportCSV}>Export CSV</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => fileInputRef.current?.click()}>Import CSV</button>
        <input type="file" accept=".csv,.txt" ref={fileInputRef} onChange={onFile} className="hidden" />
        <button className="px-3 py-1 rounded bg-gray-100" onClick={undo}>Undo</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={redo}>Redo</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setFreezeTop((v) => !v)}>{freezeTop ? 'Unfreeze Top' : 'Freeze Top'}</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setFreezeLeft((v) => !v)}>{freezeLeft ? 'Unfreeze Left' : 'Freeze Left'}</button>
        <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={clearAll}>Clear</button>

        <div className="ml-auto flex items-center gap-2">
          <button className="px-2 py-1 rounded border" onClick={() => sortColumn('asc')}>Sort ↑</button>
          <button className="px-2 py-1 rounded border" onClick={() => sortColumn('desc')}>Sort ↓</button>
          <button className="px-2 py-1 rounded border" onClick={saveToFile}>Save</button>
          <input type="file" accept="application/json" onChange={(e) => e.target.files && loadFromFile(e.target.files[0])} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button className="px-2 py-1 rounded border" onClick={() => toggleFormat('bold')}>B</button>
        <button className="px-2 py-1 rounded border" onClick={() => toggleFormat('italic')}>I</button>
        <button className="px-2 py-1 rounded border" onClick={() => toggleFormat('number')}>Number</button>
        <button className="px-2 py-1 rounded border" onClick={() => toggleFormat('currency')}>Currency</button>
      </div>

      <div className="flex gap-2 items-center mb-2">
        <div className="px-3 py-1 rounded bg-gray-100">{coordsToCell(sel.r, sel.c)}</div>
        <input
          className="flex-1 px-3 py-2 rounded border"
          value={sel.editing ? formulaBar : (getRaw(sel.r, sel.c) || '')}
          onChange={(e) => setFormulaBar(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onEditorCommit(); } }}
        />
      </div>

      <div className="border rounded overflow-auto" style={{ maxHeight: '70vh' }}>
        <div style={{ minWidth: colCount * 100 + 120 }}>
      
          <div className="flex sticky top-0 bg-white z-20" style={{ position: 'sticky', top: 0 }}>
            <div className="w-16 border-r border-b p-2 bg-gray-50" style={{ position: freezeLeft ? 'sticky' : 'static', left: freezeLeft ? 0 : 'auto', zIndex: 25 }}>{/* corner */}</div>
            {headers.map((h, idx) => (
              <div key={h} className="border-r border-b p-2 flex items-center justify-between" style={{ width: colWidths[idx] || 120, minWidth: colWidths[idx] || 120, position: 'relative', zIndex: 15 }}>
                <div className="text-sm font-medium">{h}</div>
                <div
                  onMouseDown={(e) => startResize(idx, e.clientX)}
                  className="w-2 h-full cursor-col-resize"
                  title="Drag to resize"
                />
              </div>
            ))}
          </div>

         
          {Array.from({ length: rowCount }).map((_, r) => (
            <div className="flex" key={r}>
              <div className="w-16 border-r border-b p-2 bg-gray-50 text-sm" style={{ position: freezeLeft ? 'sticky' : 'static', left: freezeLeft ? 0 : 'auto', zIndex: 10 }}>{r + 1}</div>
              {Array.from({ length: colCount }).map((__, c) => (
                <Cell key={`${r}-${c}`} r={r} c={c} />
              ))}
            </div>
          ))}
        </div>
      </div>

      
      <div className="mt-2 text-sm text-gray-600">
        {Object.keys(data).length} cells used • {rowCount} rows × {colCount} cols
      </div>

      <div className="mt-4 text-xs text-gray-500">Hints: double-click a cell to edit, use =SUM(A1:A10), =A1+10, import/export CSV. For heavy XLSX features add SheetJS.</div>
    </div>
  );
}
