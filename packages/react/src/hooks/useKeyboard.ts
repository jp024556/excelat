import React, { useCallback } from "react";
import { CellCoord, CellRange, ExcelatData } from "../model/types";
import { GridOperation } from "../model/operations";
import { getRangeValues } from "../model/dataModel";

interface UseKeyboardProps {
  totalRows: number;
  totalCols: number;
  getData: () => ExcelatData;
  getActiveCell: () => CellCoord;
  getSelectionRange: () => CellRange;
  isEditing: boolean;
  readOnly?: boolean;
  selectCell: (row: number, col: number) => void;
  extendSelection: (row: number, col: number) => void;
  startEditing: (coord: CellCoord, initialKey?: string) => void;
  executeOperation: (op: GridOperation) => void;
  undo: () => void;
  redo: () => void;
  copy: () => Promise<string | undefined>;
  cut: () => Promise<string | undefined>;
  paste: () => Promise<void>;
}

export function useKeyboard({
  totalRows,
  totalCols,
  getData,
  getActiveCell,
  getSelectionRange,
  isEditing,
  readOnly,
  selectCell,
  extendSelection,
  startEditing,
  executeOperation,
  undo,
  redo,
  copy,
  cut,
  paste,
}: UseKeyboardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      // If currently editing in the inline editor, let the editor handle its keys
      if (isEditing) return;

      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const activeCell = getActiveCell();

      // Undo / Redo
      if (isCmdOrCtrl && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isCmdOrCtrl && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }

      // Clipboard
      if (isCmdOrCtrl && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        copy();
        return;
      }

      if (isCmdOrCtrl && (e.key === "x" || e.key === "X")) {
        e.preventDefault();
        cut();
        return;
      }

      if (isCmdOrCtrl && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        paste();
        return;
      }

      // Clear / Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!readOnly) {
          e.preventDefault();
          const range = getSelectionRange();
          const data = getData();
          const previousValues = getRangeValues(data, range);
          executeOperation({
            type: "range.clear",
            range,
            previousValues,
          });
        }
        return;
      }

      // Enter edit mode on F2
      if (e.key === "F2") {
        e.preventDefault();
        startEditing(activeCell);
        return;
      }

      // Enter key
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          selectCell(Math.max(0, activeCell.row - 1), activeCell.col);
        } else {
          selectCell(Math.min(totalRows - 1, activeCell.row + 1), activeCell.col);
        }
        return;
      }

      // Tab key
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          if (activeCell.col > 0) {
            selectCell(activeCell.row, activeCell.col - 1);
          } else if (activeCell.row > 0) {
            selectCell(activeCell.row - 1, totalCols - 1);
          }
        } else {
          if (activeCell.col < totalCols - 1) {
            selectCell(activeCell.row, activeCell.col + 1);
          } else if (activeCell.row < totalRows - 1) {
            selectCell(activeCell.row + 1, 0);
          }
        }
        return;
      }

      // Home / End
      if (e.key === "Home") {
        e.preventDefault();
        const targetRow = isCmdOrCtrl ? 0 : activeCell.row;
        const targetCol = 0;
        if (e.shiftKey) {
          extendSelection(targetRow, targetCol);
        } else {
          selectCell(targetRow, targetCol);
        }
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        const targetRow = isCmdOrCtrl ? totalRows - 1 : activeCell.row;
        const targetCol = totalCols - 1;
        if (e.shiftKey) {
          extendSelection(targetRow, targetCol);
        } else {
          selectCell(targetRow, targetCol);
        }
        return;
      }

      // Arrow navigation
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        let deltaRow = 0;
        let deltaCol = 0;

        if (e.key === "ArrowUp") deltaRow = -1;
        if (e.key === "ArrowDown") deltaRow = 1;
        if (e.key === "ArrowLeft") deltaCol = -1;
        if (e.key === "ArrowRight") deltaCol = 1;

        if (e.shiftKey) {
          // Range selection: extend focus
          const range = getSelectionRange();
          // The current focus is determined by activeCell vs range boundary
          // We move focus in the direction of the arrow
          const currentFocusRow =
            activeCell.row === range.startRow ? range.endRow : range.startRow;
          const currentFocusCol =
            activeCell.col === range.startColumn ? range.endColumn : range.startColumn;

          const nextFocusRow = Math.max(0, Math.min(totalRows - 1, currentFocusRow + deltaRow));
          const nextFocusCol = Math.max(0, Math.min(totalCols - 1, currentFocusCol + deltaCol));

          extendSelection(nextFocusRow, nextFocusCol);
        } else {
          // Single cell selection: move anchor & focus
          const nextRow = Math.max(0, Math.min(totalRows - 1, activeCell.row + deltaRow));
          const nextCol = Math.max(0, Math.min(totalCols - 1, activeCell.col + deltaCol));
          selectCell(nextRow, nextCol);
        }
        return;
      }

      // Typing printable character replaces existing value and starts editing
      if (
        !readOnly &&
        !isCmdOrCtrl &&
        !e.altKey &&
        e.key.length === 1 &&
        e.key >= " "
      ) {
        e.preventDefault();
        startEditing(activeCell, e.key);
      }
    },
    [
      isEditing,
      readOnly,
      getActiveCell,
      getSelectionRange,
      getData,
      redo,
      undo,
      copy,
      cut,
      paste,
      executeOperation,
      startEditing,
      selectCell,
      extendSelection,
      totalRows,
      totalCols,
    ]
  );

  return { handleKeyDown };
}
