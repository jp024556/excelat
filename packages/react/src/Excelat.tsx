import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  ExcelatProps,
  ExcelatData,
  ExcelatColumn,
  SelectionStyle,
  ExcelatRef,
  ExcelatGridState,
  CellCoord,
  CellRange,
  CellValue,
  ExcelatOperation,
  SortRule,
  SortingConfig,
  Filter,
  FilteringConfig,
  ToolbarProps,
} from "./model/types";
import { Grid } from "./components/Grid";
import { FormulaBar } from "./components/FormulaBar";
import { Pagination } from "./components/Pagination";
import { GridToolbar } from "./components/Toolbar";
import { useSelection } from "./hooks/useSelection";
import { useHistory } from "./hooks/useHistory";
import { useEditing, EditMovement } from "./hooks/useEditing";
import { useClipboard } from "./hooks/useClipboard";
import { useKeyboard } from "./hooks/useKeyboard";
import { useVirtualization } from "./hooks/useVirtualization";
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
  ColumnReorderOp,
  RangeMoveOp,
  RangeUpdateOp,
  createNullMatrix,
  reorderArray,
  reorderColumnsAndData,
} from "./model/operations";
import { sortIndexedRows, cycleSortRule, resolveColumnIndex } from "./model/sorting";
import { filterIndexedRows } from "./model/filtering";
import { buildGroupedDisplayRows, GridDisplayRow } from "./model/grouping";
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
      virtualization,
      sorting,
      onSortChange,
      filtering,
      onFilterChange,
      grouping,
      onGroupChange,
      toolbar,
      pagination,
      onPageChange,
      onPageSizeChange,
      renderPagination,
      hasMore,
      loading = false,
      onLoadMore,
      onOperation,
      onChange,
      onSelectionChange,
      onColumnResize,
      onRowResize,
      columnReorder = true,
      onColumnReorder,
      initialState,
      onStateChange,
      onContextMenu,
      className = "",
      style,
      readOnly = false,
      theme,
    },
    ref
  ) => {
    // Determine theme classes
    const themeClass = theme === "dark" ? "excelat-theme-dark dark" : theme === "light" ? "excelat-theme-light" : "";
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

    // Internal column definitions state (for reordering, state persistence, or local updates)
    const [internalColumns, setInternalColumns] = useState<ExcelatColumn[] | undefined>(
      () => {
        const cols = Array.isArray(initialCols) ? initialCols : undefined;
        if (cols && initialState?.columnOrder && initialState.columnOrder.length > 0) {
          return reorderColumnsAndData(cols, [], initialState.columnOrder).columns;
        }
        return cols;
      }
    );
    const [prevInitialCols, setPrevInitialCols] = useState(initialCols);
    if (initialCols !== prevInitialCols) {
      setPrevInitialCols(initialCols);
      setInternalColumns(Array.isArray(initialCols) ? initialCols : undefined);
    }

    const columnDefs = internalColumns;
    const propColsCount = typeof initialCols === "number" ? initialCols : undefined;

    // Internal data state (for uncontrolled, state persistence, or local mutations)
    const [internalData, setInternalData] = useState<ExcelatData>(
      () => {
        const initial = controlledData || [];
        const cols = Array.isArray(initialCols) ? initialCols : undefined;
        if (cols && initialState?.columnOrder && initialState.columnOrder.length > 0 && initial.length > 0) {
          return reorderColumnsAndData(cols, initial, initialState.columnOrder).data;
        }
        return initial;
      }
    );
    const [prevControlledData, setPrevControlledData] = useState(controlledData);

    // Sync internal state immediately during render when controlledData changes from parent
    if (controlledData !== undefined && controlledData !== prevControlledData) {
      setPrevControlledData(controlledData);
      setInternalData(controlledData);
    }

    const currentData = internalData;
    const maxDataCols = currentData.reduce(
      (max, row) => Math.max(max, row ? row.length : 0),
      0
    );
    const columnsCount =
      propColsCount ?? (columnDefs ? columnDefs.length : undefined);
    const totalCols = Math.max(
      columnsCount ?? (isTableMode ? maxDataCols : 26),
      maxDataCols,
      columnsCount ?? 0
    );

    const gridRef = useRef<HTMLDivElement>(null);

    // Column and Row Resizing state
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>(
      () => {
        const initial: Record<number, number> = {};
        const cols = Array.isArray(initialCols) ? initialCols : undefined;
        const effectiveCols =
          cols && initialState?.columnOrder && initialState.columnOrder.length > 0
            ? reorderColumnsAndData(cols, [], initialState.columnOrder).columns
            : cols;

        if (effectiveCols) {
          effectiveCols.forEach((col, idx) => {
            if (col.width !== undefined) initial[idx] = col.width;
          });
        }

        if (initialState?.columnWidths) {
          Object.entries(initialState.columnWidths).forEach(([k, w]) => {
            const num = parseInt(k, 10);
            if (!isNaN(num) && String(num) === k) {
              initial[num] = w;
            } else if (effectiveCols) {
              const matchIdx = effectiveCols.findIndex(
                (c) => c.key === k || c.header === k || c.label === k
              );
              if (matchIdx !== -1) initial[matchIdx] = w;
            }
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
    const { executeOperation, undo, redo, canUndo, canRedo } = useHistory(setData, onOperation);

    // -------------------------------------------------------------------------
    // Sorting State & Handlers
    // -------------------------------------------------------------------------
    const isSortingEnabled = !!sorting;
    const sortingConfig: SortingConfig | undefined =
      typeof sorting === "object" ? sorting : undefined;

    const [internalSortRules, setInternalSortRules] = useState<SortRule[]>(
      () => initialState?.sorting || sortingConfig?.sort || []
    );
    useEffect(() => {
      if (sortingConfig?.sort !== undefined) {
        setInternalSortRules(sortingConfig.sort);
      }
    }, [sortingConfig?.sort]);

    const activeSortRules =
      sortingConfig?.sort !== undefined ? sortingConfig.sort : internalSortRules;

    const handleSort = useCallback(
      (colIndex: number, isMulti: boolean) => {
        const isMultiColumn = isMulti || !!sortingConfig?.multiColumn;
        const nextRules = cycleSortRule(activeSortRules, colIndex, isMultiColumn, columnDefs);
        if (!sortingConfig?.sort) {
          setInternalSortRules(nextRules);
        }
        onSortChange?.(nextRules);
      },
      [activeSortRules, columnDefs, sortingConfig?.multiColumn, sortingConfig?.sort, onSortChange]
    );

    // -------------------------------------------------------------------------
    // Filtering State & Handlers
    // -------------------------------------------------------------------------
    const isFilteringEnabled = !!filtering;
    const filteringConfig: FilteringConfig | undefined =
      typeof filtering === "object" ? filtering : undefined;

    const [internalFilters, setInternalFilters] = useState<Filter[]>(
      () => initialState?.filtering || filteringConfig?.filters || []
    );
    useEffect(() => {
      if (filteringConfig?.filters !== undefined) {
        setInternalFilters(filteringConfig.filters);
      }
    }, [filteringConfig?.filters]);

    const activeFilters =
      filteringConfig?.filters !== undefined ? filteringConfig.filters : internalFilters;

    const handleApplyFilter = useCallback(
      (newFilter: Filter) => {
        const colIdx = resolveColumnIndex(newFilter.column, columnDefs);
        const nextFilters = activeFilters.filter(
          (f) => resolveColumnIndex(f.column, columnDefs) !== colIdx
        );
        if (
          (newFilter.value !== "" && newFilter.value !== null && newFilter.value !== undefined) ||
          newFilter.operator === "isEmpty" ||
          newFilter.operator === "isNotEmpty"
        ) {
          nextFilters.push(newFilter);
        }
        if (!filteringConfig?.filters) {
          setInternalFilters(nextFilters);
        }
        onFilterChange?.(nextFilters);
      },
      [activeFilters, columnDefs, filteringConfig?.filters, onFilterChange]
    );

    const handleClearFilter = useCallback(
      (colIndex: number) => {
        const nextFilters = activeFilters.filter(
          (f) => resolveColumnIndex(f.column, columnDefs) !== colIndex
        );
        if (!filteringConfig?.filters) {
          setInternalFilters(nextFilters);
        }
        onFilterChange?.(nextFilters);
      },
      [activeFilters, columnDefs, filteringConfig?.filters, onFilterChange]
    );

    // -------------------------------------------------------------------------
    // Grouping State & Handlers
    // -------------------------------------------------------------------------
    const [internalGroupColumns, setInternalGroupColumns] = useState<(string | number)[] | undefined>(
      () => initialState?.grouping?.columns ?? grouping?.columns
    );
    useEffect(() => {
      setInternalGroupColumns(grouping?.columns);
    }, [grouping?.columns]);

    const activeGroupColumns =
      grouping !== undefined ? grouping.columns : internalGroupColumns;

    const [internalExpanded, setInternalExpanded] = useState<Record<string, boolean>>(
      () => initialState?.grouping?.expanded || grouping?.expanded || {}
    );
    useEffect(() => {
      if (grouping?.expanded !== undefined) {
        setInternalExpanded(grouping.expanded);
      }
    }, [grouping?.expanded]);

    const activeExpanded =
      grouping?.expanded !== undefined ? grouping.expanded : internalExpanded;

    const handleToggleGroup = useCallback(
      (groupKey: string) => {
        const isCurrentlyExpanded =
          activeExpanded[groupKey] !== undefined
            ? activeExpanded[groupKey]
            : grouping?.defaultExpanded !== false;
        const nextExpanded = {
          ...activeExpanded,
          [groupKey]: !isCurrentlyExpanded,
        };
        if (!grouping?.expanded) {
          setInternalExpanded(nextExpanded);
        }
        const expandedKeys = Object.keys(nextExpanded).filter((k) => nextExpanded[k]);
        onGroupChange?.(expandedKeys);
      },
      [activeExpanded, grouping?.defaultExpanded, grouping?.expanded, onGroupChange]
    );

    // -------------------------------------------------------------------------
    // Composable Data Pipeline: Filter -> Sort -> Group -> Paginate
    // -------------------------------------------------------------------------
    const baseIndexedRows = useMemo(() => {
      return currentData.map((row, index) => ({ row, index }));
    }, [currentData]);

    const filteredRows = useMemo(() => {
      const isClient = !filteringConfig?.mode || filteringConfig.mode === "client";
      if (isFilteringEnabled && isClient && activeFilters.length > 0) {
        return filterIndexedRows(baseIndexedRows, activeFilters, columnDefs);
      }
      return baseIndexedRows;
    }, [baseIndexedRows, isFilteringEnabled, filteringConfig?.mode, activeFilters, columnDefs]);

    const sortedRows = useMemo(() => {
      const isClient = !sortingConfig?.mode || sortingConfig.mode === "client";
      if (isSortingEnabled && isClient && activeSortRules.length > 0) {
        return sortIndexedRows(filteredRows, activeSortRules, columnDefs);
      }
      return filteredRows;
    }, [filteredRows, isSortingEnabled, sortingConfig?.mode, activeSortRules, columnDefs]);

    const groupedDisplayRows: GridDisplayRow[] = useMemo(() => {
      if (activeGroupColumns && activeGroupColumns.length > 0) {
        return buildGroupedDisplayRows(
          sortedRows,
          activeGroupColumns,
          activeExpanded,
          grouping?.defaultExpanded !== false,
          columnDefs
        );
      }
      return sortedRows.map((item) => ({
        type: "data" as const,
        dataRowIndex: item.index,
        row: item.row,
        depth: 0,
      }));
    }, [sortedRows, activeGroupColumns, activeExpanded, grouping?.defaultExpanded, columnDefs]);

    const isClientPagination = pagination?.mode === "client";
    const displayRows: GridDisplayRow[] = useMemo(() => {
      if (isClientPagination && pagination) {
        const { page, pageSize } = pagination;
        const start = (page - 1) * pageSize;
        return groupedDisplayRows.slice(start, start + pageSize);
      }
      return groupedDisplayRows;
    }, [groupedDisplayRows, isClientPagination, pagination]);

    const hasActiveTransformations =
      (isFilteringEnabled && activeFilters.length > 0) ||
      (activeGroupColumns && activeGroupColumns.length > 0) ||
      (pagination !== undefined);

    const defaultInitialRows = isTableMode ? displayRows.length : 100;
    const totalRows = hasActiveTransformations
      ? displayRows.length
      : Math.max(initialRows ?? defaultInitialRows, displayRows.length);

    // Row offset for pagination
    const rowOffset = pagination
      ? Math.max(0, (pagination.page - 1) * pagination.pageSize)
      : 0;

    // Virtualization
    const virtualizationState = useVirtualization({
      enabled: virtualization,
      totalRows,
      totalCols,
      rowHeights,
      defaultRowHeight: 25,
      columnWidths,
      defaultColWidth: 100,
      columns: columnDefs,
      viewportRef: gridRef,
      hasMore,
      loading,
      onLoadMore,
    });

    // Selection
    const {
      anchor,
      range,
      selectCell,
      setRange,
      extendSelection,
      startDrag,
      dragTo,
      stopDrag,
    } = useSelection(
      Math.max(1, totalRows),
      Math.max(1, totalCols),
      onSelectionChange
    );

    // Focus grid
    const focusGrid = useCallback(() => {
      if (gridRef.current) {
        gridRef.current.focus({ preventScroll: true });
      }
    }, []);

    // Helper: translate visible display row index to underlying data row index
    const getDataRowIndex = useCallback(
      (displayRowIdx: number) => {
        const item = displayRows[displayRowIdx];
        if (item && item.type === "data") {
          return item.dataRowIndex;
        }
        return displayRowIdx;
      },
      [displayRows]
    );

    // Auto-scroll when active cell moves
    useEffect(() => {
      const viewport = gridRef.current;
      if (!viewport) return;

      let cellTop = 0;
      for (let r = 0; r < anchor.row; r++) {
        cellTop += rowHeights[r] ?? 25;
      }
      const cellHeight = rowHeights[anchor.row] ?? 25;
      const cellBottom = cellTop + cellHeight;

      let cellLeft = 0;
      for (let c = 0; c < anchor.col; c++) {
        cellLeft += columnWidths[c] ?? columnDefs?.[c]?.width ?? 100;
      }
      const cellWidth =
        columnWidths[anchor.col] ?? columnDefs?.[anchor.col]?.width ?? 100;
      const cellRight = cellLeft + cellWidth;

      const theadHeight = 25;
      const rowHeaderWidth =
        columnDefs && columnDefs.some((c) => c?.header || c?.label)
          ? showRowNumbers
            ? 46
            : 0
          : showRowNumbers
          ? 40
          : 0;

      const viewTop = viewport.scrollTop;
      const viewBottom = viewport.scrollTop + viewport.clientHeight - theadHeight;
      const viewLeft = viewport.scrollLeft;
      const viewRight = viewport.scrollLeft + viewport.clientWidth - rowHeaderWidth;

      if (cellTop < viewTop) {
        viewport.scrollTop = cellTop;
      } else if (cellBottom > viewBottom) {
        viewport.scrollTop = cellBottom - viewport.clientHeight + theadHeight;
      }

      if (cellLeft < viewLeft) {
        viewport.scrollLeft = cellLeft;
      } else if (cellRight > viewRight) {
        viewport.scrollLeft = cellRight - viewport.clientWidth + rowHeaderWidth;
      }
    }, [anchor, rowHeights, columnWidths, columnDefs, showRowNumbers]);

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
      (displayRowIdx: number, c: number) => {
        const dataRowIdx = getDataRowIndex(displayRowIdx);
        return getCellValue(currentData, dataRowIdx, c);
      },
      [currentData, getDataRowIndex]
    );

    const getColumnType = useCallback(
      (colIndex: number) => columnDefs?.[colIndex]?.type,
      [columnDefs]
    );

    // Wrap executeOperation for cell edits to map display row to underlying dataRowIndex
    const executeOperationMapped = useCallback(
      (op: any, publicOp?: ExcelatOperation) => {
        if (op.type === "cell.update") {
          const underlyingRow = getDataRowIndex(op.row);
          executeOperation({ ...op, row: underlyingRow }, publicOp);
        } else {
          executeOperation(op, publicOp);
        }
      },
      [executeOperation, getDataRowIndex]
    );

    const {
      isEditing,
      editValue,
      editCoord,
      startEditing: internalStartEditing,
      updateEditValue,
      startOrUpdateEdit,
      commitEdit,
      cancelEdit,
    } = useEditing(
      getCellVal,
      executeOperationMapped,
      handleNavigateAfterCommit,
      readOnly,
      getColumnType
    );

    // Group rows cannot be edited
    const startEditing = useCallback(
      (coord?: CellCoord, initialVal?: string) => {
        const targetCoord = coord || anchor;
        if (displayRows[targetCoord.row]?.type === "group") {
          return;
        }
        internalStartEditing(targetCoord, initialVal);
      },
      [anchor, displayRows, internalStartEditing]
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
      (index?: number, values?: CellValue[]) => {
        if (readOnly) return;
        const targetRow = index !== undefined ? index : anchor.row;
        const rowToInsert =
          values && values.length > 0
            ? Array.from({ length: totalCols }, (_, c) =>
                c < values.length ? values[c] : null
              )
            : new Array(totalCols).fill(null);
        const op: RowInsertOp = {
          type: "row.insert",
          rowIndex: targetRow,
          rows: [rowToInsert],
        };
        const publicOp: ExcelatOperation = {
          type: "row.insert",
          index: targetRow,
          values: values ?? undefined,
        };
        executeOperation(op, publicOp);
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
        const publicOp: ExcelatOperation = {
          type: "row.delete",
          index: targetRow,
        };
        executeOperation(op, publicOp);
        selectCell(Math.max(0, targetRow - 1), anchor.col);
      },
      [readOnly, currentData, anchor.row, anchor.col, executeOperation, selectCell]
    );

    const insertColumn = useCallback(
      (index?: number, values?: CellValue[]) => {
        if (readOnly) return;
        const targetCol = index !== undefined ? index : anchor.col;
        const columnsData = currentData.map((_, r) => [
          values && values[r] !== undefined ? values[r] : null,
        ]);
        const op: ColumnInsertOp = {
          type: "column.insert",
          columnIndex: targetCol,
          columnsData: columnsData,
        };
        const publicOp: ExcelatOperation = {
          type: "column.insert",
          index: targetCol,
        };
        executeOperation(op, publicOp);
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
        const publicOp: ExcelatOperation = {
          type: "column.delete",
          index: targetCol,
        };
        executeOperation(op, publicOp);
        selectCell(anchor.row, Math.max(0, targetCol - 1));
      },
      [readOnly, totalCols, anchor.row, anchor.col, currentData, executeOperation, selectCell]
    );

    const reorderColumn = useCallback(
      (fromIndex: number, toIndex: number) => {
        if (readOnly || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
        if (fromIndex >= totalCols || toIndex >= totalCols) return;

        // 1. Reorder column widths
        setColumnWidths((prev) => {
          const currentList = Array.from({ length: totalCols }, (_, i) => prev[i]);
          const nextList = reorderArray(currentList, fromIndex, toIndex);
          const nextWidths: Record<number, number> = {};
          nextList.forEach((w, i) => {
            if (w !== undefined) nextWidths[i] = w;
          });
          return nextWidths;
        });

        // 2. Reorder internalColumns if defined
        let nextCols: ExcelatColumn[] | undefined;
        if (internalColumns) {
          nextCols = reorderArray(internalColumns, fromIndex, toIndex);
          setInternalColumns(nextCols);
        }

        // 3. Apply operation to data
        const op: ColumnReorderOp = {
          type: "column.reorder",
          fromIndex,
          toIndex,
        };
        const publicOp: ExcelatOperation = {
          type: "column.reorder",
          fromIndex,
          toIndex,
        };
        executeOperation(op, publicOp);

        onColumnReorder?.(fromIndex, toIndex, nextCols);
      },
      [readOnly, totalCols, internalColumns, executeOperation, onColumnReorder]
    );

    // State Persistence (getState, setState, resetState, onStateChange)
    const getState = useCallback((): ExcelatGridState => {
      const columnOrder = internalColumns
        ? internalColumns.map((c, i) => c.key || c.header || c.label || String(i))
        : Array.from({ length: totalCols }, (_, i) => String(i));

      const widths: Record<string | number, number> = {};
      Object.entries(columnWidths).forEach(([idxStr, w]) => {
        const idx = parseInt(idxStr, 10);
        const colKey = internalColumns?.[idx]?.key;
        if (colKey) {
          widths[colKey] = w;
        }
        widths[idx] = w;
      });

      return {
        columnOrder,
        columnWidths: Object.keys(widths).length > 0 ? widths : undefined,
        sorting: activeSortRules.length > 0 ? [...activeSortRules] : undefined,
        filtering: activeFilters.length > 0 ? [...activeFilters] : undefined,
        grouping:
          (activeGroupColumns && activeGroupColumns.length > 0) ||
          Object.keys(activeExpanded).length > 0
            ? {
                columns: activeGroupColumns ? [...activeGroupColumns] : undefined,
                expanded: { ...activeExpanded },
              }
            : undefined,
        pagination: pagination
          ? {
              page: pagination.page,
              pageSize: pagination.pageSize,
            }
          : undefined,
      };
    }, [
      internalColumns,
      totalCols,
      columnWidths,
      activeSortRules,
      activeFilters,
      activeGroupColumns,
      activeExpanded,
      pagination,
    ]);

    const setState = useCallback(
      (nextState: Partial<ExcelatGridState>) => {
        // 1. Column Order
        if (nextState.columnOrder && nextState.columnOrder.length > 0) {
          const currentCols = internalColumns ?? (Array.isArray(initialCols) ? initialCols : undefined);
          const res = reorderColumnsAndData(currentCols, currentData, nextState.columnOrder);
          if (res.columns) {
            setInternalColumns(res.columns);
          }
          setData(() => res.data);
          if (!nextState.columnWidths) {
            setColumnWidths((prev) => {
              const next: Record<number, number> = {};
              res.newToOld.forEach((oldIdx, newIdx) => {
                if (prev[oldIdx] !== undefined) next[newIdx] = prev[oldIdx];
              });
              return next;
            });
          }
        }

        // 2. Column Widths
        if (nextState.columnWidths) {
          const cols = internalColumns ?? (Array.isArray(initialCols) ? initialCols : undefined);
          setColumnWidths((prev) => {
            const next = { ...prev };
            Object.entries(nextState.columnWidths!).forEach(([k, w]) => {
              const num = parseInt(k, 10);
              if (!isNaN(num) && String(num) === k) {
                next[num] = w;
              } else if (cols) {
                const idx = cols.findIndex((c) => c.key === k || c.header === k || c.label === k);
                if (idx !== -1) next[idx] = w;
              }
            });
            return next;
          });
        }

        // 3. Sorting
        if (nextState.sorting !== undefined) {
          setInternalSortRules(nextState.sorting);
          onSortChange?.(nextState.sorting);
        }

        // 4. Filtering
        if (nextState.filtering !== undefined) {
          setInternalFilters(nextState.filtering);
          onFilterChange?.(nextState.filtering);
        }

        // 5. Grouping
        if (nextState.grouping?.columns !== undefined) {
          setInternalGroupColumns(nextState.grouping.columns);
        }
        if (nextState.grouping?.expanded !== undefined) {
          setInternalExpanded(nextState.grouping.expanded);
          onGroupChange?.(
            Object.keys(nextState.grouping.expanded).filter((k) => nextState.grouping!.expanded![k])
          );
        }

        // 6. Pagination
        if (nextState.pagination) {
          if (nextState.pagination.page !== undefined) {
            pagination?.onPageChange?.(nextState.pagination.page);
            onPageChange?.(nextState.pagination.page);
          }
          if (nextState.pagination.pageSize !== undefined) {
            pagination?.onPageSizeChange?.(nextState.pagination.pageSize);
            onPageSizeChange?.(nextState.pagination.pageSize);
          }
        }
      },
      [
        internalColumns,
        initialCols,
        currentData,
        setData,
        onSortChange,
        onFilterChange,
        onGroupChange,
        pagination,
        onPageChange,
        onPageSizeChange,
      ]
    );

    const resetState = useCallback(() => {
      const origCols = Array.isArray(initialCols) ? initialCols : undefined;
      setInternalColumns(origCols);
      setData(() => controlledData || []);

      const initialWidths: Record<number, number> = {};
      if (origCols) {
        origCols.forEach((col, idx) => {
          if (col.width !== undefined) initialWidths[idx] = col.width;
        });
      }
      setColumnWidths(initialWidths);

      const origSort = sortingConfig?.sort || [];
      setInternalSortRules(origSort);
      onSortChange?.(origSort);

      const origFilters = filteringConfig?.filters || [];
      setInternalFilters(origFilters);
      onFilterChange?.(origFilters);

      setInternalGroupColumns(grouping?.columns);
      setInternalExpanded(grouping?.expanded || {});
      onGroupChange?.(
        grouping?.expanded ? Object.keys(grouping.expanded).filter((k) => grouping.expanded![k]) : []
      );

      if (pagination) {
        pagination.onPageChange?.(1);
        onPageChange?.(1);
      }
    }, [
      initialCols,
      controlledData,
      setData,
      sortingConfig?.sort,
      onSortChange,
      filteringConfig?.filters,
      onFilterChange,
      grouping?.columns,
      grouping?.expanded,
      onGroupChange,
      pagination,
      onPageChange,
    ]);

    // Track state mutations for onStateChange callback
    const lastSerializedState = useRef<string>("");
    useEffect(() => {
      if (!onStateChange) return;
      const state = getState();
      const serialized = JSON.stringify(state);
      if (serialized !== lastSerializedState.current) {
        lastSerializedState.current = serialized;
        onStateChange(state);
      }
    }, [getState, onStateChange]);

    // Imperative Ref API
    useImperativeHandle(
      ref,
      () => ({
        insertRow,
        deleteRow,
        insertColumn,
        deleteColumn,
        reorderColumn,
        getState,
        setState,
        resetState,
        undo,
        redo,
        copy,
        cut,
        paste,
        focus: focusGrid,
      }),
      [
        insertRow,
        deleteRow,
        insertColumn,
        deleteColumn,
        reorderColumn,
        getState,
        setState,
        resetState,
        undo,
        redo,
        copy,
        cut,
        paste,
        focusGrid,
      ]
    );

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

    // Mouse handlers for cell interactions
    const handleMouseDownCell = useCallback(
      (e: React.MouseEvent, row: number, col: number) => {
        if (e.button !== 0) return; // Only primary button
        focusGrid();

        if (displayRows[row]?.type === "group") {
          selectCell(row, col);
          return;
        }

        if (isEditing) {
          commitEdit("none");
        }

        if (e.shiftKey) {
          extendSelection(row, col);
        } else {
          startDrag(row, col);
        }
      },
      [focusGrid, displayRows, isEditing, commitEdit, extendSelection, startDrag, selectCell]
    );

    const handleMouseEnterCell = useCallback(
      (row: number, col: number) => {
        if (isFillDragging) {
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
      [isFillDragging, isMoveDragging, moveDragStartCoord, range, dragTo]
    );

    const handleDoubleClickCell = useCallback(
      (row: number, _col: number) => {
        if (displayRows[row]?.type === "group") {
          const item = displayRows[row] as any;
          handleToggleGroup(item.groupKey);
          return;
        }
        if (!readOnly) {
          selectCell(row, _col);
          startEditing({ row, col: _col });
        }
      },
      [displayRows, handleToggleGroup, readOnly, selectCell, startEditing]
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

    // Resizing columns
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

    const handleAutoFitCol = useCallback(
      (colIndex: number) => {
        let maxLen = 0;
        const headerText =
          columnDefs?.[colIndex]?.header ??
          columnDefs?.[colIndex]?.label ??
          (showColumnLetters ? getColumnLabel(colIndex) : "");
        maxLen = Math.max(maxLen, headerText.length);

        for (let r = 0; r < currentData.length; r++) {
          const val = currentData[r]?.[colIndex];
          if (val !== null && val !== undefined) {
            maxLen = Math.max(maxLen, String(val).length);
          }
        }
        const autoWidth = Math.max(50, Math.min(500, maxLen * 8 + 24));
        setColumnWidths((prev) => ({ ...prev, [colIndex]: autoWidth }));
        onColumnResize?.(colIndex, autoWidth);
      },
      [columnDefs, showColumnLetters, currentData, onColumnResize]
    );

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
    const { handleKeyDown: originalHandleKeyDown } = useKeyboard({
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

    // Intercept Enter / Space on group rows to toggle expansion
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const currentItem = displayRows[anchor.row];
        if (currentItem && currentItem.type === "group" && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleToggleGroup(currentItem.groupKey);
          return;
        }
        originalHandleKeyDown(e);
      },
      [displayRows, anchor.row, handleToggleGroup, originalHandleKeyDown]
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
            const sourceRows = range.endRow - range.startRow + 1;
            const sourceCols = range.endColumn - range.startColumn + 1;
            const destRows = fillTargetRange.endRow - fillTargetRange.startRow + 1;
            const destCols = fillTargetRange.endColumn - fillTargetRange.startColumn + 1;

            const filledValues: CellValue[][] = [];
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
                const actualCol = fillTargetRange.startColumn + c;
                if (
                  actualRow >= range.startRow &&
                  actualRow <= range.endRow &&
                  actualCol >= range.startColumn &&
                  actualCol <= range.endColumn
                ) {
                  rowVals.push(getCellValue(currentData, actualRow, actualCol));
                } else if (isColumnNumericSeries && actualRow > range.endRow) {
                  const baseVal = getCellValue(currentData, range.endRow, actualCol) as number;
                  const offset = actualRow - range.endRow;
                  rowVals.push(baseVal + offset * step);
                } else {
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
              range: { ...fillTargetRange },
              previousValues,
              values: filledValues,
            };
            const publicOp: ExcelatOperation = {
              type: "range.fill",
              source: { ...range },
              destination: { ...fillTargetRange },
              values: filledValues,
            };

            executeOperation(op, publicOp);
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
            const values = getRangeValues(currentData, range);
            const overwrittenValues = getRangeValues(currentData, moveTargetRange);
            const op: RangeMoveOp = {
              type: "range.move",
              sourceRange: { ...range },
              targetRange: { ...moveTargetRange },
              movedValues: values,
              overwrittenValues,
            };
            const publicOp: ExcelatOperation = {
              type: "range.move",
              source: { ...range },
              destination: { ...moveTargetRange },
              values,
            };

            executeOperation(op, publicOp);
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
      range,
      currentData,
      executeOperation,
      setRange,
      isMoveDragging,
      moveTargetRange,
    ]);

    // Active cell display coord & value
    const activeCoordText = `${getColumnLabel(anchor.col)}${getRowLabel(anchor.row)}`;
    const activeDataRowIdx = getDataRowIndex(anchor.row);
    const activeCellValue = getCellValue(currentData, activeDataRowIdx, anchor.col);

    // Toolbar Props
    const toolbarProps: ToolbarProps = useMemo(() => {
      const selectedRowsList: number[] = [];
      for (let r = range.startRow; r <= range.endRow; r++) {
        selectedRowsList.push(r);
      }
      const selectedColsList: number[] = [];
      for (let c = range.startColumn; c <= range.endColumn; c++) {
        selectedColsList.push(c);
      }

      return {
        selection: range,
        activeCell: anchor,
        selectedRows: selectedRowsList,
        selectedCols: selectedColsList,
        canUndo,
        canRedo,
        undo,
        redo,
        deleteRows: (rowIndices) => {
          if (rowIndices && rowIndices.length > 0) {
            [...rowIndices].sort((a, b) => b - a).forEach((idx) => deleteRow(idx));
          } else {
            for (let r = range.endRow; r >= range.startRow; r--) {
              deleteRow(r);
            }
          }
        },
        insertRow: (idx, vals) => insertRow(idx, vals),
        deleteColumns: (colIndices) => {
          if (colIndices && colIndices.length > 0) {
            [...colIndices].sort((a, b) => b - a).forEach((idx) => deleteColumn(idx));
          } else {
            for (let c = range.endColumn; c >= range.startColumn; c--) {
              deleteColumn(c);
            }
          }
        },
        insertColumn: (idx, vals) => insertColumn(idx, vals),
        copy,
        cut,
        paste,
        clearSelection: () => {
          const rowsCount = range.endRow - range.startRow + 1;
          const colsCount = range.endColumn - range.startColumn + 1;
          const nulls = createNullMatrix(rowsCount, colsCount);
          const previousValues = getRangeValues(currentData, range);
          const op: RangeUpdateOp = {
            type: "range.update",
            range: { ...range },
            previousValues,
            values: nulls,
          };
          executeOperation(op, { type: "range.clear", range: { ...range } });
        },
        data: currentData,
        totalRows,
        totalCols,
        sort: activeSortRules,
        setSort: (rules) => {
          setInternalSortRules(rules);
          onSortChange?.(rules);
        },
        filters: activeFilters,
        setFilters: (newFilters) => {
          setInternalFilters(newFilters);
          onFilterChange?.(newFilters);
        },
        clearFilters: () => {
          setInternalFilters([]);
          onFilterChange?.([]);
        },
        groupColumns: grouping?.columns,
        setGroupColumns: () => {},
      };
    }, [
      range,
      anchor,
      canUndo,
      canRedo,
      undo,
      redo,
      deleteRow,
      insertRow,
      deleteColumn,
      insertColumn,
      copy,
      cut,
      paste,
      executeOperation,
      currentData,
      totalRows,
      totalCols,
      activeSortRules,
      onSortChange,
      activeFilters,
      onFilterChange,
      grouping?.columns,
    ]);

    // Effective total count for pagination
    const paginationTotal =
      pagination?.total ?? (isClientPagination ? groupedDisplayRows.length : currentData.length);
    const paginationTotalPages = pagination
      ? Math.max(1, Math.ceil(paginationTotal / pagination.pageSize))
      : 1;

    return (
      <div
        className={`excelat excelat-container excelat-mode-${mode} ${themeClass} ${className}`.trim()}
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
        {toolbar && <GridToolbar toolbar={toolbar} toolbarProps={toolbarProps} />}
        <Grid
          gridRef={gridRef}
          totalRows={totalRows}
          totalCols={totalCols}
          data={currentData}
          displayRows={displayRows}
          onToggleGroup={handleToggleGroup}
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
          virtualization={virtualizationState}
          rowOffset={rowOffset}
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
          sortingEnabled={isSortingEnabled}
          sortRules={activeSortRules}
          onSort={handleSort}
          filteringEnabled={isFilteringEnabled}
          filters={activeFilters}
          onApplyFilter={handleApplyFilter}
          onClearFilter={handleClearFilter}
          columnReorder={columnReorder}
          onReorderColumn={reorderColumn}
        />
        {loading && (
          <div className="excelat-loading-banner" role="status" aria-live="polite">
            <span className="excelat-spinner" /> Loading...
          </div>
        )}
        {pagination &&
          (() => {
            const effectivePageChange = onPageChange || pagination.onPageChange;
            const effectivePageSizeChange = onPageSizeChange || pagination.onPageSizeChange;
            return renderPagination ? (
              renderPagination({
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: paginationTotal,
                totalPages: paginationTotalPages,
                startItem:
                  paginationTotal > 0
                    ? Math.min((pagination.page - 1) * pagination.pageSize + 1, paginationTotal)
                    : 0,
                endItem: Math.min(pagination.page * pagination.pageSize, paginationTotal),
                onPageChange: effectivePageChange || (() => {}),
                onPageSizeChange: effectivePageSizeChange,
                loading,
              })
            ) : (
              <Pagination
                config={{
                  ...pagination,
                  total: paginationTotal,
                }}
                onPageChange={effectivePageChange}
                onPageSizeChange={effectivePageSizeChange}
                loading={loading}
              />
            );
          })()}
      </div>
    );
  }
);

Excelat.displayName = "Excelat";
