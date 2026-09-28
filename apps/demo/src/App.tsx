import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Excelat,
  ExcelatData,
  CellRange,
  ExcelatMode,
  SelectionStyle,
  ExcelatColumn,
  ExcelatRef,
  getColumnLabel,
  getRowLabel,
} from "@excelat/react";
import {
  RotateCcw,
  Table as TableIcon,
  Sheet,
  Keyboard,
  Check,
  Copy,
  Sliders,
  MoveHorizontal,
  Code2,
  Undo2,
  Redo2,
  Plus,
  Trash2,
} from "lucide-react";
import "./App.css";

const INITIAL_DATA: ExcelatData = [
  ["Jay", 30, "Bangalore", 2200000, true, "Engineering"],
  ["Rahul", 28, "Delhi", 1800000, true, "Design"],
  ["Amit", 32, "Mumbai", 2500000, false, "Product"],
  ["Priya", 26, "Hyderabad", 1950000, true, "Engineering"],
  ["Neha", 31, "Pune", 2100000, true, "Analytics"],
  ["Karan", 29, "Chennai", 1750000, false, "Marketing"],
  ["Ananya", 27, "Bangalore", 2400000, true, "Engineering"],
];

const TABLE_COLUMNS: ExcelatColumn[] = [
  { header: "Name", width: 120, type: "text" },
  { header: "Age", width: 80, type: "number" },
  { header: "City", width: 130, type: "text" },
  { header: "Salary (INR)", width: 140, type: "number" },
  {
    header: "Status",
    width: 100,
    type: "boolean",
    render: ({ value }) => (
      <span className={`status-pill ${value ? "pill-active" : "pill-inactive"}`}>
        {value ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    header: "Department",
    width: 150,
    type: "text",
    render: ({ value }) => (
      <span className="dept-tag">{String(value || "")}</span>
    ),
  },
];

export function App() {
  const gridRef = useRef<ExcelatRef>(null);
  const [data, setData] = useState<ExcelatData>(INITIAL_DATA);
  const [mode, setMode] = useState<ExcelatMode>("spreadsheet");
  const [selectionStyle, setSelectionStyle] = useState<SelectionStyle>("excel");
  const [showRowNumbers, setShowRowNumbers] = useState<boolean>(true);
  const [showColumnLetters, setShowColumnLetters] = useState<boolean>(true);
  const [showFormulaBar, setShowFormulaBar] = useState<boolean>(true);
  const [selection, setSelection] = useState<CellRange>({
    startRow: 0,
    startColumn: 0,
    endRow: 0,
    endColumn: 0,
  });
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    rowIndex: number;
    columnIndex: number;
  } | null>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Switch presets cleanly when mode changes
  const handleModeChange = (newMode: ExcelatMode) => {
    setMode(newMode);
    if (newMode === "table") {
      setSelectionStyle("subtle");
      setShowRowNumbers(false);
      setShowColumnLetters(false);
      setShowFormulaBar(false);
    } else {
      setSelectionStyle("excel");
      setShowRowNumbers(true);
      setShowColumnLetters(true);
      setShowFormulaBar(true);
    }
  };

  const handleReset = useCallback(() => {
    setData(INITIAL_DATA);
  }, []);

  // Compute selection stats
  const stats = useMemo(() => {
    let count = 0;
    let numericCount = 0;
    let sum = 0;

    for (let r = selection.startRow; r <= selection.endRow; r++) {
      for (let c = selection.startColumn; c <= selection.endColumn; c++) {
        count++;
        const val = data[r]?.[c];
        if (typeof val === "number") {
          sum += val;
          numericCount++;
        }
      }
    }

    const average = numericCount > 0 ? (sum / numericCount).toFixed(1) : null;
    return { count, numericCount, sum, average };
  }, [selection, data]);

  const activeCoordText = `${getColumnLabel(selection.startColumn)}${getRowLabel(selection.startRow)}`;
  const rangeCoordText =
    selection.startRow === selection.endRow &&
    selection.startColumn === selection.endColumn
      ? activeCoordText
      : `${activeCoordText}:${getColumnLabel(selection.endColumn)}${getRowLabel(selection.endRow)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(
      mode === "table"
        ? `<Excelat\n  data={data}\n  mode="table"\n  columns={[\n    { header: "Name", type: "text" },\n    { header: "Age", type: "number" },\n    { header: "City", type: "text" },\n    {\n      header: "Status",\n      render: ({ value }) => <StatusBadge active={value} />\n    }\n  ]}\n/>`
        : `<Excelat\n  data={data}\n  rows={50}\n  columns={16}\n  showFormulaBar={true}\n/>`
    );
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="demo-page">
      {/* Top Banner */}
      <header className="demo-header">
        <div className="demo-brand">
          <div className="demo-logo-wrap">
            {mode === "spreadsheet" ? <Sheet size={22} /> : <TableIcon size={22} />}
          </div>
          <div>
            <div className="demo-title-row">
              <h1 className="demo-title">Excelat</h1>
              <span className="demo-badge">V0.1</span>
            </div>
            <p className="demo-subtitle">
              Excel-like interaction underneath, normal table appearance when you want it.
            </p>
          </div>
        </div>

        <div className="demo-actions">
          <button className="demo-btn demo-btn-secondary" onClick={handleCopyCode}>
            {copiedNotification ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedNotification ? "Copied snippet!" : "Copy React Code"}</span>
          </button>
          <button className="demo-btn demo-btn-primary" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Reset Data</span>
          </button>
        </div>
      </header>

      {/* Control Panel: Visual Modes, Selection Styles & Header Options */}
      <section className="demo-control-panel">
        <div className="control-group">
          <div className="control-label">
            <Sliders size={15} />
            <span>Visual Mode</span>
          </div>
          <div className="mode-toggle-group">
            <button
              className={`toggle-option ${mode === "spreadsheet" ? "active" : ""}`}
              onClick={() => handleModeChange("spreadsheet")}
            >
              <Sheet size={14} />
              <span>Spreadsheet</span>
            </button>
            <button
              className={`toggle-option ${mode === "table" ? "active" : ""}`}
              onClick={() => handleModeChange("table")}
            >
              <TableIcon size={14} />
              <span>Normal Table</span>
            </button>
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">Selection Treatment</span>
          <div className="selection-style-group">
            {(["excel", "subtle", "none"] as SelectionStyle[]).map((style) => (
              <button
                key={style}
                className={`style-btn ${selectionStyle === style ? "active" : ""}`}
                onClick={() => setSelectionStyle(style)}
              >
                {style === "excel" ? "Excel Accent" : style === "subtle" ? "Subtle Border" : "Hidden (None)"}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group checkboxes-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showRowNumbers}
              onChange={(e) => setShowRowNumbers(e.target.checked)}
            />
            <span>Row Numbers</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showColumnLetters}
              onChange={(e) => setShowColumnLetters(e.target.checked)}
            />
            <span>Column Letters</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showFormulaBar}
              onChange={(e) => setShowFormulaBar(e.target.checked)}
            />
            <span>Formula Bar</span>
          </label>
        </div>
      </section>

      {/* Grid Operations Toolbar */}
      <section className="demo-toolbar">
        <div className="demo-toolbar-group">
          <button
            className="demo-tool-btn"
            title="Undo (Ctrl+Z)"
            onClick={() => gridRef.current?.undo()}
          >
            <Undo2 size={13} />
            <span>Undo</span>
          </button>
          <button
            className="demo-tool-btn"
            title="Redo (Ctrl+Y)"
            onClick={() => gridRef.current?.redo()}
          >
            <Redo2 size={13} />
            <span>Redo</span>
          </button>
          <div className="demo-tool-sep" />
          <button
            className="demo-tool-btn"
            title="Insert row below active cell"
            onClick={() => gridRef.current?.insertRow()}
          >
            <Plus size={13} />
            <span>Insert Row</span>
          </button>
          <button
            className="demo-tool-btn"
            title="Delete active row"
            onClick={() => gridRef.current?.deleteRow()}
          >
            <Trash2 size={13} />
            <span>Delete Row</span>
          </button>
          <div className="demo-tool-sep" />
          <button
            className="demo-tool-btn"
            title="Insert column right of active cell"
            onClick={() => gridRef.current?.insertColumn()}
          >
            <Plus size={13} />
            <span>Insert Col</span>
          </button>
          <button
            className="demo-tool-btn"
            title="Delete active column"
            onClick={() => gridRef.current?.deleteColumn()}
          >
            <Trash2 size={13} />
            <span>Delete Col</span>
          </button>
        </div>

        <div className="demo-toolbar-group">
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Tip: Right-click any cell for context actions
          </span>
        </div>
      </section>

      {/* Main Grid Viewport */}
      <main className="demo-main">
        <div className="demo-grid-card">
          <div className="demo-spreadsheet-container">
            <Excelat
              ref={gridRef}
              data={data}
              mode={mode}
              columns={mode === "table" ? TABLE_COLUMNS : 15}
              rows={mode === "table" ? 25 : 35}
              selectionStyle={selectionStyle}
              showRowNumbers={showRowNumbers}
              showColumnLetters={showColumnLetters}
              showFormulaBar={showFormulaBar}
              onChange={setData}
              onSelectionChange={setSelection}
              onContextMenu={(e, ctx) => {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  rowIndex: ctx.rowIndex,
                  columnIndex: ctx.columnIndex,
                });
              }}
            />
          </div>

          {/* Context Menu */}
          {contextMenu && (
            <div
              className="demo-context-menu"
              style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="demo-context-item"
                onClick={() => {
                  gridRef.current?.copy();
                  setContextMenu(null);
                }}
              >
                <span>Copy</span>
                <span className="demo-context-shortcut">Ctrl+C</span>
              </button>
              <button
                className="demo-context-item"
                onClick={() => {
                  gridRef.current?.paste();
                  setContextMenu(null);
                }}
              >
                <span>Paste</span>
                <span className="demo-context-shortcut">Ctrl+V</span>
              </button>
              <button
                className="demo-context-item"
                onClick={() => {
                  gridRef.current?.cut();
                  setContextMenu(null);
                }}
              >
                <span>Cut</span>
                <span className="demo-context-shortcut">Ctrl+X</span>
              </button>
              <div className="demo-context-sep" />
              <button
                className="demo-context-item"
                onClick={() => {
                  gridRef.current?.insertRow(contextMenu.rowIndex);
                  setContextMenu(null);
                }}
              >
                <span>Insert Row Here</span>
              </button>
              <button
                className="demo-context-item"
                onClick={() => {
                  gridRef.current?.deleteRow(contextMenu.rowIndex);
                  setContextMenu(null);
                }}
              >
                <span>Delete This Row</span>
              </button>
              <div className="demo-context-sep" />
              <button
                className="demo-context-item"
                onClick={() => {
                  gridRef.current?.insertColumn(contextMenu.columnIndex);
                  setContextMenu(null);
                }}
              >
                <span>Insert Column Here</span>
              </button>
              <button
                className="demo-context-item"
                onClick={() => {
                  gridRef.current?.deleteColumn(contextMenu.columnIndex);
                  setContextMenu(null);
                }}
              >
                <span>Delete This Column</span>
              </button>
            </div>
          )}

          {/* Status Bar */}
          <div className="demo-status-bar">
            <div className="status-left">
              <span className="status-indicator" />
              <span>{mode === "table" ? "Table Mode Active" : "Spreadsheet Mode Active"}</span>
              <span className="status-sep">|</span>
              <span className="status-range">{rangeCoordText}</span>
              <span className="status-count">
                ({stats.count} {stats.count === 1 ? "cell" : "cells"} selected)
              </span>
              <span className="status-sep">|</span>
              <span className="status-hint">
                <MoveHorizontal size={13} style={{ verticalAlign: "middle", marginRight: "3px" }} />
                Drag header edge to resize columns
              </span>
            </div>
            <div className="status-right">
              {stats.numericCount > 0 && (
                <>
                  <span className="status-stat">
                    Sum: <strong>{stats.sum.toLocaleString()}</strong>
                  </span>
                  <span className="status-sep">|</span>
                  <span className="status-stat">
                    Average: <strong>{stats.average}</strong>
                  </span>
                  <span className="status-sep">|</span>
                  <span className="status-stat">
                    Count: <strong>{stats.numericCount}</strong>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <section className="demo-shortcuts-section">
          <div className="shortcuts-header">
            <Keyboard size={18} className="shortcuts-icon" />
            <h2>Spreadsheet Navigation & Keyboard Shortcuts</h2>
            <span className="shortcuts-hint">Full keyboard support works in both Table and Spreadsheet modes</span>
          </div>

          <div className="shortcuts-grid">
            <div className="shortcut-card">
              <h3>Navigation</h3>
              <ul>
                <li><kbd>Arrow Keys</kbd> Move selection</li>
                <li><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> Move right / left</li>
                <li><kbd>Enter</kbd> / <kbd>Shift+Enter</kbd> Move down / up</li>
                <li><kbd>Home</kbd> / <kbd>End</kbd> Jump to start / end of row</li>
              </ul>
            </div>

            <div className="shortcut-card">
              <h3>Range Selection</h3>
              <ul>
                <li><kbd>Shift + Arrows</kbd> Expand rectangular range</li>
                <li><kbd>Mouse Drag</kbd> Click and drag across cells</li>
                <li><kbd>Headers</kbd> Click column / row header to select</li>
                <li><kbd>Corner</kbd> Click top-left corner to select all</li>
              </ul>
            </div>

            <div className="shortcut-card">
              <h3>Editing</h3>
              <ul>
                <li><kbd>Type any key</kbd> Replace existing value</li>
                <li><kbd>Double Click</kbd> or <kbd>F2</kbd> Edit cell</li>
                <li><kbd>Enter</kbd> / <kbd>Tab</kbd> Commit and move</li>
                <li><kbd>Escape</kbd> Cancel changes</li>
              </ul>
            </div>

            <div className="shortcut-card">
              <h3>Clipboard & Resizing</h3>
              <ul>
                <li><kbd>Ctrl/Cmd + C</kbd> Copy range as TSV</li>
                <li><kbd>Ctrl/Cmd + V</kbd> Paste matrix from clipboard</li>
                <li><kbd>Ctrl/Cmd + Z</kbd> / <kbd>Y</kbd> Undo / Redo</li>
                <li><kbd>Header Boundary</kbd> Drag to resize column / row</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Integration Examples */}
        <section className="demo-code-section">
          <div className="code-header">
            <Code2 size={16} />
            <span>Usage Examples</span>
          </div>
          <div className="code-grid">
            <div>
              <div className="code-subtitle">Table Mode with Column Headers</div>
              <pre className="code-block">
{`<Excelat
  data={data}
  mode="table"
  columns={[
    { header: "Name" },
    { header: "Age" },
    { header: "City" }
  ]}
/>`}
              </pre>
            </div>
            <div>
              <div className="code-subtitle">Classic Spreadsheet Mode</div>
              <pre className="code-block">
{`<Excelat
  data={data}
  mode="spreadsheet"
  rows={100}
  columns={20}
  selectionStyle="excel"
  showFormulaBar={true}
/>`}
              </pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
