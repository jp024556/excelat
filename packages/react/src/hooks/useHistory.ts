import { useState, useCallback } from "react";
import { ExcelatData } from "../model/types";
import { GridOperation, applyOperation, invertOperation } from "../model/operations";

export interface HistoryState {
  undoStack: GridOperation[];
  redoStack: GridOperation[];
}

export function useHistory(
  setData: (updater: (prev: ExcelatData) => ExcelatData) => void
) {
  const [history, setHistory] = useState<HistoryState>({
    undoStack: [],
    redoStack: [],
  });

  const executeOperation = useCallback(
    (op: GridOperation) => {
      setData((prevData) => {
        const nextData = applyOperation(prevData, op);
        return nextData;
      });

      setHistory((prev) => ({
        undoStack: [...prev.undoStack, op],
        redoStack: [],
      }));
    },
    [setData]
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
