import React, { useState } from "react";
import { Excelat, ExcelatData, ExcelatColumn } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { FolderTree } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const ORG_DATA: ExcelatData = [
  ["Jayant Sharma", "Engineering", "Bangalore", 125000, "Senior Architect"],
  ["Priya Reddy", "Engineering", "Hyderabad", 98000, "Frontend Lead"],
  ["Ananya Sen", "Engineering", "Bangalore", 115000, "DevOps Engineer"],
  ["Rahul Nair", "Product", "Delhi", 105000, "Product Manager"],
  ["Amit Verma", "Product", "Mumbai", 92000, "Technical PM"],
  ["Sneha Gupta", "Design", "Bangalore", 96000, "UX Researcher"],
  ["Karan Mehta", "Design", "Delhi", 88000, "Visual Designer"],
  ["Divya Joshi", "Analytics", "Mumbai", 110000, "Data Scientist"],
];

const COLUMNS: ExcelatColumn[] = [
  { key: "name", header: "Employee Name", width: 160 },
  { key: "dept", header: "Department", width: 140 },
  { key: "city", header: "Office City", width: 130 },
  { key: "salary", header: "Compensation ($)", width: 140, type: "number" },
  { key: "role", header: "Title / Role", width: 160 },
];

export const GroupingSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const [data, setData] = useState<ExcelatData>(ORG_DATA);
  const [groupBy, setGroupBy] = useState<string>("dept");

  const demoCode = `<Excelat
  mode="table"
  columns={columns}
  data={data}
  grouping={{
    columns: ${groupBy ? `["${groupBy}"]` : "[]"},
    defaultExpanded: true,
  }}
  onGroupChange={(expandedKeys) => {
    console.log("Expanded groups:", expandedKeys);
  }}
/>`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Core Capabilities</span> / <span>Row Grouping & Trees</span>
        </div>
        <h1 className="docs-page-title">Row Grouping & Tree Structures</h1>
        <p className="docs-page-lead">
          Organize flat data rows into hierarchical, collapsible tree categories by any column key.
          Includes animated chevrons, group item counts, and full keyboard expansion.
        </p>
      </div>

      <DemoContainer
        title="Interactive Grouping Demo"
        badge="Interactive Grouping Studio"
        description="Click the group rows or chevron icons to expand and collapse categories. Use the controls above to switch grouping between Department, City, or None."
        code={demoCode}
        controls={
          <div className="docs-demo-controls-inline">
            <span className="control-group-title">
              <FolderTree size={14} />
              <span>Group Rows By:</span>
            </span>
            <div className="demo-pill-group">
              {[
                { id: "dept", label: "Department" },
                { id: "city", label: "Office City" },
                { id: "", label: "None (Flat List)" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  className={`demo-pill ${groupBy === id ? "active" : ""}`}
                  onClick={() => setGroupBy(id)}
                >
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div style={{ height: 280, width: "100%" }}>
          <Excelat
            mode="table"
            columns={COLUMNS}
            data={data}
            onChange={setData}
            grouping={{
              columns: groupBy ? [groupBy] : [],
              defaultExpanded: true,
            }}
            selectionStyle="subtle"
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>How Grouping Works Internally</h2>
        <p>
          Excelat processes rows through an immutable pipeline:
        </p>
        <div className="docs-pipeline-flow">
          <span className="pipeline-node">Raw Data</span>
          <span className="pipeline-sep">→</span>
          <span className="pipeline-node">Filter Engine</span>
          <span className="pipeline-sep">→</span>
          <span className="pipeline-node">Sort Engine</span>
          <span className="pipeline-sep">→</span>
          <span className="pipeline-node active">Grouping Tree</span>
          <span className="pipeline-sep">→</span>
          <span className="pipeline-node">Window Virtualizer</span>
        </div>
        <p>
          Each group header row spans the full column width and displays the column label, the grouped category value,
          and a member item counter. Underlying data row indices are preserved so that edits to grouped rows accurately update the source array.
        </p>
      </section>

      <section className="docs-article-section">
        <h2>Keyboard Accessibility</h2>
        <ul className="docs-bullet-list">
          <li><strong>Arrow Navigation:</strong> Arrow up and down seamlessly cross between group headers and regular data cells.</li>
          <li><strong>Toggle via Space / Enter:</strong> When a group header is focused, pressing <code>Enter</code> or <code>Space</code> toggles its expanded/collapsed state immediately.</li>
        </ul>
      </section>

      <section className="docs-article-section">
        <h2>GroupingConfig Props</h2>
        <PropsTable
          props={[
            {
              name: "columns",
              type: "(string | number)[]",
              defaultValue: "[]",
              description: "Array of column keys or indices to group rows by in hierarchical sequence.",
              required: true,
            },
            {
              name: "defaultExpanded",
              type: "boolean",
              defaultValue: "true",
              description: "Whether newly rendered groups start expanded by default.",
            },
            {
              name: "expanded",
              type: "Record<string, boolean>",
              description: "Controlled mapping of group keys to their expanded state.",
            },
          ]}
        />
      </section>

      <SectionNav currentSection="grouping" onSelectSection={onSelectSection} />
    </div>
  );
};
