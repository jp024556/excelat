import { useState, useCallback } from "react";
import { ExcelatData, ExcelatOperation } from "../model/types";
import { GridOperation, applyOperation, invertOperation } from "../model/operations";

export interface HistoryState {
  undoStack: GridOperation[];
  redoStack: GridOperation[];
}

export function mapGridOpToPublicOp(op: GridOperation): ExcelatOperation {
  switch (op.type) {
    case "cell.update":
      return {
        type: "cell.update",
        row: op.row,
        column: op.column,
        value: op.value,
        previousValue: op.previousValue,
      };
    case "range.clear":
      return {
        type: "range.clear",
        range: op.range,
        previousValues: op.previousValues,
      };
    case "range.update":
      return {
        type: "range.update",
        range: op.range,
        values: op.values,
        previousValues: op.previousValues,
      };
    case "row.insert":
      return {
        type: "row.insert",
        index: op.rowIndex,
        values: op.rows[0],
      };
    case "row.delete":
      return {
        type: "row.delete",
        index: op.rowIndex,
        deletedRow: op.deletedRows[0],
      };
    case "column.insert":
      return {
        type: "column.insert",
        index: op.columnIndex,
      };
    case "column.delete":
      return {
        type: "column.delete",
        index: op.columnIndex,
      };
    case "column.reorder":
      return {
        type: "column.reorder",
        fromIndex: op.fromIndex,
        toIndex: op.toIndex,
      };
    case "range.move":
      return {
        type: "range.move",
        source: op.sourceRange,
        destination: op.targetRange,
        values: op.movedValues,
      };
    case "batch":
      return {
        type: "batch",
        operations: op.operations.map(mapGridOpToPublicOp),
      };
  }
}

export function useHistory(
  setData: (updater: (prev: ExcelatData) => ExcelatData) => void,
  onOperation?: (op: ExcelatOperation) => void
) {
  const [history, setHistory] = useState<HistoryState>({
    undoStack: [],
    redoStack: [],
  });

  const executeOperation = useCallback(
    (op: GridOperation, publicOp?: ExcelatOperation) => {
      setData((prevData) => {
        const nextData = applyOperation(prevData, op);
        return nextData;
      });

      setHistory((prev) => ({
        undoStack: [...prev.undoStack, op],
        redoStack: [],
      }));

      if (onOperation) {
        onOperation(publicOp || mapGridOpToPublicOp(op));
      }
    },
    [setData, onOperation]
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.undoStack.length === 0) return prev;

      const newUndoStack = [...prev.undoStack];
      const lastOp = newUndoStack.pop()!;
      const invertedOp = invertOperation(lastOp);

      setData((prevData) => applyOperation(prevData, invertedOp));

      return {
        undoStack: newUndoStack,
        redoStack: [...prev.redoStack, lastOp],
      };
    });
  }, [setData]);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.redoStack.length === 0) return prev;

      const newRedoStack = [...prev.redoStack];
      const opToRedo = newRedoStack.pop()!;

      setData((prevData) => applyOperation(prevData, opToRedo));

      return {
        undoStack: [...prev.undoStack, opToRedo],
        redoStack: newRedoStack,
      };
    });
  }, [setData]);

  return {
    executeOperation,
    undo,
    redo,
    canUndo: history.undoStack.length > 0,
    canRedo: history.redoStack.length > 0,
  };
}
