import React, { useState } from "react";
import { Excelat, ExcelatData, ExcelatMode, SelectionStyle } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { Sheet, Table } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const MODES_DEMO_DATA: ExcelatData = [
  ["Project Aurora", "Design System", "In Progress", "$45,000", "85%"],
  ["Data Pipeline V2", "Backend Core", "Completed", "$120,000", "100%"],
  ["Mobile App Refresh", "iOS & Android", "Review", "$78,000", "92%"],
  ["Customer Portal", "Fullstack", "Planning", "$35,000", "15%"],
  ["Auth & SSO Upgrade", "Security", "Completed", "$60,000", "100%"],
];

const COLUMNS = [
  { key: "project", header: "Project Name", width: 160 },
  { key: "team", header: "Team / Module", width: 140 },
  { key: "status", header: "Status", width: 120 },
  { key: "budget", header: "Budget", width: 110 },
  { key: "progress", header: "Progress", width: 100 },
];

export const ModesSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const [data, setData] = useState<ExcelatData>(MODES_DEMO_DATA);
  const [mode, setMode] = useState<ExcelatMode>("table");
  const [selectionStyle, setSelectionStyle] = useState<SelectionStyle>("subtle");
  const [showRowNumbers, setShowRowNumbers] = useState(false);
  const [showColumnLetters, setShowColumnLetters] = useState(false);
  const [showFormulaBar, setShowFormulaBar] = useState(false);

  const demoCode = `<Excelat
  mode="${mode}"
  selectionStyle="${selectionStyle}"
  columns={[
    { key: "project", header: "Project Name", width: 160 },
    { key: "team", header: "Team / Module", width: 140 },
    { key: "status", header: "Status", width: 120 },
    { key: "budget", header: "Budget", width: 110 },
    { key: "progress", header: "Progress", width: 100 },
  ]}
  data={data}
  onChange={setData}
  showRowNumbers={${showRowNumbers}}
  showColumnLetters={${showColumnLetters}}
  showFormulaBar={${showFormulaBar}}
/>`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Getting Started</span> / <span>Visual Modes & Selection</span>
        </div>
        <h1 className="docs-page-title">Visual Modes & Selection Styles</h1>
        <p className="docs-page-lead">
          Excelat separates visual presentation from functional capabilities. Choose between
          classic spreadsheet aesthetics and modern enterprise SaaS tables with fine-grained control over selection styling and grid chrome.
        </p>
      </div>

      <DemoContainer
        title="Visual Modes & Selection Comparison"
        badge="Interactive Modes Studio"
        description="Switch modes, toggle selection treatments, and configure chrome elements in real time."
        code={demoCode}
        controls={
          <div className="docs-demo-controls-grid">
            <div className="control-inline-group">
              <span className="control-label">Presentation Mode:</span>
              <div className="demo-pill-group">
                <button
                  className={`demo-pill ${mode === "spreadsheet" ? "active" : ""}`}
                  onClick={() => {
                    setMode("spreadsheet");
                    setSelectionStyle("excel");
                    setShowRowNumbers(true);
                    setShowColumnLetters(true);
                    setShowFormulaBar(true);
                  }}
                >
                  <Sheet size={13} />
                  <span>Spreadsheet</span>
                </button>
                <button
                  className={`demo-pill ${mode === "table" ? "active" : ""}`}
                  onClick={() => {
                    setMode("table");
                    setSelectionStyle("subtle");
                    setShowRowNumbers(false);
                    setShowColumnLetters(false);
                    setShowFormulaBar(false);
                  }}
                >
                  <Table size={13} />
                  <span>Normal Table</span>
                </button>
              </div>
            </div>

            <div className="control-inline-group">
              <span className="control-label">Selection Treatment:</span>
              <div className="demo-pill-group">
                {(["excel", "subtle", "none"] as SelectionStyle[]).map((style) => (
                  <button
                    key={style}
                    className={`demo-pill ${selectionStyle === style ? "active" : ""}`}
                    onClick={() => setSelectionStyle(style)}
                  >
                    <span>
                      {style === "excel"
                        ? "Excel Accent"
                        : style === "subtle"
                        ? "Subtle Border"
                        : "None (Hidden)"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-inline-group docs-checkbox-row">
              <label className="docs-mini-checkbox">
                <input
                  type="checkbox"
                  checked={showRowNumbers}
                  onChange={(e) => setShowRowNumbers(e.target.checked)}
                />
                <span>Row Numbers</span>
              </label>
              <label className="docs-mini-checkbox">
                <input
                  type="checkbox"
                  checked={showColumnLetters}
                  onChange={(e) => setShowColumnLetters(e.target.checked)}
                />
                <span>Column Letters</span>
              </label>
              <label className="docs-mini-checkbox">
                <input
                  type="checkbox"
                  checked={showFormulaBar}
                  onChange={(e) => setShowFormulaBar(e.target.checked)}
                />
                <span>Formula Bar</span>
              </label>
            </div>
          </div>
        }
      >
        <div style={{ height: 280, width: "100%" }}>
          <Excelat
            mode={mode}
            selectionStyle={selectionStyle}
            columns={COLUMNS}
            data={data}
            onChange={setData}
            showRowNumbers={showRowNumbers}
            showColumnLetters={showColumnLetters}
            showFormulaBar={showFormulaBar}
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>Spreadsheet Mode vs Table Mode</h2>
        <div className="docs-comparison-table-wrapper">
          <table className="docs-comparison-table">
            <thead>
              <tr>
                <th>Aspect</th>
                <th><code>mode="spreadsheet"</code></th>
                <th><code>mode="table"</code></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Primary Aesthetic</strong></td>
                <td>Green accent (<code>#107c41</code>), structured cell gridlines, Excel canvas feel.</td>
                <td>Clean slate/blue accent (<code>#2563eb</code>), soft header backgrounds, modern dashboard aesthetic.</td>
              </tr>
              <tr>
                <td><strong>Default Selection</strong></td>
                <td><code>selectionStyle="excel"</code> with active drag handle dot.</td>
                <td><code>selectionStyle="subtle"</code> with crisp border outline, no fill handle.</td>
              </tr>
              <tr>
                <td><strong>Default Chrome</strong></td>
                <td>Shows 1-indexed row numbers (<code>1, 2, 3...</code>) and column letter headers (<code>A, B, C...</code>).</td>
                <td>Hides row numbers and column letters; relies on semantic column headers.</td>
              </tr>
              <tr>
                <td><strong>Best For</strong></td>
                <td>Financial modeling, tabular data entry, budgeting tools, spreadsheet replacements.</td>
                <td>Admin panels, CRM contact lists, SaaS customer dashboards, reporting tables.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-article-section">
        <h2>Selection Styles</h2>
        <p>The <code>selectionStyle</code> prop governs how active cells and multi-cell selections render:</p>
        <ul className="docs-bullet-list">
          <li>
            <strong><code>"excel"</code></strong>: Renders a distinctive 2px green selection border (<code>#107c41</code>) with a draggable square fill handle on the bottom-right corner for extending numeric or text series.
          </li>
          <li>
            <strong><code>"subtle"</code></strong>: Renders a refined 2px blue focus outline (<code>#2563eb</code>) without the bottom-right fill handle. Perfect for enterprise data tables where drag-to-fill is not desired.
          </li>
          <li>
            <strong><code>"none"</code></strong>: Completely hides selection borders and fill handles while preserving keyboard navigation and click event targeting.
          </li>
        </ul>
      </section>

      <section className="docs-article-section">
        <h2>Visual Configuration Props</h2>
        <PropsTable
          props={[
            {
              name: "mode",
              type: '"spreadsheet" | "table"',
              defaultValue: '"spreadsheet"',
              description: "Switches the top-level visual theme and default selection treatments.",
            },
            {
              name: "selectionStyle",
              type: '"excel" | "subtle" | "none"',
              defaultValue: 'mode === "spreadsheet" ? "excel" : "subtle"',
              description: "Controls the active cell border color, range outline, and fill handle visibility.",
            },
            {
              name: "showRowNumbers",
              type: "boolean",
              defaultValue: 'mode === "spreadsheet"',
              description: "Whether to render the left vertical row index column.",
            },
            {
              name: "showColumnLetters",
              type: "boolean",
              defaultValue: 'mode === "spreadsheet"',
              description: "Whether to prepend column letters (e.g., 'A: Name') in headers.",
            },
            {
              name: "showFormulaBar",
              type: "boolean",
              defaultValue: "false",
              description: "Whether to display the formula bar above the grid.",
            },
            {
              name: "readOnly",
              type: "boolean",
              defaultValue: "false",
              description: "Disables editing, cell deletion, fill drag, and cell mutation interactions.",
            },
          ]}
        />
      </section>

      <SectionNav currentSection="modes" onSelectSection={onSelectSection} />
    </div>
  );
};
