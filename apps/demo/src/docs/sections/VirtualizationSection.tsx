import React, { useState, useMemo } from "react";
import { Excelat, ExcelatData, ExcelatColumn } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { Cpu } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

function generateDataset(count: number): ExcelatData {
  const cities = ["Bangalore", "Seattle", "London", "Tokyo", "Berlin", "Toronto", "Sydney"];
  const depts = ["Engineering", "Infrastructure", "Security", "Platform Engineering", "Product"];
  const names = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Casey", "Avery"];

  return Array.from({ length: count }, (_, i) => [
    `REC-${100000 + i}`,
    `${names[i % names.length]} #${i + 1}`,
    cities[i % cities.length],
    depts[i % depts.length],
    50000 + ((i * 123) % 90000),
    i % 6 === 0 ? "Inactive" : "Active",
  ]);
}

const COLUMNS: ExcelatColumn[] = [
  { key: "id", header: "Record ID", width: 130 },
  { key: "name", header: "Customer Name", width: 160 },
  { key: "city", header: "City", width: 130 },
  { key: "dept", header: "Department", width: 140 },
  { key: "salary", header: "Balance ($)", width: 120, type: "number" },
  { key: "status", header: "Status", width: 110 },
];

export const VirtualizationSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const [rowCount, setRowCount] = useState<number>(10000);
  const data = useMemo(() => generateDataset(rowCount), [rowCount]);

  const demoCode = `import { useMemo } from "react";
import { Excelat } from "@excelat/react";

export function MassiveGrid() {
  // 10,000+ rows generated in-memory
  const data = useMemo(() => generateDataset(${rowCount}), []);

  return (
    <div style={{ height: 350 }}>
      <Excelat
        mode="table"
        columns={columns}
        data={data}
        virtualization={true}
        showRowNumbers={true}
        sorting={{ mode: "client" }}
      />
    </div>
  );
}`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Performance & Scale</span> / <span>Virtualization (10k+ Rows)</span>
        </div>
        <h1 className="docs-page-title">Virtualization & 60fps Performance</h1>
        <p className="docs-page-lead">
          Built-in DOM windowing engine allows Excelat to render tens of thousands of rows and columns
          with instantaneous mount times and silky 60fps scrolling.
        </p>
      </div>

      <DemoContainer
        title="10,000+ Row Virtualization Demo"
        badge="High-Throughput Windowing"
        description="Scroll rapidly through 10,000 rows. Notice instantaneous response, silky scrolling, and low memory usage. You can even sort and select cells smoothly."
        code={demoCode}
        controls={
          <div className="docs-demo-controls-inline">
            <span className="control-group-title">
              <Cpu size={14} />
              <span>Dataset Size:</span>
            </span>
            <div className="demo-pill-group">
              {[1000, 5000, 10000, 25000].map((count) => (
                <button
                  key={count}
                  className={`demo-pill ${rowCount === count ? "active" : ""}`}
                  onClick={() => setRowCount(count)}
                >
                  <span>{count.toLocaleString()} rows</span>
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div style={{ height: 360, width: "100%" }}>
          <Excelat
            mode="table"
            columns={COLUMNS}
            data={data}
            virtualization={true}
            showRowNumbers={true}
            sorting={{ mode: "client" }}
            selectionStyle="subtle"
            style={{ height: "100%" }}
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>How the Virtualization Engine Works</h2>
        <p>
          Rendering 10,000 native HTML table rows (over 60,000 <code>&lt;td&gt;</code> elements) would crash browser memory and cause terrible scroll lag.
        </p>
        <p>
          Excelat solves this by calculating the scroll offset dynamically using an efficient binary search:
        </p>
        <ul className="docs-bullet-list">
          <li><strong>Viewport Windowing:</strong> Only the ~15-20 rows currently intersecting the visible scroll container are mounted into the DOM.</li>
          <li><strong>Overscan Buffer:</strong> A 5-row safety buffer is rendered above and below the viewport to prevent flickering during high-speed touchpad or mousewheel scrolling.</li>
          <li><strong>Spacer Geometry:</strong> Top and bottom spacer <code>&lt;tr&gt;</code> elements expand to match the unrendered row heights, maintaining exact native scrollbar proportionality.</li>
        </ul>
      </section>

      <section className="docs-article-section">
        <h2>Virtualization Configuration</h2>
        <p>
          Pass <code>virtualization={true}</code> or configure specific overscan buffers:
        </p>
        <PropsTable
          props={[
            {
              name: "virtualization",
              type: "boolean | VirtualizationConfig",
              defaultValue: "false",
              description: "Enables row and column DOM windowing for large datasets.",
            },
            {
              name: "virtualization.overscanRows",
              type: "number",
              defaultValue: "5",
              description: "Number of additional rows to pre-render outside the visible viewport.",
            },
            {
              name: "virtualization.overscanCols",
              type: "number",
              defaultValue: "2",
              description: "Number of additional columns to pre-render outside the horizontal viewport.",
            },
          ]}
        />
      </section>

      <SectionNav currentSection="virtualization" onSelectSection={onSelectSection} />
    </div>
  );
};
