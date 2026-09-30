import React, { useState, useRef } from "react";
import { Excelat, ExcelatData, ExcelatColumn, ExcelatRef } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { MoveHorizontal, RotateCcw } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const INITIAL_FINANCIAL_DATA: ExcelatData = [
  ["Acme Corp", "Software", 1450000, 320000, 1130000, "Approved"],
  ["Globex Systems", "Hardware", 890000, 240000, 650000, "Approved"],
  ["Initech Media", "Consulting", 620000, 180000, 440000, "Review"],
  ["Umbrella Labs", "Pharma", 2400000, 750000, 1650000, "Approved"],
  ["Soylent Corp", "Food Tech", 910000, 310000, 600000, "Pending"],
];

const INITIAL_COLUMNS: ExcelatColumn[] = [
  { key: "company", header: "Company", width: 150 },
  { key: "industry", header: "Industry", width: 130 },
  { key: "revenue", header: "Gross Revenue", width: 140, type: "number" },
  { key: "expenses", header: "Expenses", width: 120, type: "number" },
  { key: "netIncome", header: "Net Income", width: 130, type: "number" },
  { key: "audit", header: "Audit Status", width: 120 },
];

export const ColumnReorderSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const gridRef = useRef<ExcelatRef>(null);
  const [data, setData] = useState<ExcelatData>(INITIAL_FINANCIAL_DATA);
  const [reorderLog, setReorderLog] = useState<string[]>([]);

  const handleColumnReorder = (sourceIndex: number, targetIndex: number) => {
    const msg = `Moved column #${sourceIndex} to position #${targetIndex}`;
    setReorderLog((prev) => [msg, ...prev.slice(0, 4)]);
  };

  const demoCode = `import { useRef } from "react";
import { Excelat, ExcelatRef } from "@excelat/react";

export function ReorderableTable() {
  const gridRef = useRef<ExcelatRef>(null);

  return (
    <Excelat
      ref={gridRef}
      mode="table"
      columns={columns}
      data={data}
      columnReorder={true}
      onColumnReorder={(fromIdx, toIdx) => {
        console.log(\`Column reordered from \${fromIdx} to \${toIdx}\`);
      }}
    />
  );
}`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Interactions & State</span> / <span>Column Drag & Drop</span>
        </div>
        <h1 className="docs-page-title">Column Drag-and-Drop Reordering</h1>
        <p className="docs-page-lead">
          Reorder columns visually via native HTML5 drag-and-drop. Automatically synchronizes
          underlying row matrix columns and supports full Undo/Redo integration.
        </p>
      </div>

      <DemoContainer
        title="Interactive Column Drag & Drop Reordering"
        badge="Drag & Drop Studio"
        description="Click and drag any column header horizontally. A vertical insertion indicator line highlights the target position. Release to reorder! Press Ctrl+Z to undo."
        code={demoCode}
        controls={
          <div className="docs-demo-controls-inline">
            <span className="control-group-title">
              <MoveHorizontal size={14} />
              <span>Actions:</span>
            </span>
            <div className="demo-pill-group">
              <button
                className="demo-pill"
                onClick={() => gridRef.current?.undo()}
                title="Undo last column reorder (Ctrl+Z)"
              >
                <RotateCcw size={12} />
                <span>Undo Reorder</span>
              </button>
              {reorderLog.length > 0 && (
                <span className="docs-status-chip">Latest: {reorderLog[0]}</span>
              )}
            </div>
          </div>
        }
      >
        <div style={{ height: 280, width: "100%" }}>
          <Excelat
            ref={gridRef}
            mode="table"
            columns={INITIAL_COLUMNS}
            data={data}
            onChange={setData}
            columnReorder={true}
            onColumnReorder={handleColumnReorder}
            selectionStyle="subtle"
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>How Column Reordering Works</h2>
        <p>
          Excelat uses native HTML5 drag events (<code>dragstart</code>, <code>dragover</code>, <code>drop</code>, <code>dragend</code>):
        </p>
        <ul className="docs-bullet-list">
          <li><strong>Visual Drop Guides:</strong> As you drag a header, a distinct 2px insertion line appears on the left or right edge of the target column showing exactly where it will land.</li>
          <li><strong>Matrix Data Sync:</strong> Excelat immediately invokes <code>reorderColumnsAndData()</code>, transforming both the column definitions and every row in the 2D data matrix to match the new column order.</li>
          <li><strong>Undo & Redo Compatible:</strong> Reordering dispatches an internal <code>column.reorder</code> operation, allowing users to press <code>Ctrl+Z</code> or click Undo to restore the previous layout.</li>
          <li><strong>Auto-Fit Widths:</strong> Double-clicking the divider between column headers automatically resizes the column to snugly fit the widest cell content.</li>
        </ul>
      </section>

      <section className="docs-article-section">
        <h2>Column Reordering Props & Ref API</h2>
        <PropsTable
          props={[
            {
              name: "columnReorder",
              type: "boolean",
              defaultValue: "false",
              description: "Enables drag-and-drop column reordering on header elements.",
            },
            {
              name: "onColumnReorder",
              type: "(sourceIndex: number, targetIndex: number) => void",
              description: "Callback fired when a column is dragged and dropped into a new position.",
            },
            {
              name: "ref.current.reorderColumn",
              type: "(sourceIndex: number, targetIndex: number) => void",
              description: "Imperative method to programmatically move any column to a new index.",
            },
          ]}
        />
      </section>

      <SectionNav currentSection="column-reorder" onSelectSection={onSelectSection} />
    </div>
  );
};
