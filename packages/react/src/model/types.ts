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
  header?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  type?: ExcelatColumnType;
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
      type: "batch";
      operations: ExcelatOperation[];
    };

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface VirtualizationConfig {
  rowOverscan?: number;
  colOverscan?: number;
}

export interface ExcelatRef {
  insertRow: (index?: number, values?: CellValue[]) => void;
  deleteRow: (index?: number) => void;
  insertColumn: (index?: number, values?: CellValue[]) => void;
  deleteColumn: (index?: number) => void;
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
   * Controlled server-side pagination configuration.
   */
  pagination?: PaginationConfig;
  /**
   * Callback fired when page changes in pagination mode.
   */
  onPageChange?: (page: number) => void;
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
   * Whether the grid is read-only.
   */
  readOnly?: boolean;
}

