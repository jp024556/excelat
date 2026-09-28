import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ExcelatProps,
  ExcelatData,
  ExcelatColumn,
  SelectionStyle,
} from "./model/types";
import { Grid } from "./components/Grid";
import { FormulaBar } from "./components/FormulaBar";
import { useSelection } from "./hooks/useSelection";
import { useHistory } from "./hooks/useHistory";
import { useEditing, EditMovement } from "./hooks/useEditing";
import { useClipboard } from "./hooks/useClipboard";
import { useKeyboard } from "./hooks/useKeyboard";
import { getCellValue, getColumnLabel, getRowLabel } from "./model/dataModel";
import "./styles/excelat.css";

export const Excelat: React.FC<ExcelatProps> = ({
  data: controlledData,
  rows: initialRows,
  columns: initialCols,
  mode = "spreadsheet",
  selectionStyle: propSelectionStyle,
  showRowNumbers: propShowRowNumbers,
  showColumnLetters: propShowColumnLetters,
  showFormulaBar = false,
  onChange,
  onSelectionChange,
  onColumnResize,
  onRowResize,
  className = "",
  style,
  readOnly = false,
}) => {
  // Determine mode-based defaults
  const isTableMode = mode === "table";
  const showRowNumbers = propShowRowNumbers !== undefined ? propShowRowNumbers : !isTableMode;
  const showColumnLetters = propShowColumnLetters !== undefined ? propShowColumnLetters : !isTableMode;
  const selectionStyle: SelectionStyle =
    propSelectionStyle !== undefined
      ? propSelectionStyle
      : isTableMode
      ? "subtle"
      : "excel";

  // Parse column definitions if provided as array
  const columnDefs: ExcelatColumn[] | undefined = Array.isArray(initialCols)
    ? initialCols
    : undefined;
  const propColsCount =
    typeof initialCols === "number"
      ? initialCols
      : columnDefs
      ? columnDefs.length
      : undefined;

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
  const totalCols = Math.max(propColsCount ?? (isTableMode ? maxDataCols : 26), maxDataCols);

  const gridRef = useRef<HTMLDivElement>(null);

  // Column and Row Resizing state
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    if (columnDefs) {
      columnDefs.forEach((col, idx) => {
        if (col.width !== undefined) initial[idx] = col.width;
      });
    }
    return initial;
  });
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});

  // Column resizing handler
  const handleStartResizeCol = useCallback(
    (e: React.MouseEvent, colIndex: number) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth =
        columnWidths[colIndex] ?? columnDefs?.[colIndex]?.width ?? 100;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(45, startWidth + delta);
        setColumnWidths((prev) => ({ ...prev, [colIndex]: newWidth }));
        onColumnResize?.(colIndex, newWidth);
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [columnWidths, columnDefs, onColumnResize]
  );

  // Auto-fit column on double-click
  const handleAutoFitCol = useCallback(
    (colIndex: number) => {
      let maxLen = 0;
      const headerText = columnDefs?.[colIndex]?.header ?? (showColumnLetters ? getColumnLabel(colIndex) : "");
      maxLen = Math.max(maxLen, headerText.length);

      for (let r = 0; r < currentData.length; r++) {
        const val = currentData[r]?.[colIndex];
        if (val !== null && val !== undefined) {
          maxLen = Math.max(maxLen, String(val).length);
        }
      }

      const autoWidth = Math.max(50, Math.min(350, maxLen * 8.5 + 24));
      setColumnWidths((prev) => ({ ...prev, [colIndex]: autoWidth }));
      onColumnResize?.(colIndex, autoWidth);
    },
    [columnDefs, showColumnLetters, currentData, onColumnResize]
  );

  // Row resizing handler
  const handleStartResizeRow = useCallback(
    (e: React.MouseEvent, rowIndex: number) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = rowHeights[rowIndex] ?? 25;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY;
        const newHeight = Math.max(20, startHeight + delta);
        setRowHeights((prev) => ({ ...prev, [rowIndex]: newHeight }));
        onRowResize?.(rowIndex, newHeight);
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [rowHeights, onRowResize]
  );

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

  const activeCoordText = `${getColumnLabel(anchor.col)}${getRowLabel(anchor.row)}`;
  const activeCellValue = getCellValue(currentData, anchor.row, anchor.col);

  return (
    <div
      className={`excelat-container excelat-mode-${mode} ${className}`}
      style={style}
      onMouseUp={stopDrag}
    >
      {showFormulaBar && (
        <FormulaBar
          activeCoordText={activeCoordText}
          activeValue={activeCellValue}
          isEditing={isEditing}
          editValue={editValue}
          onChangeEditValue={updateEditValue}
          onCommit={() => commitEdit("none")}
        />
      )}
      <Grid
        gridRef={gridRef}
        totalRows={totalRows}
        totalCols={totalCols}
        data={currentData}
        columns={columnDefs}
        mode={mode}
        showRowNumbers={showRowNumbers}
        showColumnLetters={showColumnLetters}
        selectionStyle={selectionStyle}
        columnWidths={columnWidths}
        rowHeights={rowHeights}
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
        onStartResizeCol={handleStartResizeCol}
        onAutoFitCol={handleAutoFitCol}
        onStartResizeRow={handleStartResizeRow}
      />
    </div>
  );
};

Excelat.displayName = "Excelat";
