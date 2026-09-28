import { useCallback } from "react";
import { CellCoord, CellRange, ExcelatData, ExcelatOperation } from "../model/types";
import { GridOperation } from "../model/operations";
import { getRangeValues, serializeToTSV, parseFromTSV } from "../model/dataModel";

export function useClipboard(
  getData: () => ExcelatData,
  getSelectionRange: () => CellRange,
  getActiveCell: () => CellCoord,
  executeOperation: (op: GridOperation, publicOp?: ExcelatOperation) => void,
  setRange: (startRow: number, startColumn: number, endRow: number, endColumn: number) => void,
  readOnly?: boolean
) {
  const copy = useCallback(async () => {
    const data = getData();
    const range = getSelectionRange();
    const matrix = getRangeValues(data, range);
    const tsv = serializeToTSV(matrix);

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(tsv);
      } catch (err) {
        console.warn("Excelat: Failed to copy to clipboard", err);
      }
    }
    return tsv;
  }, [getData, getSelectionRange]);

  const cut = useCallback(async () => {
    if (readOnly) return;
    const tsv = await copy();
    const data = getData();
    const range = getSelectionRange();
    const previousValues = getRangeValues(data, range);

    executeOperation(
      {
        type: "range.clear",
        range,
        previousValues,
      },
      {
        type: "range.cut",
        source: range,
        destination: range,
        values: previousValues,
      }
    );

    return tsv;
  }, [copy, getData, getSelectionRange, executeOperation, readOnly]);

  const paste = useCallback(
    async (pastedText?: string) => {
      if (readOnly) return;

      let text = pastedText;
      if (text === undefined && navigator?.clipboard?.readText) {
        try {
          text = await navigator.clipboard.readText();
        } catch (err) {
          console.warn("Excelat: Failed to read from clipboard", err);
          return;
        }
      }

      if (!text) return;

      const matrix = parseFromTSV(text);
      if (matrix.length === 0 || matrix[0].length === 0) return;

      const activeCell = getActiveCell();
      const numRows = matrix.length;
      const numCols = matrix[0].length;

      const targetRange: CellRange = {
        startRow: activeCell.row,
        startColumn: activeCell.col,
        endRow: activeCell.row + numRows - 1,
        endColumn: activeCell.col + numCols - 1,
      };

      const data = getData();
      const previousValues = getRangeValues(data, targetRange);

      executeOperation(
        {
          type: "range.update",
          range: targetRange,
          previousValues,
          values: matrix,
        },
        {
          type: "range.paste",
          range: targetRange,
          values: matrix,
          previousValues,
        }
      );

      // Update selection to match pasted range
      setRange(
        targetRange.startRow,
        targetRange.startColumn,
        targetRange.endRow,
        targetRange.endColumn
      );
    },
    [readOnly, getActiveCell, getData, executeOperation, setRange]
  );

  return {
    copy,
    cut,
    paste,
  };
}
