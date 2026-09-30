import React, { useState, useRef } from "react";
import { Excelat, ExcelatData, ExcelatColumn, ExcelatRef, ContextMenuContext } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { CodeBlock } from "../components/CodeBlock";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { Undo2, Redo2, Plus, Trash2, MousePointer } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const COLUMNS: ExcelatColumn[] = [
  { key: "project", header: "Project Name", width: 220 },
  { key: "department", header: "Department", width: 150 },
  { key: "budget", header: "Budget ($)", width: 140, type: "number" },
  { key: "status", header: "Status", width: 140 },
];

const INITIAL_DATA: ExcelatData = [
  ["Project Genesis", "Design", 45000, "In Progress"],
  ["Data Pipeline V2", "Engineering", 120000, "Completed"],
  ["Customer Portal", "Fullstack", 35000, "Planning"],
  ["Mobile App Refresh", "Mobile", 78000, "In Review"],
];

export const ToolbarContextMenuSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const gridRef = useRef<ExcelatRef>(null);
  const [data, setData] = useState<ExcelatData>(INITIAL_DATA);
  const [contextInfo, setContextInfo] = useState<string | null>(null);

  const handleContextMenu = (e: React.MouseEvent, ctx: ContextMenuContext) => {
    e.preventDefault();
    setContextInfo(`Right-clicked Cell [R${ctx.rowIndex}, C${ctx.columnIndex}] (Selected ${ctx.selection.endRow - ctx.selection.startRow + 1} rows)`);
    setTimeout(() => setContextInfo(null), 3500);
  };

  const demoCode = `import { Excelat, ExcelatColumn } from "@excelat/react";

const COLUMNS: ExcelatColumn[] = [
  { key: "project", header: "Project Name", width: 220 },
  { key: "department", header: "Department", width: 150 },
  { key: "budget", header: "Budget ($)", width: 140, type: "number" },
  { key: "status", header: "Status", width: 140 },
];

export function CustomToolbarGrid() {
  return (
    <Excelat
      mode="table"
      columns={COLUMNS}
      data={data}
      onChange={setData}
      toolbar={({ canUndo, canRedo, undo, redo, insertRow, deleteRows, clearSelection }) => (
        <div className="docs-custom-toolbar">
          <button className="docs-tool-btn" onClick={undo} disabled={!canUndo}>Undo</button>
          <button className="docs-tool-btn" onClick={redo} disabled={!canRedo}>Redo</button>
          <div className="docs-tool-divider" />
          <button className="docs-tool-btn" onClick={() => insertRow()}>+ Insert Row</button>
          <button className="docs-tool-btn" onClick={() => deleteRows()}>Delete Row</button>
          <button className="docs-tool-btn" onClick={() => clearSelection()}>Clear Cells</button>
        </div>
      )}
      onContextMenu={({ row, col, selection, event }) => {
        event.preventDefault();
        showCustomMenu({ x: event.clientX, y: event.clientY, row, col });
      }}
    />
  );
}`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Interactions & State</span> / <span>Toolbar & Context Menu</span>
        </div>
        <h1 className="docs-page-title">Custom Toolbar & Context Menu API</h1>
        <p className="docs-page-lead">
          Inject rich custom toolbars above the grid with ready-to-use Undo, Redo, Insert, and Delete helpers.
          Intercept right-clicks to trigger bespoke enterprise context menus.
        </p>
      </div>

      <DemoContainer
        title="Custom Toolbar & Right-Click Context Menu Demo"
        badge="Interactive Toolbar Studio"
        description="Try: 1) Click the toolbar buttons to insert rows or undo edits; 2) Right-click any cell to test the onContextMenu callback intercept."
        code={demoCode}
        controls={
          contextInfo ? (
            <div className="docs-action-notification">
              <MousePointer size={13} />
              <span>{contextInfo}</span>
            </div>
          ) : undefined
        }
      >
        <div style={{ height: 280, width: "100%" }}>
          <Excelat
            ref={gridRef}
            mode="table"
            columns={COLUMNS}
            data={data}
            onChange={setData}
            selectionStyle="subtle"
            onContextMenu={handleContextMenu}
            toolbar={({ canUndo, canRedo, undo, redo, insertRow, deleteRows, clearSelection }) => (
              <div className="docs-custom-toolbar">
                <button
                  className="docs-tool-btn"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo last change"
                >
                  <Undo2 size={13} />
                  <span>Undo</span>
                </button>
                <button
                  className="docs-tool-btn"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo change"
                >
                  <Redo2 size={13} />
                  <span>Redo</span>
                </button>
                <div className="docs-tool-divider" />
                <button
                  className="docs-tool-btn"
                  onClick={() => insertRow(undefined, ["New Project", "Engineering", 50000, "Planning"])}
                  title="Insert row below"
                >
                  <Plus size={13} />
                  <span>Insert Row</span>
                </button>
                <button className="docs-tool-btn" onClick={() => deleteRows()} title="Delete active rows">
                  <Trash2 size={13} />
                  <span>Delete Row</span>
                </button>
                <button className="docs-tool-btn" onClick={() => clearSelection()} title="Clear cell values">
                  <span>Clear Cells</span>
                </button>
              </div>
            )}
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>Toolbar Render Function (ToolbarProps)</h2>
        <p>The <code>toolbar</code> prop receives an object packed with pre-wired mutation utilities:</p>
        <PropsTable
          props={[
            {
              name: "canUndo",
              type: "boolean",
              description: "Whether there are past operations available in the undo stack.",
            },
            {
              name: "canRedo",
              type: "boolean",
              description: "Whether there are reverted operations available in the redo stack.",
            },
            {
              name: "undo()",
              type: "() => void",
              description: "Reverts the most recent user edit or structural operation.",
            },
            {
              name: "redo()",
              type: "() => void",
              description: "Re-applies the most recently reverted operation.",
            },
            {
              name: "insertRow(index?, values?)",
              type: "(index?: number, values?: CellValue[]) => void",
              description: "Inserts a new row with automatic undo/redo support.",
            },
            {
              name: "deleteRows(rowIndices?)",
              type: "(rowIndices?: number[]) => void",
              description: "Deletes selected or specified rows with automatic undo/redo.",
            },
            {
              name: "clearSelection()",
              type: "() => void",
              description: "Clears all cell values across the current selection range.",
            },
          ]}
        />
      </section>

      <section className="docs-article-section">
        <h2>ContextMenuContext Specification</h2>
        <p>The <code>onContextMenu</code> callback receives:</p>
        <CodeBlock
          code={`interface ContextMenuContext {
  row: number;                // 0-indexed row coordinate of clicked cell
  col: number;                // 0-indexed column coordinate of clicked cell
  selection: CellRange;       // Active rectangular selection range
  event: React.MouseEvent;   // Synthetic mouse event (call event.preventDefault())
}`}
          language="typescript"
        />
      </section>

      <SectionNav currentSection="toolbar-context" onSelectSection={onSelectSection} />
    </div>
  );
};
