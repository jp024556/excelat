import { useState, useCallback, useRef } from "react";
import { CellValue, CellCoord } from "../model/types";
import { GridOperation } from "../model/operations";

export type EditMovement = "none" | "down" | "up" | "right" | "left";

export interface EditingState {
  isEditing: boolean;
  value: string;
  coord: CellCoord;
  initialValue: CellValue;
}

export function parseInputValue(input: string): CellValue {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) return num;
  }
  return input;
}

export function useEditing(
  getCellValue: (row: number, col: number) => CellValue,
  executeOperation: (op: GridOperation) => void,
  onNavigateAfterCommit?: (movement: EditMovement) => void,
  readOnly?: boolean
) {
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    value: "",
    coord: { row: 0, col: 0 },
    initialValue: null,
  });

  // Keep latest refs for callbacks to avoid closure traps
  const editingStateRef = useRef(editingState);
  editingStateRef.current = editingState;

  const startEditing = useCallback(
    (coord: CellCoord, initialKey?: string) => {
      if (readOnly) return;
      const currentVal = getCellValue(coord.row, coord.col);
      let initialText = "";

      if (initialKey !== undefined) {
        // User typed a printable character: replace existing value
        initialText = initialKey;
      } else {
        // Double-click or F2 or Enter: start with existing value
        initialText = currentVal !== null && currentVal !== undefined ? String(currentVal) : "";
      }

      setEditingState({
        isEditing: true,
        value: initialText,
        coord,
        initialValue: currentVal,
      });
    },
    [getCellValue, readOnly]
  );

  const updateEditValue = useCallback((newValue: string) => {
    setEditingState((prev) => ({ ...prev, value: newValue }));
  }, []);

  const commitEdit = useCallback(
    (movement: EditMovement = "none") => {
      const state = editingStateRef.current;
      if (!state.isEditing) return;

      const parsed = parseInputValue(state.value);
      if (parsed !== state.initialValue) {
        executeOperation({
          type: "cell.update",
          row: state.coord.row,
          column: state.coord.col,
          previousValue: state.initialValue,
          value: parsed,
        });
      }

      setEditingState((prev) => ({
        ...prev,
        isEditing: false,
        value: "",
      }));

      if (movement !== "none" && onNavigateAfterCommit) {
        onNavigateAfterCommit(movement);
      }
    },
    [executeOperation, onNavigateAfterCommit]
  );

  const cancelEdit = useCallback(() => {
    setEditingState((prev) => ({
      ...prev,
      isEditing: false,
      value: "",
    }));
  }, []);

  return {
    isEditing: editingState.isEditing,
    editValue: editingState.value,
    editCoord: editingState.coord,
    startEditing,
    updateEditValue,
    commitEdit,
    cancelEdit,
  };
}
