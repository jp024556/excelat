import { CellValue, CellRange, ExcelatData } from "./types";

/**
 * Returns the cell value at the given row and column.
 * Returns null if the cell does not exist.
 */
export function getCellValue(data: ExcelatData, row: number, col: number): CellValue {
  if (row < 0 || row >= data.length) return null;
  const rowData = data[row];
  if (!rowData || col < 0 || col >= rowData.length) return null;
  const val = rowData[col];
  return val !== undefined ? val : null;
}

/**
 * Extracts a 2D matrix of cell values for a given rectangular range.
 */
export function getRangeValues(data: ExcelatData, range: CellRange): CellValue[][] {
  const { startRow, endRow, startColumn, endColumn } = normalizeRange(range);
  const matrix: CellValue[][] = [];

  for (let r = startRow; r <= endRow; r++) {
    const rowValues: CellValue[] = [];
    for (let c = startColumn; c <= endColumn; c++) {
      rowValues.push(getCellValue(data, r, c));
    }
    matrix.push(rowValues);
  }

  return matrix;
}

/**
 * Normalizes a range so startRow <= endRow and startColumn <= endColumn.
 */
export function normalizeRange(range: CellRange): CellRange {
  return {
    startRow: Math.min(range.startRow, range.endRow),
    endRow: Math.max(range.startRow, range.endRow),
    startColumn: Math.min(range.startColumn, range.endColumn),
    endColumn: Math.max(range.startColumn, range.endColumn),
  };
}

/**
 * Checks whether a given cell (row, col) is inside the range.
 */
export function isCellInRange(row: number, col: number, range: CellRange): boolean {
  const norm = normalizeRange(range);
  return (
    row >= norm.startRow &&
    row <= norm.endRow &&
    col >= norm.startColumn &&
    col <= norm.endColumn
  );
}

/**
 * Converts a 0-based column index to an Excel-like column header (0 -> A, 25 -> Z, 26 -> AA).
 */
export function getColumnLabel(index: number): string {
  let label = "";
  let current = index;
  while (current >= 0) {
    label = String.fromCharCode(65 + (current % 26)) + label;
    current = Math.floor(current / 26) - 1;
  }
  return label;
}

/**
 * Converts a 0-based row index to an Excel-like row header (0 -> 1, 1 -> 2).
 */
export function getRowLabel(index: number): string {
  return (index + 1).toString();
}

/**
 * Serializes a 2D matrix of CellValue to standard Tab-Separated Values (TSV) for clipboard.
 */
export function serializeToTSV(matrix: CellValue[][]): string {
  return matrix
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return "";
          return String(cell);
        })
        .join("\t")
    )
    .join("\r\n");
}

/**
 * Parses TSV text (from clipboard) into a 2D matrix of CellValue.
 * Automatically casts numeric and boolean strings.
 */
export function parseFromTSV(tsv: string): CellValue[][] {
  if (!tsv) return [];

  // Remove trailing newline if present
  const cleaned = tsv.replace(/\r?\n$/, "");
  const lines = cleaned.split(/\r?\n/);

  return lines.map((line) => {
    const tokens = line.split("\t");
    return tokens.map((token): CellValue => {
      const trimmed = token.trim();
      if (trimmed === "") return null;
      if (trimmed.toLowerCase() === "true") return true;
      if (trimmed.toLowerCase() === "false") return false;
      // Check if it's a valid finite number
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!Number.isNaN(num)) return num;
      }
      return token;
    });
  });
}
