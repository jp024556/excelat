import { useState, useCallback, useRef } from "react";
import { CellValue, CellCoord, ColumnType } from "../model/types";
import { GridOperation } from "../model/operations";

export type EditMovement = "none" | "down" | "up" | "right" | "left";

export interface EditingState {
  isEditing: boolean;
  value: string;
  coord: CellCoord;
  initialValue: CellValue;
}

export function parseInputValue(input: string, columnType?: ColumnType): CellValue {
  const trimmed = input.trim();
  if (trimmed === "") return null;

  if (columnType === "number") {
    const num = Number(trimmed);
    return !Number.isNaN(num) ? num : trimmed;
  }

  if (columnType === "boolean") {
    if (trimmed.toLowerCase() === "true") return true;
    if (trimmed.toLowerCase() === "false") return false;
    return Boolean(trimmed);
  }

  if (columnType === "text") {
    return input;
  }

  // General auto-coercion
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
  readOnly?: boolean,
  getColumnType?: (colIndex: number) => ColumnType | undefined
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
        // Double-click, F2, Enter, or formula bar click: start with existing value
        initialText = currentVal !== null && currentVal !== undefined ? String(currentVal) : "";
      }

      const nextState: EditingState = {
        isEditing: true,
        value: initialText,
        coord,
        initialValue: currentVal,
      };
      editingStateRef.current = nextState;
      setEditingState(nextState);
    },
    [getCellValue, readOnly]
  );

  const updateEditValue = useCallback((newValue: string) => {
    editingStateRef.current = { ...editingStateRef.current, value: newValue };
    setEditingState((prev) => ({ ...prev, value: newValue }));
  }, []);

  const startOrUpdateEdit = useCallback(
    (coord: CellCoord, newValue: string) => {
      if (readOnly) return;
      const prev = editingStateRef.current;
      let nextState: EditingState;
      if (!prev.isEditing || prev.coord.row !== coord.row || prev.coord.col !== coord.col) {
        const currentVal = getCellValue(coord.row, coord.col);
        nextState = {
          isEditing: true,
          value: newValue,
          coord,
          initialValue: currentVal,
        };
      } else {
        nextState = {
          ...prev,
          value: newValue,
        };
      }
      editingStateRef.current = nextState;
      setEditingState(nextState);
    },
    [getCellValue, readOnly]
  );

  const commitEdit = useCallback(
    (movement: EditMovement = "none") => {
      const state = editingStateRef.current;
      if (!state.isEditing) return;

      // Immediately mark as not editing in ref to prevent duplicate commits from blur
      editingStateRef.current = {
        ...state,
        isEditing: false,
        value: "",
      };

      const colType = getColumnType?.(state.coord.col);
      const parsed = parseInputValue(state.value, colType);
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
    [executeOperation, onNavigateAfterCommit, getColumnType]
  );

  const cancelEdit = useCallback(() => {
    editingStateRef.current = {
      ...editingStateRef.current,
      isEditing: false,
      value: "",
    };
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
    startOrUpdateEdit,
    commitEdit,
    cancelEdit,
  };
}
