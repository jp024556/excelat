import React from "react";
import { CodeBlock } from "../components/CodeBlock";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

export const ApiReferenceSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Reference</span> / <span>API Reference & Types</span>
        </div>
        <h1 className="docs-page-title">API Reference & TypeScript Types</h1>
        <p className="docs-page-lead">
          Comprehensive reference of all props, interfaces, types, imperative ref methods,
          and helper utilities exported by <code>@excelat/react</code>.
        </p>
      </div>

      <section className="docs-article-section">
        <h2>ExcelatProps</h2>
        <p>Top-level props accepted by the <code>&lt;Excelat /&gt;</code> component:</p>
        <PropsTable
          props={[
            {
              name: "data",
              type: "CellValue[][]",
              description: "2D matrix of cell values representing the grid content.",
            },
            {
              name: "columns",
              type: "ExcelatColumn[] | number",
              description: "Column definitions array or integer count of columns.",
            },
            {
              name: "mode",
              type: '"spreadsheet" | "table"',
              defaultValue: '"spreadsheet"',
              description: "Visual presentation mode.",
            },
            {
              name: "selectionStyle",
              type: '"excel" | "subtle" | "none"',
              defaultValue: '"excel" in spreadsheet, "subtle" in table',
              description: "Selection border and fill handle visual treatment.",
            },
            {
              name: "sorting",
              type: "SortingConfig",
              description: "Sorting configuration ({ mode: 'client' | 'server', multiColumn?: boolean, sort?: SortRule[] }).",
            },
            {
              name: "filtering",
              type: "FilteringConfig",
              description: "Filtering configuration ({ mode: 'client' | 'server', filters?: Filter[] }).",
            },
            {
              name: "grouping",
              type: "GroupingConfig",
              description: "Grouping configuration ({ columns: (string | number)[], defaultExpanded?: boolean }).",
            },
            {
              name: "pagination",
              type: "PaginationConfig",
              description: "Pagination configuration ({ mode: 'client' | 'server', page: number, pageSize: number, total?: number }).",
            },
            {
              name: "virtualization",
              type: "boolean | VirtualizationConfig",
              defaultValue: "false",
              description: "Enables DOM windowing for high row count virtualization.",
            },
            {
              name: "columnReorder",
              type: "boolean",
              defaultValue: "false",
              description: "Enables HTML5 drag-and-drop column reordering.",
            },
            {
              name: "showRowNumbers",
              type: "boolean",
              defaultValue: 'mode === "spreadsheet"',
              description: "Displays vertical 1-indexed row number headers.",
            },
            {
              name: "showColumnLetters",
              type: "boolean",
              defaultValue: 'mode === "spreadsheet"',
              description: "Displays alphabetical column letters (A, B, C...).",
            },
            {
              name: "showFormulaBar",
              type: "boolean",
              defaultValue: "false",
              description: "Displays the active cell coordinate and formula input bar.",
            },
            {
              name: "readOnly",
              type: "boolean",
              defaultValue: "false",
              description: "Disables editing and data mutation.",
            },
            {
              name: "onChange",
              type: "(data: CellValue[][]) => void",
              description: "Callback invoked whenever grid data mutates.",
            },
            {
              name: "onOperation",
              type: "(op: ExcelatOperation) => void",
              description: "Dispatches atomic, granular mutation events (cell.update, range.fill, etc.).",
            },
            {
              name: "onSortChange",
              type: "(rules: SortRule[]) => void",
              description: "Fired when active sorting rules change.",
            },
            {
              name: "onFilterChange",
              type: "(filters: Filter[]) => void",
              description: "Fired when active filtering rules change.",
            },
            {
              name: "onGroupChange",
              type: "(expandedKeys: string[]) => void",
              description: "Fired when group expansion toggles.",
            },
            {
              name: "onStateChange",
              type: "(state: ExcelatGridState) => void",
              description: "Fired when layout state (column order, widths) mutates.",
            },
            {
              name: "toolbar",
              type: "(props: ToolbarProps) => React.ReactNode",
              description: "Custom toolbar render function slot.",
            },
            {
              name: "onContextMenu",
              type: "(ctx: ContextMenuContext) => void",
              description: "Right-click context menu intercept callback.",
            },
          ]}
        />
      </section>

      <section className="docs-article-section">
        <h2>ExcelatRef Methods</h2>
        <p>Methods accessible via React ref (<code>ref.current.*</code>):</p>
        <PropsTable
          props={[
            {
              name: "getState()",
              type: "() => ExcelatGridState",
              description: "Returns serializable JSON snapshot of current layout, sorting, filters, and grouping.",
            },
            {
              name: "setState(partial)",
              type: "(state: Partial<ExcelatGridState>) => void",
              description: "Dynamically updates column order, widths, sorting, or grouping programmatically.",
            },
            {
              name: "resetState()",
              type: "() => void",
              description: "Reverts all column order, widths, and sort rules back to initial mount state.",
            },
            {
              name: "insertRow(index?, values?)",
              type: "(index?: number, values?: CellValue[]) => void",
              description: "Inserts a new row with automatic undo/redo support.",
            },
            {
              name: "deleteRow(index?)",
              type: "(index?: number) => void",
              description: "Deletes a row with automatic undo/redo support.",
            },
            {
              name: "insertColumn(index?, values?)",
              type: "(index?: number, values?: CellValue[]) => void",
              description: "Inserts a new column with automatic undo/redo support.",
            },
            {
              name: "deleteColumn(index?)",
              type: "(index?: number) => void",
              description: "Deletes a column with automatic undo/redo support.",
            },
            {
              name: "reorderColumn(source, target)",
              type: "(sourceIndex: number, targetIndex: number) => void",
              description: "Programmatically moves a column from sourceIndex to targetIndex.",
            },
            {
              name: "undo()",
              type: "() => void",
              description: "Reverts the most recent user edit or structural operation.",
            },
            {
              name: "redo()",
              type: "() => void",
              description: "Re-applies the most recently reverted operation.",
            },
            {
              name: "copy()",
              type: "() => void",
              description: "Copies current selection to clipboard as TSV.",
            },
            {
              name: "cut()",
              type: "() => void",
              description: "Copies current selection to clipboard and clears cell values.",
            },
            {
              name: "paste()",
              type: "() => void",
              description: "Pastes clipboard content into grid at active cell anchor.",
            },
            {
              name: "focus()",
              type: "() => void",
              description: "Focuses the table grid element for keyboard navigation.",
            },
          ]}
        />
      </section>

      <section className="docs-article-section">
        <h2>ExcelatColumn Definition</h2>
        <CodeBlock
          code={`interface ExcelatColumn {
  key: string;                                          // Unique identifier for the column
  header?: string;                                       // Text label displayed in column header
  width?: number;                                        // Pixel width (e.g., 140)
  minWidth?: number;                                     // Minimum resize constraint (default: 40)
  maxWidth?: number;                                     // Maximum resize constraint (default: 800)
  type?: "text" | "number" | "currency" | "date" | "badge" | "action";
  sortable?: boolean;                                    // Can this column be sorted (default: true)
  filterable?: boolean;                                  // Can this column be filtered (default: true)
  render?: (context: CellRenderContext) => React.ReactNode;
  editor?: React.ComponentType<CustomCellEditorProps>;
}`}
          language="typescript"
        />
      </section>

      <section className="docs-article-section">
        <h2>Exported Helper Utilities</h2>
        <CodeBlock
          code={`import {
  getCellValue,           // (data, rowIdx, colIdx) => CellValue
  getRangeValues,         // (data, range) => CellValue[][]
  normalizeRange,         // (range) => CellRange (ensures start <= end)
  isCellInRange,          // (row, col, range) => boolean
  getColumnLabel,         // (colIndex) => string (0 -> 'A', 27 -> 'AB')
  getRowLabel,            // (rowIndex) => string (0 -> '1')
  serializeToTSV,         // (data) => string
  parseFromTSV,           // (tsvString) => CellValue[][]
  reorderColumnsAndData,  // (columns, data, newKeyOrder) => { columns, data }
} from "@excelat/react";`}
          language="typescript"
        />
      </section>

      <SectionNav currentSection="api-reference" onSelectSection={onSelectSection} />
    </div>
  );
};
