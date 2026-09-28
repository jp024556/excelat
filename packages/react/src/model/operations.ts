import { CellValue, CellRange, ExcelatData } from "./types";

export type CellUpdateOp = {
  type: "cell.update";
  row: number;
  column: number;
  previousValue: CellValue;
  value: CellValue;
};

export type RangeClearOp = {
  type: "range.clear";
  range: CellRange;
  previousValues: CellValue[][];
};

export type RangeUpdateOp = {
  type: "range.update";
  range: CellRange;
  previousValues: CellValue[][];
  values: CellValue[][];
};

export type GridOperation = CellUpdateOp | RangeClearOp | RangeUpdateOp;

/**
 * Creates an empty matrix filled with null values for a given range.
 */
export function createNullMatrix(rowCount: number, colCount: number): CellValue[][] {
  const matrix: CellValue[][] = [];
  for (let r = 0; r < rowCount; r++) {
    matrix.push(new Array(colCount).fill(null));
  }
  return matrix;
}

/**
 * Inverts an operation to produce its exact undo counterpart.
 */
export function invertOperation(op: GridOperation): GridOperation {
  switch (op.type) {
    case "cell.update":
      return {
        type: "cell.update",
        row: op.row,
        column: op.column,
        previousValue: op.value,
        value: op.previousValue,
      };
    case "range.clear": {
      const numRows = op.range.endRow - op.range.startRow + 1;
      const numCols = op.range.endColumn - op.range.startColumn + 1;
      return {
        type: "range.update",
        range: op.range,
        previousValues: createNullMatrix(numRows, numCols),
        values: op.previousValues,
      };
    }
    case "range.update":
      return {
        type: "range.update",
        range: op.range,
        previousValues: op.values,
        values: op.previousValues,
      };
  }
}

/**
 * Applies a GridOperation to a 2D data matrix immutably,
 * copying only the affected rows to avoid cloning the entire grid.
 */
export function applyOperation(data: ExcelatData, op: GridOperation): ExcelatData {
  switch (op.type) {
    case "cell.update": {
      const { row, column, value } = op;
      const maxRow = Math.max(data.length, row + 1);
      const nextData: ExcelatData = new Array(maxRow);

      for (let r = 0; r < maxRow; r++) {
        if (r === row) {
          const originalRow = data[r] || [];
          const maxCol = Math.max(originalRow.length, column + 1);
          const nextRow: CellValue[] = new Array(maxCol);
          for (let c = 0; c < maxCol; c++) {
            if (c === column) {
              nextRow[c] = value;
            } else {
              nextRow[c] = originalRow[c] !== undefined ? originalRow[c] : null;
            }
          }
          nextData[r] = nextRow;
        } else {
          nextData[r] = data[r] || [];
        }
      }
      return nextData;
    }

    case "range.clear": {
      const { startRow, endRow, startColumn, endColumn } = op.range;
      const maxRow = Math.max(data.length, endRow + 1);
      const nextData: ExcelatData = new Array(maxRow);

      for (let r = 0; r < maxRow; r++) {
        if (r >= startRow && r <= endRow) {
          const originalRow = data[r] || [];
          const maxCol = Math.max(originalRow.length, endColumn + 1);
          const nextRow: CellValue[] = new Array(maxCol);
          for (let c = 0; c < maxCol; c++) {
            if (c >= startColumn && c <= endColumn) {
              nextRow[c] = null;
            } else {
              nextRow[c] = originalRow[c] !== undefined ? originalRow[c] : null;
            }
          }
          nextData[r] = nextRow;
        } else {
          nextData[r] = data[r] || [];
        }
      }
      return nextData;
    }

    case "range.update": {
      const { startRow, endRow, startColumn, endColumn } = op.range;
      const maxRow = Math.max(data.length, endRow + 1);
      const nextData: ExcelatData = new Array(maxRow);

      for (let r = 0; r < maxRow; r++) {
        if (r >= startRow && r <= endRow) {
          const originalRow = data[r] || [];
          const maxCol = Math.max(originalRow.length, endColumn + 1);
          const nextRow: CellValue[] = new Array(maxCol);
          const valuesRow = op.values[r - startRow] || [];

          for (let c = 0; c < maxCol; c++) {
            if (c >= startColumn && c <= endColumn) {
              const val = valuesRow[c - startColumn];
              nextRow[c] = val !== undefined ? val : null;
            } else {
              nextRow[c] = originalRow[c] !== undefined ? originalRow[c] : null;
            }
          }
          nextData[r] = nextRow;
        } else {
          nextData[r] = data[r] || [];
        }
      }
      return nextData;
    }
  }
}
