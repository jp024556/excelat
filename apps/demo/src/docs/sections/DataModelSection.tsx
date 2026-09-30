import React, { useState } from "react";
import { Excelat, ExcelatData } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { CodeBlock } from "../components/CodeBlock";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const INITIAL_DATA: ExcelatData = [
  ["Jan", 12000, 4500, 7500],
  ["Feb", 14000, 4800, 9200],
  ["Mar", 16500, 5100, 11400],
  ["Apr", 18000, 5400, 12600],
  ["May", 21000, 5900, 15100],
  ["Jun", 24500, 6300, 18200],
];

export const DataModelSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const [data, setData] = useState<ExcelatData>(INITIAL_DATA);

  const demoCode = `import { useState } from "react";
import { Excelat, ExcelatData } from "@excelat/react";

export function FinancialGrid() {
  const [data, setData] = useState<ExcelatData>([
    ["Jan", 12000, 4500, 7500],
    ["Feb", 14000, 4800, 9200],
    ["Mar", 16500, 5100, 11400],
    ["Apr", 18000, 5400, 12600],
    ["May", 21000, 5900, 15100],
    ["Jun", 24500, 6300, 18200],
  ]);

  return (
    <div style={{ height: 280 }}>
      <Excelat
        mode="spreadsheet"
        data={data}
        onChange={setData}
        showFormulaBar={true}
        showRowNumbers={true}
        showColumnLetters={true}
        selectionStyle="excel"
      />
    </div>
  );
}`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Core Capabilities</span> / <span>Data Model & Editing</span>
        </div>
        <h1 className="docs-page-title">Data Model, Editing & Formula Bar</h1>
        <p className="docs-page-lead">
          Excelat stores data as an intuitive 2D matrix of primitive values. It provides complete keyboard navigation,
          Excel-style Formula Bar synchronization, full TSV clipboard support, and smart fill handles.
        </p>
      </div>

      <DemoContainer
        title="Interactive Editing & Formula Bar Canvas"
        badge="Live Interactive Canvas"
        description="Try: 1) Click any cell and edit in the Formula Bar; 2) Double-click to edit inline; 3) Select a 2x2 range, press Ctrl+C, click elsewhere, and press Ctrl+V; 4) Drag the bottom-right green handle to extend numbers."
        code={demoCode}
      >
        <div style={{ height: 280, width: "100%" }}>
          <Excelat
            mode="spreadsheet"
            data={data}
            onChange={setData}
            showFormulaBar={true}
            showRowNumbers={true}
            showColumnLetters={true}
            selectionStyle="excel"
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>2D Matrix Architecture</h2>
        <p>
          Unlike rigid object-keyed grids, Excelat models tabular data as a clean 2D array of <code>CellValue</code> primitives:
        </p>
        <CodeBlock
          code={`type CellValue = string | number | boolean | null | undefined;
type ExcelatData = CellValue[][];`}
          language="typescript"
        />
        <p>
          This design delivers zero-allocation lookups, O(1) cell access via <code>data[rowIndex][colIndex]</code>, and
          seamless interoperability with Excel, Google Sheets, CSV parsers, and machine learning tables.
        </p>
      </section>

      <section className="docs-article-section">
        <h2>Keyboard Shortcuts & Navigation</h2>
        <div className="docs-comparison-table-wrapper">
          <table className="docs-comparison-table">
            <thead>
              <tr>
                <th>Key / Shortcut</th>
                <th>Action</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>Arrow Keys</code></td>
                <td>Move active cell focus up, down, left, right.</td>
                <td>Navigation</td>
              </tr>
              <tr>
                <td><code>Shift + Arrow Keys</code></td>
                <td>Extend rectangular multi-cell selection.</td>
                <td>Selection</td>
              </tr>
              <tr>
                <td><code>Enter</code></td>
                <td>Commit current edit and move focus down one row.</td>
                <td>Editing</td>
              </tr>
              <tr>
                <td><code>Shift + Enter</code></td>
                <td>Commit current edit and move focus up one row.</td>
                <td>Editing</td>
              </tr>
              <tr>
                <td><code>Tab</code></td>
                <td>Commit current edit and advance focus right one column.</td>
                <td>Editing / Nav</td>
              </tr>
              <tr>
                <td><code>Shift + Tab</code></td>
                <td>Commit current edit and move focus left one column.</td>
                <td>Editing / Nav</td>
              </tr>
              <tr>
                <td><code>Escape</code></td>
                <td>Cancel current in-progress cell or formula bar edit.</td>
                <td>Editing</td>
              </tr>
              <tr>
                <td><code>Delete</code> / <code>Backspace</code></td>
                <td>Clear all cell contents in the current selection range.</td>
                <td>Mutation</td>
              </tr>
              <tr>
                <td><code>Ctrl + C</code> / <code>Cmd + C</code></td>
                <td>Copy active cell or selected rectangular range to clipboard as TSV.</td>
                <td>Clipboard</td>
              </tr>
              <tr>
                <td><code>Ctrl + V</code> / <code>Cmd + V</code></td>
                <td>Paste TSV formatted clipboard data starting at the active cell anchor.</td>
                <td>Clipboard</td>
              </tr>
              <tr>
                <td><code>Ctrl + Z</code> / <code>Ctrl + Y</code></td>
                <td>Undo or Redo any cell edit, fill extension, or clipboard mutation.</td>
                <td>History</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-article-section">
        <h2>Formula Bar Synchronization</h2>
        <p>
          Enabling <code>showFormulaBar={true}</code> mounts an Excel-style formula bar above the grid.
          It displays the active cell coordinate badge (e.g., <code>A1</code>, <code>B4</code>) and an interactive text input
          that updates bidirectionally in real time with the active cell.
        </p>
        <p>
          Edits made in the Formula Bar pass through the exact same <code>onOperation</code> event pipeline,
          ensuring full Undo/Redo compatibility and synchronizing instantly to the underlying cell.
        </p>
      </section>

      <section className="docs-article-section">
        <h2>Fill Handle & Series Extension</h2>
        <p>
          When <code>selectionStyle="excel"</code> is active, a corner drag square appears at the bottom-right of the active cell or selection range.
        </p>
        <ul className="docs-bullet-list">
          <li><strong>Numeric Series:</strong> Dragging across consecutive numbers automatically detects the step delta (e.g., <code>10, 20</code> becomes <code>30, 40, 50</code>).</li>
          <li><strong>Text & Categorical:</strong> Dragging across text patterns repeats the cyclic pattern across the target range.</li>
        </ul>
      </section>

      <SectionNav currentSection="data-model" onSelectSection={onSelectSection} />
    </div>
  );
};
