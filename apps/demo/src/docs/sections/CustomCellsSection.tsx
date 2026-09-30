import React, { useState } from "react";
import { Excelat, ExcelatData, ExcelatColumn } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

// Custom Status Editor component
function StatusDropdownEditor({
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  value: any;
  onChange: (val: any) => void;
  onCommit: (movement?: any, directVal?: any) => void;
  onCancel: () => void;
}) {
  return (
    <select
      value={String(value ?? "Active")}
      onChange={(e) => {
        onChange(e.target.value);
        onCommit();
      }}
      onBlur={() => onCommit()}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
        if (e.key === "Enter") onCommit();
      }}
      autoFocus
      style={{
        width: "100%",
        height: "100%",
        border: "1.5px solid var(--excelat-subtle-blue, #3b82f6)",
        borderRadius: "3px",
        outline: "none",
        fontFamily: "inherit",
        fontSize: "12px",
        padding: "0 4px",
        background: "var(--excelat-cell-bg, #ffffff)",
        color: "var(--excelat-cell-text, #1e293b)",
      }}
    >
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
      <option value="Contract">Contract</option>
    </select>
  );
}

const EMPLOYEES_DATA: ExcelatData = [
  ["Jayant Sharma", "Engineering", "Active", 125000, "2023-01-15"],
  ["Priya Reddy", "Product Design", "Active", 98000, "2023-04-10"],
  ["Amit Verma", "Marketing", "Inactive", 75000, "2022-11-20"],
  ["Sneha Gupta", "Analytics", "Contract", 110000, "2024-02-01"],
  ["Rahul Nair", "Engineering", "Active", 140000, "2021-08-14"],
];

export const CustomCellsSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const [data, setData] = useState<ExcelatData>(EMPLOYEES_DATA);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const columns: ExcelatColumn[] = [
    { key: "name", header: "Full Name", width: 150 },
    { key: "department", header: "Department", width: 140 },
    {
      key: "status",
      header: "Status Badge",
      width: 120,
      render: ({ value }) => {
        const val = String(value);
        const isAct = val === "Active";
        const isContract = val === "Contract";
        const bg = isAct
          ? "rgba(16, 185, 129, 0.12)"
          : isContract
          ? "rgba(59, 130, 246, 0.12)"
          : "rgba(239, 68, 68, 0.12)";
        const color = isAct ? "#10b981" : isContract ? "#3b82f6" : "#ef4444";
        const border = isAct
          ? "1px solid rgba(16, 185, 129, 0.25)"
          : isContract
          ? "1px solid rgba(59, 130, 246, 0.25)"
          : "1px solid rgba(239, 68, 68, 0.25)";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: bg,
              color: color,
              border: border,
            }}
          >
            {val}
          </span>
        );
      },
      editor: StatusDropdownEditor,
    },
    {
      key: "salary",
      header: "Salary (INR)",
      width: 130,
      type: "number",
      render: ({ value }) => (
        <span style={{ fontWeight: 600, color: "var(--excelat-cell-text)" }}>
          ₹{Number(value || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "joinDate",
      header: "Join Date",
      width: 120,
      type: "date",
      render: ({ value }) => (
        <span style={{ color: "var(--excelat-header-text)" }}>
          {value ? new Date(String(value)).toLocaleDateString() : ""}
        </span>
      ),
    },
    {
      key: "action",
      header: "Quick Action",
      width: 110,
      render: ({ row }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLastAction(`Pinged ${row?.[0] ?? "Employee"} (${row?.[1] ?? "Team"})`);
            setTimeout(() => setLastAction(null), 3000);
          }}
          style={{
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Message
        </button>
      ),
    },
  ];

  const demoCode = `import { Excelat, ExcelatColumn } from "@excelat/react";

// 1. Custom Status Dropdown Editor
function StatusDropdownEditor({ value, onChange, onCommit, onCancel }: any) {
  return (
    <select
      value={String(value ?? "Active")}
      onChange={(e) => {
        onChange(e.target.value);
        onCommit();
      }}
      autoFocus
    >
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
      <option value="Contract">Contract</option>
    </select>
  );
}

// 2. Column Definitions with Custom Renderers & Editors
const columns: ExcelatColumn[] = [
  { key: "name", header: "Full Name", width: 150 },
  { key: "department", header: "Department", width: 140 },
  {
    key: "status",
    header: "Status Badge",
    width: 120,
    render: ({ value }) => (
      <span className={\`badge badge-\${String(value).toLowerCase()}\`}>
        {String(value)}
      </span>
    ),
    editor: StatusDropdownEditor,
  },
  {
    key: "salary",
    header: "Salary (INR)",
    width: 130,
    render: ({ value }) => <strong>₹{Number(value).toLocaleString("en-IN")}</strong>,
  },
  {
    key: "action",
    header: "Quick Action",
    width: 110,
    render: ({ row }) => (
      <button onClick={(e) => { e.stopPropagation(); alert("Pinged " + row[0]); }}>
        Message
      </button>
    ),
  },
];`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Core Capabilities</span> / <span>Custom Cells & Editors</span>
        </div>
        <h1 className="docs-page-title">Custom Cell Rendering & Custom Editors</h1>
        <p className="docs-page-lead">
          Easily render badges, formatted currency, action buttons, and interactive widgets.
          Excelat completely decouples custom cell rendering from custom cell editors.
        </p>
      </div>

      <DemoContainer
        title="Custom Badges, Currency & Action Buttons"
        badge="Interactive Cell Studio"
        description="Try: 1) Double-click the Status column to trigger the custom dropdown editor; 2) Click the 'Message' action button to verify it fires without triggering cell editing or drag selection."
        code={demoCode}
        controls={
          lastAction ? (
            <div className="docs-action-notification">
              <span>{lastAction}</span>
            </div>
          ) : undefined
        }
      >
        <div style={{ height: 260, width: "100%" }}>
          <Excelat
            mode="table"
            columns={columns}
            data={data}
            onChange={setData}
            selectionStyle="subtle"
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>Separation of Concerns: Render vs Editor</h2>
        <p>
          In Excelat, custom rendering and custom editing are orthogonal. You can compose them in whatever way fits your design:
        </p>
        <ul className="docs-bullet-list">
          <li><strong>Custom Render + Default Editor:</strong> Display formatted currency (e.g., <code>₹1,25,000</code>), but edit as raw numbers in the standard text input.</li>
          <li><strong>Default Render + Custom Editor:</strong> Render plain text, but double-clicking opens a specialized date picker or slider.</li>
          <li><strong>Custom Render + Custom Editor:</strong> Render a status pill badge and edit via a custom dropdown or color picker.</li>
        </ul>
      </section>

      <section className="docs-article-section">
        <h2>CellRenderContext Specification</h2>
        <p>The <code>render</code> function receives the following context object:</p>
        <PropsTable
          props={[
            {
              name: "value",
              type: "CellValue",
              description: "The raw primitive value of the cell.",
            },
            {
              name: "rowIndex",
              type: "number",
              description: "The display row index within the current visible view.",
            },
            {
              name: "columnIndex",
              type: "number",
              description: "The physical 0-indexed column position.",
            },
            {
              name: "column",
              type: "ExcelatColumn",
              description: "The column definition configuration object.",
            },
            {
              name: "row",
              type: "CellValue[]",
              description: "The entire underlying row array, giving access to sister cell values.",
            },
            {
              name: "isSelected",
              type: "boolean",
              description: "Whether this cell is currently selected.",
            },
            {
              name: "isEditing",
              type: "boolean",
              description: "Whether this cell is currently actively in edit mode.",
            },
          ]}
        />
      </section>

      <section className="docs-article-section">
        <h2>Interactive Elements in Custom Cells</h2>
        <div className="docs-callout docs-callout-info">
          <strong>Best Practice:</strong> When placing clickable elements (buttons, links, checkboxes) inside a custom cell renderer, always call <code>e.stopPropagation()</code> on click.
        </div>
        <p>
          This prevents the table from interpreting the button click as a cell focus change or the start of a mouse-drag selection range.
        </p>
      </section>

      <SectionNav currentSection="custom-cells" onSelectSection={onSelectSection} />
    </div>
  );
};
