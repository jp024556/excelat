import { useState, useMemo, useCallback } from "react";
import { Excelat, ExcelatData, CellRange, getColumnLabel, getRowLabel } from "@excelat/react";
import { RotateCcw, Table, Keyboard, Sparkles, Check, Copy } from "lucide-react";
import "./App.css";

const INITIAL_DATA: ExcelatData = [
  ["Name", "Age", "City", "Salary", "Active", "Department"],
  ["Jay", 30, "BLR", 2200000, true, "Engineering"],
  ["Rahul", 28, "Delhi", 1800000, true, "Design"],
  ["Amit", 32, "Mumbai", 2500000, false, "Product"],
  ["Priya", 26, "Hyderabad", 1950000, true, "Engineering"],
  ["Neha", 31, "Pune", 2100000, true, "Analytics"],
  ["Karan", 29, "Chennai", 1750000, false, "Marketing"],
  ["Ananya", 27, "Bangalore", 2400000, true, "Engineering"],
];

export function App() {
  const [data, setData] = useState<ExcelatData>(INITIAL_DATA);
  const [selection, setSelection] = useState<CellRange>({
    startRow: 1,
    startColumn: 0,
    endRow: 1,
    endColumn: 0,
  });
  const [copiedNotification, setCopiedNotification] = useState(false);

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

  const activeCellValue = data[selection.startRow]?.[selection.startColumn] ?? "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`import { Excelat } from "@excelat/react";\nimport "@excelat/react/dist/style.css";\n\nfunction App() {\n  return <Excelat data={data} rows={50} columns={16} />;\n}`);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="demo-page">
      {/* Top Banner */}
      <header className="demo-header">
        <div className="demo-brand">
          <div className="demo-logo-wrap">
            <Table className="demo-logo-icon" size={22} />
          </div>
          <div>
            <div className="demo-title-row">
              <h1 className="demo-title">Excelat</h1>
              <span className="demo-badge">V0.1</span>
            </div>
            <p className="demo-subtitle">Excel-like tables for modern web apps</p>
          </div>
        </div>

        <div className="demo-actions">
          <button className="demo-btn demo-btn-secondary" onClick={handleCopyCode}>
            {copiedNotification ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedNotification ? "Copied snippet!" : "npm install @excelat/react"}</span>
          </button>
          <button className="demo-btn demo-btn-primary" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Main Grid Card */}
      <main className="demo-main">
        <div className="demo-grid-card">
          {/* Formula / Coordinate Bar */}
          <div className="demo-formula-bar">
            <div className="demo-name-box" title="Active Cell">
              {activeCoordText}
            </div>
            <div className="demo-fx-label">fx</div>
            <div className="demo-fx-input" title="Cell value">
              {activeCellValue !== null ? String(activeCellValue) : ""}
            </div>
          </div>

          {/* Excelat Component Viewport */}
          <div className="demo-spreadsheet-container">
            <Excelat
              data={data}
              rows={40}
              columns={15}
              onChange={setData}
              onSelectionChange={setSelection}
            />
          </div>

          {/* Status Bar */}
          <div className="demo-status-bar">
            <div className="status-left">
              <span className="status-indicator" />
              <span>Ready</span>
              <span className="status-sep">|</span>
              <span className="status-range">{rangeCoordText}</span>
              <span className="status-count">
                ({stats.count} {stats.count === 1 ? "cell" : "cells"} selected)
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
            <h2>Keyboard Navigation & Shortcuts</h2>
            <span className="shortcuts-hint">Spreadsheet interactions built from scratch</span>
          </div>

          <div className="shortcuts-grid">
            <div className="shortcut-card">
              <h3>Navigation</h3>
              <ul>
                <li><kbd>Arrow Keys</kbd> Move selection up / down / left / right</li>
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
                <li><kbd>Type</kbd> Start typing to replace cell value</li>
                <li><kbd>Double Click</kbd> or <kbd>F2</kbd> Edit cell</li>
                <li><kbd>Enter</kbd> Commit and move down</li>
                <li><kbd>Escape</kbd> Cancel changes</li>
              </ul>
            </div>

            <div className="shortcut-card">
              <h3>Clipboard & History</h3>
              <ul>
                <li><kbd>Ctrl/Cmd + C</kbd> Copy range as TSV</li>
                <li><kbd>Ctrl/Cmd + V</kbd> Paste matrix from clipboard</li>
                <li><kbd>Ctrl/Cmd + X</kbd> Cut selected cells</li>
                <li><kbd>Ctrl/Cmd + Z</kbd> / <kbd>Y</kbd> Undo / Redo</li>
                <li><kbd>Delete</kbd> / <kbd>Backspace</kbd> Clear cells</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Developer Experience / Quick Start snippet */}
        <section className="demo-code-section">
          <div className="code-header">
            <Sparkles size={16} />
            <span>Dead Simple Integration</span>
          </div>
          <pre className="code-block">
{`import { Excelat } from "@excelat/react";
import "@excelat/react/dist/style.css";

const data = [
  ["Jay", 30, "Bangalore"],
  ["Rahul", 28, "Delhi"],
  ["Amit", 32, "Mumbai"],
];

function App() {
  return (
    <Excelat
      data={data}
      rows={100}
      columns={20}
      onChange={(nextData) => console.log(nextData)}
    />
  );
}`}
          </pre>
        </section>
      </main>
    </div>
  );
}

export default App;
