import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  ExcelatProps,
  ExcelatData,
  ExcelatColumn,
  SelectionStyle,
  ExcelatRef,
  CellCoord,
  CellRange,
  CellValue,
} from "./model/types";
import { Grid } from "./components/Grid";
import { FormulaBar } from "./components/FormulaBar";
import { useSelection } from "./hooks/useSelection";
import { useHistory } from "./hooks/useHistory";
import { useEditing, EditMovement } from "./hooks/useEditing";
import { useClipboard } from "./hooks/useClipboard";
import { useKeyboard } from "./hooks/useKeyboard";
import {
  getCellValue,
  getColumnLabel,
  getRowLabel,
  getRangeValues,
} from "./model/dataModel";
import {
  RowInsertOp,
  RowDeleteOp,
  ColumnInsertOp,
  ColumnDeleteOp,
  RangeMoveOp,
  RangeUpdateOp,
} from "./model/operations";
import "./styles/excelat.css";

export const Excelat = forwardRef<ExcelatRef, ExcelatProps>(
  (
    {
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
      onContextMenu,
      className = "",
      style,
      readOnly = false,
    },
    ref
  ) => {
    // Determine mode-based defaults
    const isTableMode = mode === "table";
    const showRowNumbers =
      propShowRowNumbers !== undefined ? propShowRowNumbers : !isTableMode;
    const showColumnLetters =
      propShowColumnLetters !== undefined ? propShowColumnLetters : !isTableMode;
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

    // Maintain internal data state to support both controlled and uncontrolled usage
    const [internalData, setInternalData] = useState<ExcelatData>(
      () => controlledData || []
    );
    const prevControlledDataRef = useRef(controlledData);

    // Sync internal state when controlledData changes from parent
    useEffect(() => {
      if (controlledData !== undefined && controlledData !== prevControlledDataRef.current) {
        prevControlledDataRef.current = controlledData;
        setInternalData(controlledData);
      }
    }, [controlledData]);

    // Compute effective data, rows and columns
    const currentData = internalData;
    const maxDataCols = currentData.reduce(
      (max, row) => Math.max(max, row ? row.length : 0),
      0
    );
    const totalRows = Math.max(initialRows ?? 100, currentData.length);
    const totalCols = Math.max(
      propColsCount ?? (isTableMode ? maxDataCols : 26),
      maxDataCols
    );

    const gridRef = useRef<HTMLDivElement>(null);

    // Column and Row Resizing state
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>(
      () => {
        const initial: Record<number, number> = {};
        if (columnDefs) {
          columnDefs.forEach((col, idx) => {
            if (col.width !== undefined) initial[idx] = col.width;
          });
        }
        return initial;
      }
    );
    const [rowHeights, setRowHeights] = useState<Record<number, number>>({});

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

    // Auto-scroll active cell into view inside the viewport on navigation
    useEffect(() => {
      const viewport = gridRef.current;
      if (!viewport) return;

      const activeTd = viewport.querySelector(
        `td[data-row="${anchor.row}"][data-col="${anchor.col}"]`
      ) as HTMLElement | null;

      if (activeTd) {
        const thead = viewport.querySelector(".excelat-thead") as HTMLElement | null;
        const theadHeight = thead ? thead.offsetHeight : 0;
        const rowHeader = activeTd.parentElement?.querySelector(
          ".excelat-row-header"
        ) as HTMLElement | null;
        const rowHeaderWidth = rowHeader ? rowHeader.offsetWidth : 0;

        const cellTop = activeTd.offsetTop;
        const cellBottom = cellTop + activeTd.offsetHeight;
        const cellLeft = activeTd.offsetLeft;
        const cellRight = cellLeft + activeTd.offsetWidth;

        const viewTop = viewport.scrollTop + theadHeight;
        const viewBottom = viewport.scrollTop + viewport.clientHeight;
        const viewLeft = viewport.scrollLeft + rowHeaderWidth;
        const viewRight = viewport.scrollLeft + viewport.clientWidth;

        if (cellTop < viewTop) {
          viewport.scrollTop = cellTop - theadHeight;
        } else if (cellBottom > viewBottom) {
          viewport.scrollTop = cellBottom - viewport.clientHeight;
        }

        if (cellLeft < viewLeft) {
          viewport.scrollLeft = cellLeft - rowHeaderWidth;
        } else if (cellRight > viewRight) {
          viewport.scrollLeft = cellRight - viewport.clientWidth;
        }
      }
    }, [anchor]);

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

    const getColumnType = useCallback(
      (colIndex: number) => columnDefs?.[colIndex]?.type,
      [columnDefs]
    );

    const {
      isEditing,
      editValue,
      editCoord,
      startEditing,
      updateEditValue,
      startOrUpdateEdit,
      commitEdit,
      cancelEdit,
    } = useEditing(
      getCellVal,
      executeOperation,
      handleNavigateAfterCommit,
      readOnly,
      getColumnType
    );

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

    // Structural Row & Column Operations
    const insertRow = useCallback(
      (index?: number) => {
        if (readOnly) return;
        const targetRow = index !== undefined ? index : anchor.row;
        const newRow = new Array(totalCols).fill(null);
        const op: RowInsertOp = {
          type: "row.insert",
          rowIndex: targetRow,
          rows: [newRow],
        };
        executeOperation(op);
      },
      [readOnly, anchor.row, totalCols, executeOperation]
    );

    const deleteRow = useCallback(
      (index?: number) => {
        if (readOnly || currentData.length <= 1) return;
        const targetRow = index !== undefined ? index : anchor.row;
        const deletedRow = currentData[targetRow]
          ? [...currentData[targetRow]]
          : [];
        const op: RowDeleteOp = {
          type: "row.delete",
          rowIndex: targetRow,
          deletedRows: [deletedRow],
        };
        executeOperation(op);
        selectCell(Math.max(0, targetRow - 1), anchor.col);
      },
      [readOnly, currentData, anchor.row, anchor.col, executeOperation, selectCell]
    );

    const insertColumn = useCallback(
      (index?: number) => {
        if (readOnly) return;
        const targetCol = index !== undefined ? index : anchor.col;
        const columnsData = currentData.map(() => [null]);
        const op: ColumnInsertOp = {
          type: "column.insert",
          columnIndex: targetCol,
          columnsData,
        };
        executeOperation(op);
      },
      [readOnly, anchor.col, currentData, executeOperation]
    );

    const deleteColumn = useCallback(
      (index?: number) => {
        if (readOnly || totalCols <= 1) return;
        const targetCol = index !== undefined ? index : anchor.col;
        const deletedColumnsData = currentData.map((r) => [
          r?.[targetCol] !== undefined ? r[targetCol] : null,
        ]);
        const op: ColumnDeleteOp = {
          type: "column.delete",
          columnIndex: targetCol,
          deletedColumnsData,
        };
        executeOperation(op);
        selectCell(anchor.row, Math.max(0, targetCol - 1));
      },
      [readOnly, totalCols, anchor.row, anchor.col, currentData, executeOperation, selectCell]
    );

    // Expose imperative ref
    useImperativeHandle(
      ref,
      () => ({
        insertRow,
        deleteRow,
        insertColumn,
        deleteColumn,
        undo,
        redo,
        copy,
        cut,
        paste: () => paste(),
        focus: focusGrid,
      }),
      [
        insertRow,
        deleteRow,
        insertColumn,
        deleteColumn,
        undo,
        redo,
        copy,
        cut,
        paste,
        focusGrid,
      ]
    );

    // Column resizing handler
    const handleStartResizeCol = useCallback(
      (e: React.MouseEvent, colIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const colDef = columnDefs?.[colIndex];
        const minW = colDef?.minWidth ?? 45;
        const maxW = colDef?.maxWidth ?? 800;
        const startWidth = columnWidths[colIndex] ?? colDef?.width ?? 100;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const delta = moveEvent.clientX - startX;
          const newWidth = Math.max(minW, Math.min(maxW, startWidth + delta));
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
        const headerText =
          columnDefs?.[colIndex]?.header ??
          (showColumnLetters ? getColumnLabel(colIndex) : "");
        maxLen = Math.max(maxLen, headerText.length);

        for (let r = 0; r < currentData.length; r++) {
          const val = currentData[r]?.[colIndex];
          if (val !== null && val !== undefined) {
            maxLen = Math.max(maxLen, String(val).length);
          }
        }

        const autoWidth = Math.max(50, Math.min(400, maxLen * 8.5 + 24));
        setColumnWidths((prev) => ({ ...prev, [colIndex]: autoWidth }));
        onColumnResize?.(colIndex, autoWidth);
      },
      [columnDefs, showColumnLetters, currentData, onColumnResize]
    );

    // Row resizing handler
    const handleStartResizeRow = useCallback(
      (e: React.MouseEvent, rowIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
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

    // Fill Handle Drag State & Logic
    const [isFillDragging, setIsFillDragging] = useState(false);
    const [fillTargetRange, setFillTargetRange] = useState<CellRange | null>(null);

    const handleFillHandleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setIsFillDragging(true);
      },
      [readOnly]
    );

    // Range Move Drag State & Logic
    const [isMoveDragging, setIsMoveDragging] = useState(false);
    const [moveDragStartCoord, setMoveDragStartCoord] = useState<CellCoord | null>(null);
    const [moveTargetRange, setMoveTargetRange] = useState<CellRange | null>(null);

    const handleRangeBorderMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setIsMoveDragging(true);
        setMoveDragStartCoord({ ...anchor });
      },
      [readOnly, anchor]
    );

    // Global mouseup to finalize fill drag or range move
    useEffect(() => {
      const handleGlobalMouseUp = () => {
        if (isFillDragging) {
          if (
            fillTargetRange &&
            (fillTargetRange.startRow !== range.startRow ||
              fillTargetRange.startColumn !== range.startColumn ||
              fillTargetRange.endRow !== range.endRow ||
              fillTargetRange.endColumn !== range.endColumn)
          ) {
            // Apply fill logic
            const sourceRows = range.endRow - range.startRow + 1;
            const sourceCols = range.endColumn - range.startColumn + 1;
            const destRows = fillTargetRange.endRow - fillTargetRange.startRow + 1;
            const destCols = fillTargetRange.endColumn - fillTargetRange.startColumn + 1;

            const filledValues: CellValue[][] = [];

            // Detect if source is a 1D numeric series in a column (e.g. 10, 20)
            const isColumnNumericSeries =
              sourceCols === 1 &&
              sourceRows >= 2 &&
              typeof getCellValue(currentData, range.startRow, range.startColumn) === "number" &&
              typeof getCellValue(currentData, range.startRow + 1, range.startColumn) === "number";

            const step = isColumnNumericSeries
              ? (getCellValue(currentData, range.startRow + 1, range.startColumn) as number) -
                (getCellValue(currentData, range.startRow, range.startColumn) as number)
              : 0;

            for (let r = 0; r < destRows; r++) {
              const rowVals: CellValue[] = [];
              const actualRow = fillTargetRange.startRow + r;

              for (let c = 0; c < destCols; c++) {
                if (isColumnNumericSeries && actualRow > range.endRow) {
                  const base = getCellValue(currentData, range.endRow, range.startColumn) as number;
                  const deltaSteps = actualRow - range.endRow;
                  rowVals.push(base + deltaSteps * step);
                } else {
                  // Repeat pattern
                  const sourceR = range.startRow + (r % sourceRows);
                  const sourceC = range.startColumn + (c % sourceCols);
                  rowVals.push(getCellValue(currentData, sourceR, sourceC));
                }
              }
              filledValues.push(rowVals);
            }

            const previousValues = getRangeValues(currentData, fillTargetRange);
            const op: RangeUpdateOp = {
              type: "range.update",
              range: fillTargetRange,
              previousValues,
              values: filledValues,
            };
            executeOperation(op);
            setRange(
              fillTargetRange.startRow,
              fillTargetRange.startColumn,
              fillTargetRange.endRow,
              fillTargetRange.endColumn
            );
          }
          setIsFillDragging(false);
          setFillTargetRange(null);
        }

        if (isMoveDragging) {
          if (
            moveTargetRange &&
            (moveTargetRange.startRow !== range.startRow ||
              moveTargetRange.startColumn !== range.startColumn)
          ) {
            const movedValues = getRangeValues(currentData, range);
            const overwrittenValues = getRangeValues(currentData, moveTargetRange);

            const op: RangeMoveOp = {
              type: "range.move",
              sourceRange: range,
              targetRange: moveTargetRange,
              movedValues,
              overwrittenValues,
            };
            executeOperation(op);
            setRange(
              moveTargetRange.startRow,
              moveTargetRange.startColumn,
              moveTargetRange.endRow,
              moveTargetRange.endColumn
            );
          }
          setIsMoveDragging(false);
          setMoveDragStartCoord(null);
          setMoveTargetRange(null);
        }
      };

      if (isFillDragging || isMoveDragging) {
        window.addEventListener("mouseup", handleGlobalMouseUp);
        return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
      }
    }, [
      isFillDragging,
      fillTargetRange,
      isMoveDragging,
      moveTargetRange,
      range,
      currentData,
      executeOperation,
      setRange,
    ]);

    // Cell mouse interactions
    const handleMouseDownCell = useCallback(
      (e: React.MouseEvent, row: number, col: number) => {
        if (isEditing) {
          commitEdit("none");
        }

        if (e.button === 0) {
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
        if (isFillDragging) {
          // Compute fill target range
          const destEndRow = Math.max(range.endRow, row);
          const destEndCol = Math.max(range.endColumn, col);
          setFillTargetRange({
            startRow: range.startRow,
            startColumn: range.startColumn,
            endRow: destEndRow,
            endColumn: destEndCol,
          });
          return;
        }

        if (isMoveDragging && moveDragStartCoord) {
          const deltaRow = row - moveDragStartCoord.row;
          const deltaCol = col - moveDragStartCoord.col;
          const spanRows = range.endRow - range.startRow;
          const spanCols = range.endColumn - range.startColumn;

          const targetStartRow = Math.max(0, range.startRow + deltaRow);
          const targetStartCol = Math.max(0, range.startColumn + deltaCol);

          setMoveTargetRange({
            startRow: targetStartRow,
            startColumn: targetStartCol,
            endRow: targetStartRow + spanRows,
            endColumn: targetStartCol + spanCols,
          });
          return;
        }

        dragTo(row, col);
      },
      [
        isFillDragging,
        isMoveDragging,
        moveDragStartCoord,
        range,
        dragTo,
      ]
    );

    const handleDoubleClickCell = useCallback(
      (row: number, col: number) => {
        if (!readOnly) {
          selectCell(row, col);
          startEditing({ row, col });
        }
      },
      [readOnly, selectCell, startEditing]
    );

    const handleContextMenuCell = useCallback(
      (e: React.MouseEvent, row: number, col: number) => {
        if (onContextMenu) {
          onContextMenu(e, {
            rowIndex: row,
            columnIndex: col,
            selection: range,
          });
        }
      },
      [onContextMenu, range]
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
            onChange={(val) => startOrUpdateEdit(anchor, val)}
            onCommit={(movement) => commitEdit(movement)}
            onCancel={cancelEdit}
            onFocus={() => {
              if (!isEditing) startEditing(anchor);
            }}
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
          fillTargetRange={fillTargetRange}
          moveTargetRange={moveTargetRange}
          onMouseDownCell={handleMouseDownCell}
          onMouseEnterCell={handleMouseEnterCell}
          onDoubleClickCell={handleDoubleClickCell}
          onContextMenuCell={handleContextMenuCell}
          onFillHandleMouseDown={handleFillHandleMouseDown}
          onRangeBorderMouseDown={handleRangeBorderMouseDown}
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
  }
);

Excelat.displayName = "Excelat";
