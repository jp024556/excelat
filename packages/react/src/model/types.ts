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
   * Total number of columns to render.
   * If data has more columns, the larger number is used.
   * Default is 26 (A-Z) or max columns in data.
   */
  columns?: number;
  /**
   * Callback fired when data changes (via edit, paste, delete, undo, redo).
   */
  onChange?: (nextData: ExcelatData) => void;
  /**
   * Callback fired when selection changes.
   */
  onSelectionChange?: (selection: CellRange) => void;
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
