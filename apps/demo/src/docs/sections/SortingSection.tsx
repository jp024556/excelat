import React, { useState } from "react";
import { Excelat, ExcelatData, ExcelatColumn, SortRule } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const INVENTORY_DATA: ExcelatData = [
  ["MacBook Pro 16", "Laptops", 2499, 45, "Electronics"],
  ["Dell XPS 15", "Laptops", 1899, 60, "Electronics"],
  ["ThinkPad X1 Carbon", "Laptops", 1749, 30, "Electronics"],
  ["Sony WH-1000XM5", "Audio", 399, 120, "Electronics"],
  ["AirPods Pro 2", "Audio", 249, 250, "Electronics"],
  ["Herman Miller Aeron", "Furniture", 1395, 18, "Office"],
  ["Steelcase Gesture", "Furniture", 1280, 24, "Office"],
  ["Keychron Q1 Pro", "Keyboards", 199, 85, "Accessories"],
];

const COLUMNS: ExcelatColumn[] = [
  { key: "product", header: "Product Name", width: 180 },
  { key: "category", header: "Category", width: 130 },
  { key: "price", header: "Price (USD)", width: 120, type: "number" },
  { key: "stock", header: "Stock Qty", width: 110, type: "number" },
  { key: "department", header: "Department", width: 140 },
];

export const SortingSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const [data, setData] = useState<ExcelatData>(INVENTORY_DATA);
  const [sortRules, setSortRules] = useState<SortRule[]>([
    { column: "category", direction: "asc" },
  ]);

  const demoCode = `<Excelat
  mode="table"
  columns={columns}
  data={data}
  sorting={{
    mode: "client",
    multiColumn: true,
  }}
  onSortChange={(rules) => console.log("Sorted:", rules)}
/>`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Core Capabilities</span> / <span>Sorting (Single & Multi-Column)</span>
        </div>
        <h1 className="docs-page-title">Sorting & Multi-Column Priorities</h1>
        <p className="docs-page-lead">
          Client-side in-memory sorting and server-side event dispatching. Excelat features native Shift+Click
          multi-column sorting with automatic numerical priority badges.
        </p>
      </div>

      <DemoContainer
        title="Multi-Column Sorting Demo"
        badge="Interactive Sorting Studio"
        description="Click any column header to toggle sort direction (Ascending -> Descending -> None). Hold Shift and click a second column to test multi-column sorting priority!"
        code={demoCode}
        controls={
          <div className="docs-sort-status-bar">
            <span className="control-label">Active Sort Rules:</span>
            {sortRules.length > 0 ? (
              <div className="docs-sort-tag-list">
                {sortRules.map((r, i) => (
                  <span key={String(r.column)} className="docs-sort-tag">
                    <span className="sort-tag-priority">#{i + 1}</span>
                    <span className="sort-tag-col">{String(r.column)}</span>
                    <span className="sort-tag-dir">
                      {r.direction === "asc" ? "▲ ASC" : "▼ DESC"}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="docs-sort-empty">No columns sorted</span>
            )}
          </div>
        }
      >
        <div style={{ height: 280, width: "100%" }}>
          <Excelat
            mode="table"
            columns={COLUMNS}
            data={data}
            onChange={setData}
            sorting={{
              mode: "client",
              multiColumn: true,
            }}
            onSortChange={setSortRules}
            selectionStyle="subtle"
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>Single Column Cycling</h2>
        <p>
          Clicking a column header cycles through a 3-stage state machine:
        </p>
        <div className="docs-cycle-indicator">
          <span className="cycle-step">Unsorted (⇅)</span>
          <span className="cycle-arrow">→</span>
          <span className="cycle-step active">Ascending (↑)</span>
          <span className="cycle-arrow">→</span>
          <span className="cycle-step active">Descending (↓)</span>
          <span className="cycle-arrow">→</span>
          <span className="cycle-step">Unsorted (⇅)</span>
        </div>
      </section>

      <section className="docs-article-section">
        <h2>Multi-Column Sorting (Shift + Click)</h2>
        <p>
          Holding <code>Shift</code> while clicking another column header adds it as a secondary or tertiary sorting rule.
          Excelat automatically displays a numerical badge (<code>1</code>, <code>2</code>, <code>3</code>) next to each header indicating its priority evaluation order.
        </p>
      </section>

      <section className="docs-article-section">
        <h2>Client Mode vs Server Mode</h2>
        <ul className="docs-bullet-list">
          <li>
            <strong><code>mode="client"</code></strong>: Excelat sorts rows in-memory with zero network latency. Uses stable sort comparison across numbers, strings, and dates.
          </li>
          <li>
            <strong><code>mode="server"</code></strong>: Excelat emits the updated <code>SortRule[]</code> array via <code>onSortChange</code> without altering the local row order, enabling SQL <code>ORDER BY</code> queries or backend pagination.
          </li>
        </ul>
      </section>

      <section className="docs-article-section">
        <h2>SortingConfig Props</h2>
        <PropsTable
          props={[
            {
              name: "mode",
              type: '"client" | "server" | "off"',
              defaultValue: '"client"',
              description: "Execution engine for sorting calculations.",
            },
            {
              name: "multiColumn",
              type: "boolean",
              defaultValue: "true",
              description: "Whether Shift+Click multi-column sorting is permitted.",
            },
            {
              name: "sort",
              type: "SortRule[]",
              description: "Controlled array of active sort rules for server mode or programmatic control.",
            },
          ]}
        />
      </section>

      <SectionNav currentSection="sorting" onSelectSection={onSelectSection} />
    </div>
  );
};
