import React, { useState, useRef, useCallback } from "react";
import { Excelat, ExcelatData, ExcelatColumn, ExcelatRef, ExcelatGridState } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { CodeBlock } from "../components/CodeBlock";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { BookmarkCheck, RotateCcw, Save, Eye } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const EMPLOYEES: ExcelatData = [
  ["Jayant Sharma", 32, "Bangalore", 145000, "Engineering", "Active"],
  ["Priya Reddy", 28, "Hyderabad", 110000, "Engineering", "Active"],
  ["Rahul Nair", 35, "Delhi", 125000, "Product", "Active"],
  ["Sneha Gupta", 29, "Bangalore", 98000, "Design", "Active"],
  ["Amit Verma", 31, "Mumbai", 92000, "Marketing", "Inactive"],
];

const COLUMNS: ExcelatColumn[] = [
  { key: "name", header: "Name", width: 150 },
  { key: "age", header: "Age", width: 90, type: "number" },
  { key: "city", header: "Location City", width: 140 },
  { key: "salary", header: "Salary ($)", width: 130, type: "number" },
  { key: "dept", header: "Department", width: 130 },
  { key: "status", header: "Status", width: 110 },
];

export const StatePersistenceSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const gridRef = useRef<ExcelatRef>(null);
  const [data, setData] = useState<ExcelatData>(EMPLOYEES);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = useCallback(() => {
    const state = gridRef.current?.getState();
    if (state) {
      localStorage.setItem("excelat_docs_view", JSON.stringify(state));
      notify("Saved current view layout to localStorage!");
    }
  }, []);

  const handleRestore = useCallback(() => {
    const raw = localStorage.getItem("excelat_docs_view");
    if (raw) {
      try {
        const state: ExcelatGridState = JSON.parse(raw);
        gridRef.current?.setState(state);
        notify("Restored view layout from localStorage!");
      } catch {
        notify("Failed to parse saved layout.");
      }
    } else {
      notify("No saved layout found. Click 'Save View' first!");
    }
  }, []);

  const handleReset = useCallback(() => {
    gridRef.current?.resetState();
    notify("Reset layout back to default configuration.");
  }, []);

  const handlePreset = useCallback((preset: "salary" | "hr") => {
    if (preset === "salary") {
      gridRef.current?.setState({
        columnOrder: ["salary", "status", "name", "dept", "city", "age"],
        sorting: [{ column: "salary", direction: "desc" }],
      });
      notify("Applied 'Salary Leaderboard' view preset!");
    } else if (preset === "hr") {
      gridRef.current?.setState({
        columnOrder: ["dept", "name", "city", "status", "salary", "age"],
        grouping: { columns: ["dept"] },
        sorting: [{ column: "name", direction: "asc" }],
      });
      notify("Applied 'Department Breakdown' view preset!");
    }
  }, []);

  const demoCode = `import { useRef } from "react";
import { Excelat, ExcelatRef, ExcelatGridState } from "@excelat/react";

export function PersistentViewTable() {
  const gridRef = useRef<ExcelatRef>(null);

  // 1. Initial State from user preferences or database
  const savedState: ExcelatGridState = {
    columnOrder: ["name", "salary", "dept", "city"],
    columnWidths: { salary: 160 },
    sorting: [{ column: "salary", direction: "desc" }],
    filtering: [{ column: "status", operator: "equals", value: "Active" }],
  };

  // 2. Save current state
  const handleSave = () => {
    const state = gridRef.current?.getState();
    api.saveUserView(state);
  };

  // 3. Switch view preset dynamically
  const applyPreset = () => {
    gridRef.current?.setState({
      columnOrder: ["dept", "name", "salary"],
      grouping: { columns: ["dept"] },
    });
  };

  return (
    <Excelat
      ref={gridRef}
      columns={columns}
      data={data}
      initialState={savedState}
      onStateChange={(state) => api.autoSave(state)}
    />
  );
}`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Interactions & State</span> / <span>State Persistence & Views</span>
        </div>
        <h1 className="docs-page-title">Grid State Persistence & Saved Views</h1>
        <p className="docs-page-lead">
          Save, restore, and dynamically switch table views. Excelat provides serializable state snapshots
          covering column ordering, custom widths, sort rules, active filters, and grouping trees.
        </p>
      </div>

      <DemoContainer
        title="Saved Views & Presets Demo"
        badge="State Persistence Studio"
        description="Try: 1) Reorder columns or sort; 2) Click 'Save View'; 3) Click 'Reset Layout' or switch presets; 4) Click 'Restore View' to see your exact layout restored!"
        code={demoCode}
        controls={
          <div className="docs-demo-controls-inline">
            <span className="control-group-title">
              <BookmarkCheck size={14} />
              <span>Layout Actions:</span>
            </span>
            <div className="demo-pill-group">
              <button className="demo-pill" onClick={handleSave} title="Save to localStorage">
                <Save size={12} />
                <span>Save View</span>
              </button>
              <button className="demo-pill" onClick={handleRestore} title="Restore from localStorage">
                <Eye size={12} />
                <span>Restore View</span>
              </button>
              <button className="demo-pill" onClick={handleReset} title="Reset to initial layout">
                <RotateCcw size={12} />
                <span>Reset Layout</span>
              </button>
              <button className="demo-pill" onClick={() => handlePreset("salary")}>
                <span>Preset: Salary</span>
              </button>
              <button className="demo-pill" onClick={() => handlePreset("hr")}>
                <span>Preset: HR & Dept</span>
              </button>
            </div>
            {toast && <span className="docs-status-chip">{toast}</span>}
          </div>
        }
      >
        <div style={{ height: 260, width: "100%" }}>
          <Excelat
            ref={gridRef}
            mode="table"
            columns={COLUMNS}
            data={data}
            onChange={setData}
            columnReorder={true}
            sorting={{ mode: "client", multiColumn: true }}
            filtering={{ mode: "client" }}
            selectionStyle="subtle"
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>The ExcelatGridState Interface</h2>
        <p>
          Every aspect of a table layout is captured in a pure, JSON-serializable object:
        </p>
        <CodeBlock
          code={`interface ExcelatGridState {
  columnOrder?: string[];             // Keys of columns in left-to-right order
  columnWidths?: Record<string, number>; // Column key mapped to pixel width
  sorting?: SortRule[];               // Active sorting rules and directions
  filtering?: Filter[];               // Active filter criteria and operators
  grouping?: GroupingConfig;          // Grouped column keys and expansion state
}`}
          language="typescript"
        />
      </section>

      <section className="docs-article-section">
        <h2>Imperative Ref State Methods</h2>
        <PropsTable
          props={[
            {
              name: "ref.current.getState()",
              type: "() => ExcelatGridState",
              description: "Returns an immutable, JSON-serializable snapshot of the current grid configuration.",
            },
            {
              name: "ref.current.setState(partial)",
              type: "(state: Partial<ExcelatGridState>) => void",
              description: "Applies layout mutations (reordering, sorting, widths, grouping) programmatically.",
            },
            {
              name: "ref.current.resetState()",
              type: "() => void",
              description: "Reverts all column positions, widths, and sort rules back to their initial mount defaults.",
            },
            {
              name: "onStateChange",
              type: "(state: ExcelatGridState) => void",
              description: "Optional callback fired whenever the user modifies column widths or reorders columns.",
            },
          ]}
        />
      </section>

      <SectionNav currentSection="state-persistence" onSelectSection={onSelectSection} />
    </div>
  );
};
