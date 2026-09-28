import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Excelat,
  ExcelatData,
  CellRange,
  ExcelatMode,
  SelectionStyle,
  ExcelatColumn,
  ExcelatRef,
  ExcelatOperation,
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
  Zap,
  Layers,
  Database,
  Terminal,
} from "lucide-react";
import "./App.css";

type DemoScenario = "standard" | "virtualization" | "pagination" | "infinite";

const INITIAL_DATA: ExcelatData = [
  ["Jay", 30, "Bangalore", 2200000, "Active", "Engineering"],
  ["Rahul", 28, "Delhi", 1800000, "Active", "Design"],
  ["Amit", 32, "Mumbai", 2500000, "Inactive", "Product"],
  ["Priya", 26, "Hyderabad", 1950000, "Active", "Engineering"],
  ["Neha", 31, "Pune", 2100000, "Active", "Analytics"],
  ["Karan", 29, "Chennai", 1750000, "Inactive", "Marketing"],
  ["Ananya", 27, "Bangalore", 2400000, "Active", "Engineering"],
];

const TABLE_COLUMNS: ExcelatColumn[] = [
  { header: "Name", width: 120, type: "text" },
  { header: "Age", width: 80, type: "number" },
  { header: "City", width: 130, type: "text" },
  { header: "Salary (INR)", width: 140, type: "number" },
  { header: "Status", width: 100, type: "text" },
  { header: "Department", width: 150, type: "text" },
];

// Generate 10,000 rows for virtualization demonstration
function generateVirtualData(count = 10000): ExcelatData {
  const cities = ["Bangalore", "Delhi", "Mumbai", "Pune", "Hyderabad", "Chennai", "Seattle", "Austin"];
  const depts = ["Engineering", "Product", "Design", "Analytics", "Operations", "Sales"];
  const names = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Casey", "Avery"];

  return Array.from({ length: count }, (_, i) => [
    `${names[i % names.length]} #${i + 1}`,
    22 + (i % 40),
    cities[i % cities.length],
    1200000 + ((i * 17000) % 2500000),
    i % 5 === 0 ? "Inactive" : "Active",
    depts[i % depts.length],
  ]);
}

export function App() {
  const gridRef = useRef<ExcelatRef>(null);
  const [scenario, setScenario] = useState<DemoScenario>("standard");
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

  // Pagination Scenario State
  const [page, setPage] = useState<number>(1);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const pageSize = 25;
  const totalItems = 500;

  // Infinite Scenario State
  const [infiniteRows, setInfiniteRows] = useState<ExcelatData>(() =>
    generateVirtualData(60)
  );
  const [isInfiniteLoading, setIsInfiniteLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Operation event logs for developers
  const [operationLogs, setOperationLogs] = useState<
    Array<{ id: number; time: string; op: ExcelatOperation }>
  >([]);

  // 10,000 row virtualized dataset
  const virtualData = useMemo(() => generateVirtualData(10000), []);

  // Simulated server-side page data
  const pageData = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return Array.from({ length: pageSize }, (_, i) => {
      const idx = offset + i;
      return [
        `Record #${idx + 1}`,
        20 + (idx % 45),
        idx % 2 === 0 ? "Server Node A" : "Server Node B",
        50000 + idx * 120,
        idx % 7 === 0 ? "Pending" : "Confirmed",
        idx % 3 === 0 ? "Finance" : "Technology",
      ];
    });
  }, [page]);

  // Handle server-side page change simulation
  const handlePageChange = useCallback((nextPage: number) => {
    setIsPageLoading(true);
    // Simulate brief network latency (150ms)
    setTimeout(() => {
      setPage(nextPage);
      setIsPageLoading(false);
    }, 150);
  }, []);

  // Handle infinite scroll load more simulation
  const handleLoadMore = useCallback(() => {
    if (isInfiniteLoading || !hasMore) return;
    setIsInfiniteLoading(true);

    setTimeout(() => {
      setInfiniteRows((prev) => {
        const nextBatch = generateVirtualData(prev.length + 30).slice(prev.length);
        if (prev.length + nextBatch.length >= 300) {
          setHasMore(false);
        }
        return [...prev, ...nextBatch];
      });
      setIsInfiniteLoading(false);
    }, 350);
  }, [isInfiniteLoading, hasMore]);

  // Log operations from Excelat
  const handleOperation = useCallback((op: ExcelatOperation) => {
    const timestamp = new Date().toLocaleTimeString();
    setOperationLogs((prev) => [
      { id: Date.now() + Math.random(), time: timestamp, op },
      ...prev.slice(0, 24),
    ]);
  }, []);

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
    setPage(1);
    setInfiniteRows(generateVirtualData(60));
    setHasMore(true);
    setOperationLogs([]);
  }, []);

  // Compute selection stats
  const activeDataset =
    scenario === "virtualization"
      ? virtualData
      : scenario === "pagination"
      ? pageData
      : scenario === "infinite"
      ? infiniteRows
      : data;

  const stats = useMemo(() => {
    let count = 0;
    let numericCount = 0;
    let sum = 0;

    for (let r = selection.startRow; r <= selection.endRow; r++) {
      for (let c = selection.startColumn; c <= selection.endColumn; c++) {
        count++;
        const val = activeDataset[r]?.[c];
        if (typeof val === "number") {
          sum += val;
          numericCount++;
        }
      }
    }

    const average = numericCount > 0 ? (sum / numericCount).toFixed(1) : null;
    return { count, numericCount, sum, average };
  }, [selection, activeDataset]);

  const activeCoordText = `${getColumnLabel(selection.startColumn)}${getRowLabel(selection.startRow)}`;
  const rangeCoordText =
    selection.startRow === selection.endRow &&
    selection.startColumn === selection.endColumn
      ? activeCoordText
      : `${activeCoordText}:${getColumnLabel(selection.endColumn)}${getRowLabel(selection.endRow)}`;

  const handleCopyCode = () => {
    let snippet = "";
    if (scenario === "virtualization") {
      snippet = `<Excelat\n  data={largeDataset} // 10,000+ rows\n  virtualization\n  columns={columns}\n/>`;
    } else if (scenario === "pagination") {
      snippet = `<Excelat\n  data={currentPageRows}\n  pagination={{\n    page: ${page},\n    pageSize: ${pageSize},\n    total: ${totalItems}\n  }}\n  onPageChange={handlePageChange}\n/>`;
    } else if (scenario === "infinite") {
      snippet = `<Excelat\n  data={rows}\n  virtualization\n  hasMore={hasMore}\n  loading={loading}\n  onLoadMore={loadMore}\n/>`;
    } else if (mode === "table") {
      snippet = `<Excelat\n  data={data}\n  mode="table"\n  columns={TABLE_COLUMNS}\n  onOperation={handleOperation}\n/>`;
    } else {
      snippet = `<Excelat\n  data={data}\n  rows={50}\n  columns={16}\n  showFormulaBar={true}\n  onOperation={handleOperation}\n/>`;
    }

    navigator.clipboard.writeText(snippet);
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
              <span className="demo-badge">V0.2</span>
            </div>
            <p className="demo-subtitle">
              Excel-like spreadsheet tables for React with first-class Virtualization, Controlled Pagination & Developer Operation Events.
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
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Scenario Switcher Tabs */}
      <nav className="demo-scenario-tabs" aria-label="Feature Scenarios">
        <button
          className={`scenario-tab ${scenario === "standard" ? "active" : ""}`}
          onClick={() => setScenario("standard")}
        >
          <Sheet size={15} />
          <span>Local Data</span>
        </button>
        <button
          className={`scenario-tab ${scenario === "virtualization" ? "active" : ""}`}
          onClick={() => setScenario("virtualization")}
        >
          <Zap size={15} />
          <span>Virtualization (10,000 Rows)</span>
        </button>
        <button
          className={`scenario-tab ${scenario === "pagination" ? "active" : ""}`}
          onClick={() => setScenario("pagination")}
        >
          <Layers size={15} />
          <span>Controlled Pagination</span>
        </button>
        <button
          className={`scenario-tab ${scenario === "infinite" ? "active" : ""}`}
          onClick={() => setScenario("infinite")}
        >
          <Database size={15} />
          <span>Infinite Loading</span>
        </button>
      </nav>

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
            {scenario === "standard" && (
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
                onOperation={handleOperation}
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
            )}

            {scenario === "virtualization" && (
              <Excelat
                ref={gridRef}
                data={virtualData}
                virtualization
                mode={mode}
                columns={TABLE_COLUMNS}
                selectionStyle={selectionStyle}
                showRowNumbers={showRowNumbers}
                showColumnLetters={showColumnLetters}
                showFormulaBar={showFormulaBar}
                onSelectionChange={setSelection}
                onOperation={handleOperation}
              />
            )}

            {scenario === "pagination" && (
              <Excelat
                ref={gridRef}
                data={pageData}
                pagination={{
                  page,
                  pageSize,
                  total: totalItems,
                }}
                loading={isPageLoading}
                onPageChange={handlePageChange}
                mode={mode}
                columns={TABLE_COLUMNS}
                selectionStyle={selectionStyle}
                showRowNumbers={showRowNumbers}
                showColumnLetters={showColumnLetters}
                showFormulaBar={showFormulaBar}
                onSelectionChange={setSelection}
                onOperation={handleOperation}
              />
            )}

            {scenario === "infinite" && (
              <Excelat
                ref={gridRef}
                data={infiniteRows}
                virtualization
                hasMore={hasMore}
                loading={isInfiniteLoading}
                onLoadMore={handleLoadMore}
                mode={mode}
                columns={TABLE_COLUMNS}
                selectionStyle={selectionStyle}
                showRowNumbers={showRowNumbers}
                showColumnLetters={showColumnLetters}
                showFormulaBar={showFormulaBar}
                onSelectionChange={setSelection}
                onOperation={handleOperation}
              />
            )}
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
              <span>
                {scenario === "virtualization"
                  ? "10,000 Rows Virtualized (60 FPS)"
                  : scenario === "pagination"
                  ? `Server-Side Pagination (Page ${page})`
                  : scenario === "infinite"
                  ? `Infinite Loading (${infiniteRows.length} Loaded)`
                  : mode === "table"
                  ? "Table Mode Active"
                  : "Spreadsheet Mode Active"}
              </span>
              <span className="status-sep">|</span>
              <span className="status-range">{rangeCoordText}</span>
              <span className="status-count">
                ({stats.count} {stats.count === 1 ? "cell" : "cells"} selected)
              </span>
              <span className="status-sep">|</span>
              <span className="status-hint">
                <MoveHorizontal size={13} style={{ verticalAlign: "middle", marginRight: "3px" }} />
                Drag header edge to resize
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
                    Avg: <strong>{stats.average}</strong>
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

        {/* Live Operations & Persistence Stream Logger */}
        <section className="demo-operations-card">
          <div className="operations-header">
            <div className="operations-title">
              <Terminal size={16} />
              <span>Live Mutation & Operation Stream (onOperation)</span>
            </div>
            <span className="operations-badge">
              {operationLogs.length} events captured
            </span>
          </div>
          <p className="operations-desc">
            Excelat never touches backend persistence directly. Every edit, drag-fill, range-move, paste, or structural operation emits a clean, typed <code>ExcelatOperation</code> event that you can immediately send to REST, GraphQL, WebSocket, or Supabase.
          </p>

          <div className="operations-stream">
            {operationLogs.length === 0 ? (
              <div className="operations-empty">
                Perform any mutation (edit a cell, clear a range, drag fill handle, paste, insert row) to inspect live events...
              </div>
            ) : (
              operationLogs.map((entry) => (
                <div key={entry.id} className="operation-item">
                  <div className="operation-item-header">
                    <span className="operation-type">{entry.op.type}</span>
                    <span className="operation-time">{entry.time}</span>
                  </div>
                  <pre className="operation-json">
                    {JSON.stringify(entry.op, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Keyboard Shortcuts Reference */}
        <section className="demo-shortcuts-section">
          <div className="shortcuts-header">
            <Keyboard size={18} className="shortcuts-icon" />
            <h2>Spreadsheet Navigation & Keyboard Shortcuts</h2>
            <span className="shortcuts-hint">Full keyboard support works seamlessly with Virtualization and Pagination</span>
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
              <div className="code-subtitle">1. 10,000+ Rows Virtualization</div>
              <pre className="code-block">
{`<Excelat
  data={largeDataset}
  virtualization
  mode="spreadsheet"
  onOperation={handleOperation}
/>`}
              </pre>
            </div>
            <div>
              <div className="code-subtitle">2. Controlled Server-Side Pagination</div>
              <pre className="code-block">
{`<Excelat
  data={pageRows}
  pagination={{
    page: 1,
    pageSize: 50,
    total: 10000
  }}
  onPageChange={(next) => fetchPage(next)}
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
