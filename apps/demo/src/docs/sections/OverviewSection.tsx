import React, { useState } from "react";
import { Excelat, ExcelatData, ExcelatMode } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { CodeBlock } from "../components/CodeBlock";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { Sheet, Table, Keyboard, Layers, Cpu, ShieldCheck } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const QUICKSTART_DATA: ExcelatData = [
  ["Q1 2024", "North America", 154000, 32000, 122000],
  ["Q1 2024", "Europe & UK", 98000, 21000, 77000],
  ["Q1 2024", "Asia Pacific", 185000, 44000, 141000],
  ["Q2 2024", "North America", 168000, 35000, 133000],
  ["Q2 2024", "Europe & UK", 104000, 22500, 81500],
  ["Q2 2024", "Asia Pacific", 212000, 49000, 163000],
];

export const OverviewSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const [data, setData] = useState<ExcelatData>(QUICKSTART_DATA);
  const [mode, setMode] = useState<ExcelatMode>("spreadsheet");

  const demoCode = `import { useState } from "react";
import { Excelat, ExcelatData } from "@excelat/react";
import "@excelat/react/dist/style.css";

export function FinancialSummary() {
  const [data, setData] = useState<ExcelatData>([
    ["Q1 2024", "North America", 154000, 32000, 122000],
    ["Q1 2024", "Europe & UK", 98000, 21000, 77000],
    ["Q1 2024", "Asia Pacific", 185000, 44000, 141000],
    ["Q2 2024", "North America", 168000, 35000, 133000],
    ["Q2 2024", "Europe & UK", 104000, 22500, 81500],
    ["Q2 2024", "Asia Pacific", 212000, 49000, 163000],
  ]);

  return (
    <div style={{ height: 280, border: "1px solid #e2e8f0" }}>
      <Excelat
        mode="${mode}"
        data={data}
        onChange={setData}
        showFormulaBar={true}
        showRowNumbers={true}
        showColumnLetters={true}
      />
    </div>
  );
}`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Getting Started</span> / <span>Overview & Quickstart</span>
        </div>
        <h1 className="docs-page-title">Excelat Overview</h1>
        <p className="docs-page-lead">
          High-performance, keyboard-first React spreadsheet and data grid component built for
          enterprise web applications. Zero bloated icon dependencies, full mode parity, and 60fps virtualization.
        </p>
      </div>

      <div className="docs-feature-grid">
        <div className="docs-feature-card">
          <div className="docs-feature-icon">
            <Keyboard size={20} />
          </div>
          <h4>Keyboard-First Navigation</h4>
          <p>Arrow keys, Tab, Enter, Shift-drag selection, Formula Bar editing, and TSV clipboard support.</p>
        </div>
        <div className="docs-feature-card">
          <div className="docs-feature-icon">
            <Layers size={20} />
          </div>
          <h4>Visual Mode Parity</h4>
          <p>
            Toggle between Excel-like spreadsheet canvas and clean SaaS data table without losing
            sorting, filtering, grouping, or pagination capabilities.
          </p>
        </div>
        <div className="docs-feature-card">
          <div className="docs-feature-icon">
            <Cpu size={20} />
          </div>
          <h4>60fps Virtualization</h4>
          <p>Engineered DOM windowing recycles row nodes effortlessly, handling 10,000+ to 100,000 rows with zero stutter.</p>
        </div>
        <div className="docs-feature-card">
          <div className="docs-feature-icon">
            <ShieldCheck size={20} />
          </div>
          <h4>Zero External CSS/Icon Bloat</h4>
          <p>Native vector SVG geometry and vanilla CSS variables ensure seamless theme styling and zero runtime friction.</p>
        </div>
      </div>

      <div className="docs-production-banner">
        <div className="docs-production-badge">
          <span className="docs-statpio-pulse"></span>
          <span>Battle-Tested in Production</span>
        </div>
        <div className="docs-production-body">
          <h3>Powering Analytics at Statpio</h3>
          <p>
            Excelat is actively used in production on <a href="https://statpio.com" target="_blank" rel="noreferrer" className="docs-inline-link">Statpio</a> to power high-throughput analytical grids, metric inspection tools, and financial data views.
          </p>
        </div>
        <a
          href="https://statpio.com"
          target="_blank"
          rel="noreferrer"
          className="docs-production-link-btn"
        >
          <span>Visit Statpio</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      </div>

      <DemoContainer
        title="Quickstart Spreadsheet Table"
        badge="Live Interactive Quickstart"
        description="Try double-clicking cells to edit, dragging across a range to select, editing in the formula bar, or toggling between Spreadsheet and Normal Table mode."
        code={demoCode}
        controls={
          <div className="docs-demo-controls-inline">
            <span className="control-group-title">Visual Mode:</span>
            <div className="demo-pill-group">
              <button
                className={`demo-pill ${mode === "spreadsheet" ? "active" : ""}`}
                onClick={() => setMode("spreadsheet")}
              >
                <Sheet size={13} />
                <span>Spreadsheet Mode</span>
              </button>
              <button
                className={`demo-pill ${mode === "table" ? "active" : ""}`}
                onClick={() => setMode("table")}
              >
                <Table size={13} />
                <span>Normal Table Mode</span>
              </button>
            </div>
          </div>
        }
      >
        <div style={{ height: 280, width: "100%" }}>
          <Excelat
            mode={mode}
            data={data}
            onChange={setData}
            showFormulaBar={true}
            showRowNumbers={true}
            showColumnLetters={true}
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>Installation</h2>
        <p>Install the package into your React 18+ application using your preferred package manager:</p>
        <CodeBlock
          code={`npm install @excelat/react
# or with pnpm
pnpm add @excelat/react
# or with yarn
yarn add @excelat/react`}
          language="bash"
          title="Terminal"
        />

        <h3>Importing Styles</h3>
        <p>
          Include the pre-compiled stylesheet once at the root of your application (e.g., in <code>main.tsx</code> or <code>App.tsx</code>):
        </p>
        <CodeBlock
          code={`import "@excelat/react/dist/style.css";`}
          language="tsx"
          title="App.tsx"
        />
      </section>

      <section className="docs-article-section">
        <h2>Core Principle: Mode Parity</h2>
        <div className="docs-callout docs-callout-info">
          <strong>Key Rule:</strong> <code>mode="spreadsheet"</code> and <code>mode="table"</code> are visual/UX presentation modes, not capability boundaries.
        </div>
        <p>
          In traditional data grid libraries, you are often forced to choose between a rigid "Spreadsheet" component or a "Data Table" component with completely incompatible APIs.
        </p>
        <p>
          With Excelat, every single feature - client or server sorting, multi-condition filtering, hierarchical row grouping, pagination, virtualization, and column reordering - operates identically in both modes:
        </p>
        <CodeBlock
          code={`// Both of these work identically with the exact same capabilities!
<Excelat mode="spreadsheet" data={data} sorting={{ mode: "client" }} grouping={{ columns: ["dept"] }} />

<Excelat mode="table" data={data} sorting={{ mode: "client" }} grouping={{ columns: ["dept"] }} />`}
          language="tsx"
        />
      </section>

      <section className="docs-article-section">
        <h2>Basic Props Overview</h2>
        <PropsTable
          props={[
            {
              name: "data",
              type: "CellValue[][]",
              description: "2D matrix of row and cell values representing the grid content.",
            },
            {
              name: "mode",
              type: '"spreadsheet" | "table"',
              defaultValue: '"spreadsheet"',
              description: "Visual presentation mode. Controls gridline styling, default headers, and visual emphasis.",
            },
            {
              name: "selectionStyle",
              type: '"excel" | "subtle" | "none"',
              defaultValue: 'mode === "spreadsheet" ? "excel" : "subtle"',
              description: "Visual treatment of cell selection, active borders, and fill handle.",
            },
            {
              name: "showFormulaBar",
              type: "boolean",
              defaultValue: "false",
              description: "Renders the Excel-style formula and active coordinate bar above the grid.",
            },
            {
              name: "showRowNumbers",
              type: "boolean",
              defaultValue: 'mode === "spreadsheet"',
              description: "Displays 1-indexed row header numbers along the left edge.",
            },
            {
              name: "showColumnLetters",
              type: "boolean",
              defaultValue: 'mode === "spreadsheet"',
              description: "Displays column letter coordinates (A, B, C...) in headers.",
            },
          ]}
        />
      </section>

      <SectionNav currentSection="overview" onSelectSection={onSelectSection} />
    </div>
  );
};
