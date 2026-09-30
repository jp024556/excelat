import React from "react";

export type CellValue = string | number | boolean | null;

export type ExcelatData = CellValue[][];

export interface CellCoord {
  row: number; // 0-based index
  col: number; // 0-based index
}

export interface CellRange {
  startRow: number; // 0-based
  startColumn: number; // 0-based
  endRow: number; // 0-based
  endColumn: number; // 0-based
}

export type ExcelatMode = "table" | "spreadsheet";

export type SelectionStyle = "excel" | "subtle" | "none";

export type ExcelatColumnType = "text" | "number" | "boolean" | "date";
export type ColumnType = ExcelatColumnType;

export type EditMovement = "none" | "down" | "up" | "right" | "left";

export interface CellRenderContext {
  value: CellValue;
  rowIndex: number;
  columnIndex: number;
  row?: CellValue[];
}

export interface CustomCellEditorProps {
  value: CellValue;
  row: number;
  col: number;
  rowData?: CellValue[];
  column?: ExcelatColumn;
  onChange: (value: CellValue) => void;
  onCommit: (movement?: EditMovement, directValue?: CellValue) => void;
  onCancel: () => void;
}

export type CustomCellEditor = React.ComponentType<CustomCellEditorProps>;

export interface ExcelatColumn {
  key?: string;
  header?: string;
  /**
   * Column header label (alias for `header`).
   */
  label?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  type?: ExcelatColumnType;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
  render?: (context: CellRenderContext) => React.ReactNode;
  editor?: CustomCellEditor;
}

export interface ContextMenuContext {
  rowIndex: number;
  columnIndex: number;
  selection: CellRange;
}

export type ExcelatOperation =
  | {
      type: "cell.update";
      row: number;
      column: number;
      value: CellValue;
      previousValue?: CellValue;
    }
  | {
      type: "range.update";
      range: CellRange;
      values: CellValue[][];
      previousValues?: CellValue[][];
    }
  | {
      type: "range.clear";
      range: CellRange;
      previousValues?: CellValue[][];
    }
  | {
      type: "range.paste";
      range: CellRange;
      values: CellValue[][];
      previousValues?: CellValue[][];
    }
  | {
      type: "range.cut";
      source: CellRange;
      destination: CellRange;
      values?: CellValue[][];
    }
  | {
      type: "range.fill";
      source: CellRange;
      destination: CellRange;
      values: CellValue[][];
    }
  | {
      type: "range.move";
      source: CellRange;
      destination: CellRange;
      values: CellValue[][];
    }
  | {
      type: "row.insert";
      index: number;
      values?: CellValue[];
    }
  | {
      type: "row.delete";
      index: number;
      deletedRow?: CellValue[];
    }
  | {
      type: "column.insert";
      index: number;
    }
  | {
      type: "column.delete";
      index: number;
    }
  | {
      type: "column.reorder";
      fromIndex: number;
      toIndex: number;
    }
  | {
      type: "batch";
      operations: ExcelatOperation[];
    };

// ---------------------------------------------------------------------------
// Sorting Types
// ---------------------------------------------------------------------------

export type SortDirection = "asc" | "desc";

export interface SortRule {
  column: string | number;
  direction: SortDirection;
}

export interface SortingConfig {
  mode?: "client" | "server";
  sort?: SortRule[];
  multiColumn?: boolean;
}

// ---------------------------------------------------------------------------
// Filtering Types
// ---------------------------------------------------------------------------

export type FilterOperator =
  | "contains"
  | "notContains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "isEmpty"
  | "isNotEmpty";

export interface Filter {
  column: string | number;
  operator: FilterOperator | string;
  value?: unknown;
}

export interface FilteringConfig {
  mode?: "client" | "server";
  filters?: Filter[];
}

// ---------------------------------------------------------------------------
// Grouping Types
// ---------------------------------------------------------------------------

export interface GroupingConfig {
  columns: (string | number)[];
  expanded?: Record<string, boolean>;
  defaultExpanded?: boolean;
}

export interface GroupHeaderRow {
  type: "group";
  groupKey: string;
  column: string | number;
  value: CellValue;
  count: number;
  depth: number;
  isExpanded: boolean;
}

// ---------------------------------------------------------------------------
// Pagination Types
// ---------------------------------------------------------------------------

export interface PaginationConfig {
  mode?: "client" | "server";
  page: number;
  pageSize: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface PaginationRenderProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Toolbar Types
// ---------------------------------------------------------------------------

export interface ToolbarProps {
  selection: CellRange;
  activeCell: CellCoord;
  selectedRows: number[];
  selectedCols: number[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  deleteRows: (rowIndices?: number[]) => void;
  insertRow: (index?: number, values?: CellValue[]) => void;
  deleteColumns: (colIndices?: number[]) => void;
  insertColumn: (index?: number, values?: CellValue[]) => void;
  copy: () => Promise<string | undefined>;
  cut: () => Promise<string | undefined>;
  paste: () => Promise<void>;
  clearSelection: () => void;
  data: ExcelatData;
  totalRows: number;
  totalCols: number;
  sort?: SortRule[];
  setSort?: (rules: SortRule[]) => void;
  filters?: Filter[];
  setFilters?: (filters: Filter[]) => void;
  clearFilters?: () => void;
  groupColumns?: (string | number)[];
  setGroupColumns?: (cols: (string | number)[]) => void;
}

export interface VirtualizationConfig {
  rowOverscan?: number;
  colOverscan?: number;
}

/**
 * Serializable snapshot of the grid layout and interactive state.
 * Can be saved to localStorage or a database to restore state on mount.
 */
export interface ExcelatGridState {
  /**
   * Ordered list of column keys (or headers/indices if keys are omitted).
   */
  columnOrder?: string[];

  /**
   * Column widths mapping (by column key, header, or numeric index).
   */
  columnWidths?: Record<string | number, number>;

  /**
   * Active sort rules.
   */
  sorting?: SortRule[];

  /**
   * Active column filters.
   */
  filtering?: Filter[];

  /**
   * Grouping configuration (columns and expanded state).
   */
  grouping?: {
    columns?: (string | number)[];
    expanded?: Record<string, boolean>;
  };

  /**
   * Pagination state (current page and page size).
   */
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

export interface ExcelatRef {
  insertRow: (index?: number, values?: CellValue[]) => void;
  deleteRow: (index?: number) => void;
  insertColumn: (index?: number, values?: CellValue[]) => void;
  deleteColumn: (index?: number) => void;
  reorderColumn: (fromIndex: number, toIndex: number) => void;
  getState: () => ExcelatGridState;
  setState: (state: Partial<ExcelatGridState>) => void;
  resetState: () => void;
  undo: () => void;
  redo: () => void;
  copy: () => Promise<string | undefined>;
  cut: () => Promise<string | undefined>;
  paste: () => Promise<void>;
  focus: () => void;
}

export interface ExcelatProps {
  /**
   * 2D array of cell values.
   */
  data?: ExcelatData;
  /**
   * Total number of rows to render.
   * If data has more rows, the larger number is used.
   * Default is Math.max(data?.length ?? 0, 100).
   */
  rows?: number;
  /**
   * Total number of columns to render, or an array of column definitions.
   * If data has more columns, the larger number is used.
   * Default is 26 (A-Z) or max columns in data.
   */
  columns?: number | ExcelatColumn[];
  /**
   * Visual mode: "spreadsheet" (Excel-like UI) or "table" (clean application table appearance).
   * Default is "spreadsheet".
   */
  mode?: ExcelatMode;
  /**
   * Selection visual treatment: "excel" (prominent green border & fill handle),
   * "subtle" (minimal border, no handle), or "none" (no visual selection box).
   * In spreadsheet mode defaults to "excel", in table mode defaults to "subtle".
   */
  selectionStyle?: SelectionStyle;
  /**
   * Whether to show row numbers (1, 2, 3...).
   * In spreadsheet mode defaults to true, in table mode defaults to false.
   */
  showRowNumbers?: boolean;
  /**
   * Whether to show column letters (A, B, C...).
   * In spreadsheet mode defaults to true, in table mode defaults to false.
   */
  showColumnLetters?: boolean;
  /**
   * Whether to show the top formula/coordinate bar.
   * Default is false.
   */
  showFormulaBar?: boolean;
  /**
   * Enable virtualization for large datasets.
   * Can be boolean or configuration with overscans.
   * @default false
   */
  virtualization?: boolean | VirtualizationConfig;
  /**
   * Sorting configuration: client-side or server-side.
   */
  sorting?: boolean | SortingConfig;
  /**
   * Callback fired when sorting rules change.
   */
  onSortChange?: (sort: SortRule[]) => void;
  /**
   * Filtering configuration: client-side or server-side.
   */
  filtering?: boolean | FilteringConfig;
  /**
   * Callback fired when filters change.
   */
  onFilterChange?: (filters: Filter[]) => void;
  /**
   * Row grouping configuration.
   */
  grouping?: GroupingConfig;
  /**
   * Callback fired when expanded groups change.
   */
  onGroupChange?: (expandedGroups: string[]) => void;
  /**
   * Custom toolbar element or render function receiving grid state and actions.
   */
  toolbar?: React.ReactNode | ((props: ToolbarProps) => React.ReactNode);
  /**
   * Controlled server-side or client-side pagination configuration.
   */
  pagination?: PaginationConfig;
  /**
   * Callback fired when page changes in pagination mode.
   */
  onPageChange?: (page: number) => void;
  /**
   * Callback fired when page size changes.
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Custom pagination render function replacing the default pagination bar.
   */
  renderPagination?: (props: PaginationRenderProps) => React.ReactNode;
  /**
   * Whether more data is available for infinite / incremental loading.
   */
  hasMore?: boolean;
  /**
   * Whether data is currently loading (for server-side loading or pagination).
   */
  loading?: boolean;
  /**
   * Callback fired when user scrolls near the end of loaded data.
   */
  onLoadMore?: () => void;
  /**
   * Callback fired whenever a grid mutation / operation occurs.
   * Enables clean developer-controlled persistence.
   */
  onOperation?: (operation: ExcelatOperation) => void;
  /**
   * Callback fired when data changes (via edit, paste, delete, undo, redo, structural operations).
   */
  onChange?: (nextData: ExcelatData) => void;
  /**
   * Callback fired when selection changes.
   */
  onSelectionChange?: (selection: CellRange) => void;
  /**
   * Callback fired when a column is resized.
   */
  onColumnResize?: (columnIndex: number, width: number) => void;
  /**
   * Whether drag-and-drop column reordering is enabled.
   * @default true
   */
  columnReorder?: boolean;
  /**
   * Callback fired when a column is reordered via drag-and-drop or programmatic API.
   */
  onColumnReorder?: (fromIndex: number, toIndex: number, newColumns?: ExcelatColumn[]) => void;
  /**
   * Callback fired when a row is resized.
   */
  onRowResize?: (rowIndex: number, height: number) => void;
  /**
   * Callback fired when right-clicking inside the grid or headers.
   */
  onContextMenu?: (event: React.MouseEvent, context: ContextMenuContext) => void;
  /**
   * Optional custom class name for the root container.
   */
  className?: string;
  /**
   * Optional custom style for the root container.
   */
  style?: React.CSSProperties;
  /**
   * Initial state configuration to restore on mount (column order, widths, sorting, filtering, etc.).
   */
  initialState?: ExcelatGridState;
  /**
   * Callback fired whenever the serializable grid state changes.
   * Ideal for persisting layout to localStorage or backend settings.
   */
  onStateChange?: (state: ExcelatGridState) => void;
  /**
   * Whether the grid is read-only.
   */
  readOnly?: boolean;
  /**
   * Theme variant for the grid: "light", "dark", or "system".
   * Automatically adapts to ancestor .dark class when omitted.
   * @default "light"
   */
  theme?: "light" | "dark" | "system";
}

