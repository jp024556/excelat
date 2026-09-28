import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExcelatProps, ExcelatData } from "./model/types";
import { Grid } from "./components/Grid";
import { useSelection } from "./hooks/useSelection";
import { useHistory } from "./hooks/useHistory";
import { useEditing, EditMovement } from "./hooks/useEditing";
import { useClipboard } from "./hooks/useClipboard";
import { useKeyboard } from "./hooks/useKeyboard";
import { getCellValue } from "./model/dataModel";
import "./styles/excelat.css";

export const Excelat: React.FC<ExcelatProps> = ({
  data: controlledData,
  rows: initialRows,
  columns: initialCols,
  onChange,
  onSelectionChange,
  className = "",
  style,
  readOnly = false,
}) => {
  // Check if component is in controlled mode
  const isControlled = controlledData !== undefined && onChange !== undefined;

  // Maintain internal data state to support both controlled and uncontrolled usage
  const [internalData, setInternalData] = useState<ExcelatData>(() => controlledData || []);

  // Sync internal state when controlledData changes from parent
  useEffect(() => {
    if (controlledData !== undefined) {
      setInternalData(controlledData);
    }
  }, [controlledData]);

  // Compute effective data, rows and columns
  const currentData = isControlled ? controlledData : internalData;
  const maxDataCols = currentData.reduce(
    (max, row) => Math.max(max, row ? row.length : 0),
    0
  );
  const totalRows = Math.max(initialRows ?? 100, currentData.length);
  const totalCols = Math.max(initialCols ?? 26, maxDataCols);

  const gridRef = useRef<HTMLDivElement>(null);

  // Wrap state updater so onChange is invoked on every data mutation
  const setData = useCallback(
    (updater: (prev: ExcelatData) => ExcelatData) => {
      setInternalData((prev) => {
        const next = updater(prev);
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  // History / Operations
  const { executeOperation, undo, redo } = useHistory(setData);

  // Selection
  const {
    anchor,
    range,
    selectCell,
    extendSelection,
    setRange,
    startDrag,
    dragTo,
    stopDrag,
  } = useSelection(totalRows, totalCols, onSelectionChange);

  // Helper to refocus grid viewport
  const focusGrid = useCallback(() => {
    gridRef.current?.focus();
  }, []);

  // Post-edit navigation handler
  const handleNavigateAfterCommit = useCallback(
    (movement: EditMovement) => {
      focusGrid();
      const { row, col } = anchor;
      switch (movement) {
        case "down":
          selectCell(Math.min(totalRows - 1, row + 1), col);
          break;
        case "up":
          selectCell(Math.max(0, row - 1), col);
          break;
        case "right":
          if (col < totalCols - 1) {
            selectCell(row, col + 1);
          } else if (row < totalRows - 1) {
            selectCell(row + 1, 0);
          }
          break;
        case "left":
          if (col > 0) {
            selectCell(row, col - 1);
          } else if (row > 0) {
            selectCell(row - 1, totalCols - 1);
          }
          break;
        case "none":
        default:
          break;
      }
    },
    [anchor, selectCell, totalRows, totalCols, focusGrid]
  );

  // Editing
  const getCellVal = useCallback(
    (r: number, c: number) => getCellValue(currentData, r, c),
    [currentData]
  );

  const {
    isEditing,
    editValue,
    editCoord,
    startEditing,
    updateEditValue,
    commitEdit,
    cancelEdit,
  } = useEditing(getCellVal, executeOperation, handleNavigateAfterCommit, readOnly);

  // Clipboard
  const getDataLatest = useCallback(() => currentData, [currentData]);
  const getSelectionLatest = useCallback(() => range, [range]);
  const getActiveCellLatest = useCallback(() => anchor, [anchor]);

  const { copy, cut, paste } = useClipboard(
    getDataLatest,
    getSelectionLatest,
    getActiveCellLatest,
    executeOperation,
    setRange,
    readOnly
  );

  // Keyboard navigation & shortcuts
  const { handleKeyDown } = useKeyboard({
    totalRows,
    totalCols,
    getData: getDataLatest,
    getActiveCell: getActiveCellLatest,
    getSelectionRange: getSelectionLatest,
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
  });

  // Cell mouse interactions
  const handleMouseDownCell = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      // If editing another cell, commit before moving
      if (isEditing) {
        commitEdit("none");
      }

      if (e.button === 0) {
        // Left click
        if (e.shiftKey) {
          extendSelection(row, col);
        } else {
          startDrag(row, col);
        }
        focusGrid();
      }
    },
    [isEditing, commitEdit, extendSelection, startDrag, focusGrid]
  );

  const handleMouseEnterCell = useCallback(
    (row: number, col: number) => {
      dragTo(row, col);
    },
    [dragTo]
  );

  const handleDoubleClickCell = useCallback(
    (_row: number, _col: number) => {
      if (!readOnly) {
        startEditing(anchor);
      }
    },
    [readOnly, startEditing, anchor]
  );

  const handleSelectRow = useCallback(
    (rowIndex: number) => {
      if (isEditing) commitEdit("none");
      setRange(rowIndex, 0, rowIndex, totalCols - 1);
      focusGrid();
    },
    [isEditing, commitEdit, setRange, totalCols, focusGrid]
  );

  const handleSelectColumn = useCallback(
    (colIndex: number) => {
      if (isEditing) commitEdit("none");
      setRange(0, colIndex, totalRows - 1, colIndex);
      focusGrid();
    },
    [isEditing, commitEdit, setRange, totalRows, focusGrid]
  );

  const handleSelectAll = useCallback(() => {
    if (isEditing) commitEdit("none");
    setRange(0, 0, totalRows - 1, totalCols - 1);
    focusGrid();
  }, [isEditing, commitEdit, setRange, totalRows, totalCols, focusGrid]);

  return (
    <div
      className={`excelat-container ${className}`}
      style={style}
      onMouseUp={stopDrag}
    >
      <Grid
        gridRef={gridRef}
        totalRows={totalRows}
        totalCols={totalCols}
        data={currentData}
        selectionRange={range}
        activeCell={anchor}
        isEditing={isEditing}
        editCoord={editCoord}
        editValue={editValue}
        onMouseDownCell={handleMouseDownCell}
        onMouseEnterCell={handleMouseEnterCell}
        onDoubleClickCell={handleDoubleClickCell}
        onEditValueChange={updateEditValue}
        onCommitEdit={commitEdit}
        onCancelEdit={() => {
          cancelEdit();
          focusGrid();
        }}
        onKeyDown={handleKeyDown}
        onSelectRow={handleSelectRow}
        onSelectColumn={handleSelectColumn}
        onSelectAll={handleSelectAll}
      />
    </div>
  );
};

Excelat.displayName = "Excelat";
