import React, { useState } from "react";
import { Excelat, ExcelatData, ExcelatColumn, Filter } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const CUSTOMERS_DATA: ExcelatData = [
  ["Acme Corp", "San Francisco", "Enterprise", 85000, "Active"],
  ["Globex Systems", "New York", "Mid-Market", 32000, "Active"],
  ["Soylent Tech", "Austin", "Enterprise", 112000, "Inactive"],
  ["Initech Media", "Chicago", "SMB", 14000, "Active"],
  ["Umbrella Labs", "Seattle", "Enterprise", 95000, "Active"],
  ["Hooli Digital", "San Francisco", "Enterprise", 140000, "Pending"],
  ["Stark Industries", "New York", "Enterprise", 250000, "Active"],
  ["Wayne Enterprises", "Gotham", "Enterprise", 310000, "Active"],
];

const COLUMNS: ExcelatColumn[] = [
  { key: "company", header: "Company Name", width: 160 },
  { key: "city", header: "Location City", width: 140 },
  { key: "tier", header: "Account Tier", width: 120 },
  { key: "arr", header: "Annual Revenue ($)", width: 140, type: "number" },
  { key: "status", header: "Status", width: 100 },
];

export const FilteringSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const [data, setData] = useState<ExcelatData>(CUSTOMERS_DATA);
  const [filters, setFilters] = useState<Filter[]>([]);

  const demoCode = `<Excelat
  mode="table"
  columns={columns}
  data={data}
  filtering={{
    mode: "client",
  }}
  onFilterChange={(activeFilters) => {
    console.log("Filters applied:", activeFilters);
  }}
/>`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Core Capabilities</span> / <span>Filtering & Operators</span>
        </div>
        <h1 className="docs-page-title">Column Filtering & Operators</h1>
        <p className="docs-page-lead">
          Header-anchored filter popovers with full support for text matching, numeric inequalities,
          and empty state evaluation. Fully composable with sorting, grouping, and pagination.
        </p>
      </div>

      <DemoContainer
        title="Interactive Column Filtering Demo"
        badge="Interactive Filter Studio"
        description="Click the filter funnel icon on any column header to open the filter popover. Choose an operator (e.g., 'contains', 'greaterThan') and type a value."
        code={demoCode}
        controls={
          <div className="docs-filter-status-bar">
            <span className="control-label">Active Filters:</span>
            {filters.length > 0 ? (
              <div className="docs-filter-tag-list">
                {filters.map((f) => (
                  <span key={String(f.column)} className="docs-filter-tag">
                    <strong>{String(f.column)}</strong> {f.operator} "{String(f.value)}"
                  </span>
                ))}
              </div>
            ) : (
              <span className="docs-sort-empty">No active filters (showing all rows)</span>
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
            filtering={{ mode: "client" }}
            onFilterChange={setFilters}
            selectionStyle="subtle"
          />
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>Supported Filter Operators</h2>
        <div className="docs-comparison-table-wrapper">
          <table className="docs-comparison-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Label</th>
                <th>Evaluation Logic</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>equals</code></td>
                <td>Equals</td>
                <td>Exact equality (case-insensitive string or number comparison).</td>
              </tr>
              <tr>
                <td><code>contains</code></td>
                <td>Contains</td>
                <td>Substring presence check within stringified cell value.</td>
              </tr>
              <tr>
                <td><code>startsWith</code></td>
                <td>Starts With</td>
                <td>Prefix match at the beginning of the cell text.</td>
              </tr>
              <tr>
                <td><code>endsWith</code></td>
                <td>Ends With</td>
                <td>Suffix match at the end of the cell text.</td>
              </tr>
              <tr>
                <td><code>greaterThan</code></td>
                <td>Greater Than (&gt;)</td>
                <td>Numeric or date comparison: <code>cellValue &gt; targetValue</code>.</td>
              </tr>
              <tr>
                <td><code>lessThan</code></td>
                <td>Less Than (&lt;)</td>
                <td>Numeric or date comparison: <code>cellValue &lt; targetValue</code>.</td>
              </tr>
              <tr>
                <td><code>isEmpty</code></td>
                <td>Is Empty</td>
                <td>Matches <code>null</code>, <code>undefined</code>, or whitespace-only strings.</td>
              </tr>
              <tr>
                <td><code>isNotEmpty</code></td>
                <td>Is Not Empty</td>
                <td>Matches cells with defined non-empty values.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-article-section">
        <h2>Filter Popover UX Details</h2>
        <ul className="docs-bullet-list">
          <li><strong>Keyboard Friendly:</strong> Press <code>Enter</code> to apply the filter and close the popover. Press <code>Escape</code> to dismiss without changes.</li>
          <li><strong>Click Outside to Dismiss:</strong> Clicking anywhere outside the popover safely dismisses it without disrupting grid focus.</li>
          <li><strong>Active Indicator:</strong> When a filter is active on a column, its funnel icon turns the primary theme accent color and gains a subtle background highlight so users always know which filters are constraining the dataset.</li>
        </ul>
      </section>

      <SectionNav currentSection="filtering" onSelectSection={onSelectSection} />
    </div>
  );
};
