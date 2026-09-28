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

export type ColumnType = "text" | "number" | "boolean";

export interface CellRenderContext {
  value: CellValue;
  rowIndex: number;
  columnIndex: number;
}

export interface ExcelatColumn {
  header?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  type?: ColumnType;
  render?: (context: CellRenderContext) => React.ReactNode;
}

export interface ContextMenuContext {
  rowIndex: number;
  columnIndex: number;
  selection: CellRange;
}

export interface ExcelatRef {
  insertRow: (index?: number) => void;
  deleteRow: (index?: number) => void;
  insertColumn: (index?: number) => void;
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
