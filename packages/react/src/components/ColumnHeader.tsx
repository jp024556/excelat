import React, { useState, useRef, useEffect } from "react";
import { getColumnLabel } from "../model/dataModel";
import { ExcelatColumn, SortRule, Filter, FilterOperator } from "../model/types";
import { resolveColumnIndex } from "../model/sorting";
import { computeReorderTarget } from "../model/operations";

export interface ColumnHeaderProps {
  totalCols: number;
  columns?: ExcelatColumn[];
  showColumnLetters?: boolean;
  showRowNumbers?: boolean;
  columnWidths?: Record<number, number>;
  defaultColWidth?: number;
  visibleColIndices?: number[];
  leftSpacerWidth?: number;
  rightSpacerWidth?: number;
  isColumnSelected: (colIndex: number) => boolean;
  onSelectColumn?: (colIndex: number) => void;
  onSelectAll?: () => void;
  onStartResizeCol?: (e: React.MouseEvent, colIndex: number) => void;
  onAutoFitCol?: (colIndex: number) => void;
  // Sorting props
  sortingEnabled?: boolean;
  sortRules?: SortRule[];
  onSort?: (colIndex: number, isMulti: boolean) => void;
  // Filtering props
  filteringEnabled?: boolean;
  filters?: Filter[];
  onApplyFilter?: (filter: Filter) => void;
  onClearFilter?: (colIndex: number) => void;
  // Column Reordering props
  columnReorder?: boolean;
  onReorderColumn?: (fromIndex: number, toIndex: number) => void;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = React.memo(
  ({
    totalCols,
    columns,
    showColumnLetters = true,
    showRowNumbers = true,
    columnWidths = {},
    defaultColWidth = 100,
    visibleColIndices,
    leftSpacerWidth = 0,
    rightSpacerWidth = 0,
    isColumnSelected,
    onSelectColumn,
    onSelectAll,
    onStartResizeCol,
    onAutoFitCol,
    sortingEnabled = false,
    sortRules = [],
    onSort,
    filteringEnabled = false,
    filters = [],
    onApplyFilter,
    onClearFilter,
    columnReorder = true,
    onReorderColumn,
  }) => {
    const colIndices =
      visibleColIndices ?? Array.from({ length: totalCols }, (_, i) => i);

    // Column Drag & Drop Reordering state
    const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);
    const [dropIndicator, setDropIndicator] = useState<{
      targetCol: number;
      position: "before" | "after";
    } | null>(null);

    // Active filter popover column index
    const [openFilterCol, setOpenFilterCol] = useState<number | null>(null);
    const [filterOperator, setFilterOperator] = useState<FilterOperator>("contains");
    const [filterVal, setFilterVal] = useState<string>("");
    const popoverRef = useRef<HTMLDivElement>(null);

    // Sync filter state when popover opens for a column
    const handleOpenFilter = (e: React.MouseEvent, col: number) => {
      e.stopPropagation();
      if (openFilterCol === col) {
        setOpenFilterCol(null);
        return;
      }
      const existing = filters.find(
        (f) => resolveColumnIndex(f.column, columns) === col
      );
      if (existing) {
        setFilterOperator((existing.operator as FilterOperator) || "contains");
        setFilterVal(existing.value !== undefined ? String(existing.value) : "");
      } else {
        const colType = columns?.[col]?.type;
        setFilterOperator(colType === "number" || colType === "date" ? "equals" : "contains");
        setFilterVal("");
      }
      setOpenFilterCol(col);
    };

    // Close filter on outside click
    useEffect(() => {
      if (openFilterCol === null) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
          setOpenFilterCol(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openFilterCol]);

    return (
      <tr className="excelat-header-row" role="row">
        {/* Top-left corner header */}
        {showRowNumbers && (
          <th
            className="excelat-header-corner"
            role="columnheader"
            aria-label="Select all"
            onClick={onSelectAll}
          >
            <div className="excelat-corner-inner" />
          </th>
        )}

        {leftSpacerWidth > 0 && (
          <th
            style={{
              width: `${leftSpacerWidth}px`,
              minWidth: `${leftSpacerWidth}px`,
              maxWidth: `${leftSpacerWidth}px`,
              padding: 0,
              border: 0,
            }}
            aria-hidden="true"
          />
        )}

        {colIndices.map((col) => {
          const selected = isColumnSelected(col);
          const colDef = columns?.[col];
          const customHeader = colDef?.header ?? colDef?.label;
          const colLetter = getColumnLabel(col);
          const label =
            customHeader !== undefined
              ? showColumnLetters
                ? `${colLetter}: ${customHeader}`
                : customHeader
              : showColumnLetters
              ? colLetter
              : "";

          const width = columnWidths[col] ?? colDef?.width ?? defaultColWidth;

          // Check sort rule for this column
          const isColSortable = sortingEnabled && (colDef?.sortable !== false);
          const sortRuleIndex = sortRules.findIndex(
            (r) => resolveColumnIndex(r.column, columns) === col
          );
          const sortRule = sortRuleIndex !== -1 ? sortRules[sortRuleIndex] : null;

          // Check filter for this column
          const isColFilterable = filteringEnabled && (colDef?.filterable !== false);
          const isFilterActive = filters.some(
            (f) => resolveColumnIndex(f.column, columns) === col
          );

          const handleHeaderClick = (e: React.MouseEvent) => {
            if (isColSortable) {
              onSort?.(col, e.shiftKey);
            }
            onSelectColumn?.(col);
          };

          const isDraggable = columnReorder !== false && onReorderColumn !== undefined;
          const isDragging = draggedColIndex === col;
          const isDropBefore = dropIndicator?.targetCol === col && dropIndicator.position === "before";
          const isDropAfter = dropIndicator?.targetCol === col && dropIndicator.position === "after";

          return (
            <th
              key={col}
              className={`excelat-col-header ${selected ? "excelat-header-selected" : ""} ${
                isColSortable ? "excelat-header-sortable" : ""
              } ${isDraggable ? "excelat-col-draggable" : ""} ${
                isDragging ? "excelat-col-dragging" : ""
              } ${isDropBefore ? "excelat-col-drop-before" : ""} ${
                isDropAfter ? "excelat-col-drop-after" : ""
              }`}
              style={{
                width: `${width}px`,
                minWidth: `${width}px`,
                maxWidth: `${width}px`,
              }}
              role="columnheader"
              data-col={col}
              onClick={handleHeaderClick}
              title={label ? `Column: ${label}` : undefined}
              draggable={isDraggable}
              onDragStart={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest(".excelat-col-resize-handle, .excelat-filter-btn, .excelat-filter-popover")) {
                  e.preventDefault();
                  return;
                }
                setDraggedColIndex(col);
                if (e.dataTransfer) {
                  e.dataTransfer.setData("text/plain", String(col));
                  e.dataTransfer.effectAllowed = "move";
                }
              }}
              onDragOver={(e) => {
                if (draggedColIndex === null || !isDraggable) return;
                e.preventDefault();
                if (e.dataTransfer) {
                  e.dataTransfer.dropEffect = "move";
                }
                const rect = e.currentTarget.getBoundingClientRect();
                const clientX = e.clientX !== undefined ? e.clientX : 0;
                const isAfter = (clientX - rect.left) > rect.width / 2;
                const position = isAfter ? "after" : "before";
                if (dropIndicator?.targetCol !== col || dropIndicator?.position !== position) {
                  setDropIndicator({ targetCol: col, position });
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  if (dropIndicator?.targetCol === col) {
                    setDropIndicator(null);
                  }
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedColIndex !== null && dropIndicator !== null) {
                  const fromIdx = draggedColIndex;
                  const toIdx = computeReorderTarget(fromIdx, dropIndicator.targetCol, dropIndicator.position);
                  if (fromIdx !== toIdx) {
                    onReorderColumn?.(fromIdx, toIdx);
                  }
                }
                setDraggedColIndex(null);
                setDropIndicator(null);
              }}
              onDragEnd={() => {
                setDraggedColIndex(null);
                setDropIndicator(null);
              }}
            >
              <div className="excelat-col-header-content">
                <span className="excelat-col-header-text">{label}</span>

                {/* Sort Indicator */}
                {isColSortable && (
                  <span
                    className={`excelat-sort-indicator ${
                      sortRule ? "excelat-sort-active" : ""
                    }`}
                    aria-label={
                      sortRule
                        ? `Sorted ${sortRule.direction}`
                        : "Sort column"
                    }
                  >
                    {sortRule?.direction === "asc"
                      ? "▲"
                      : sortRule?.direction === "desc"
                      ? "▼"
                      : "⇅"}
                    {sortRules.length > 1 && sortRuleIndex !== -1 && (
                      <span className="excelat-sort-badge">
                        {sortRuleIndex + 1}
                      </span>
                    )}
                  </span>
                )}

                {/* Filter Icon Button */}
                {isColFilterable && (
                  <button
                    type="button"
                    className={`excelat-filter-btn ${
                      isFilterActive ? "excelat-filter-active" : ""
                    }`}
                    aria-label={`Filter column ${label}`}
                    title="Filter column"
                    onClick={(e) => handleOpenFilter(e, col)}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="11"
                      height="11"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M1.5 2.5a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 .374.832L9.5 8.243V13.5a.5.5 0 0 1-.74.437l-2-1A.5.5 0 0 1 6.5 12.5V8.243L1.626 2.832A.5.5 0 0 1 1.5 2.5z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Popover */}
              {openFilterCol === col && (
                <div
                  ref={popoverRef}
                  className="excelat-filter-popover"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                >
                  <div className="excelat-filter-popover-title">
                    Filter: {customHeader || colLetter}
                  </div>
                  <select
                    className="excelat-filter-select"
                    value={filterOperator}
                    onChange={(e) =>
                      setFilterOperator(e.target.value as FilterOperator)
                    }
                  >
                    <option value="contains">Contains</option>
                    <option value="notContains">Does not contain</option>
                    <option value="equals">Equals</option>
                    <option value="notEquals">Does not equal</option>
                    <option value="startsWith">Starts with</option>
                    <option value="endsWith">Ends with</option>
                    <option value="gt">Greater than (&gt;)</option>
                    <option value="gte">Greater or equal (&gt;=)</option>
                    <option value="lt">Less than (&lt;)</option>
                    <option value="lte">Less or equal (&lt;=)</option>
                    <option value="isEmpty">Is empty</option>
                    <option value="isNotEmpty">Is not empty</option>
                  </select>

                  {filterOperator !== "isEmpty" && filterOperator !== "isNotEmpty" && (
                    <input
                      type="text"
                      className="excelat-filter-input"
                      placeholder="Filter value..."
                      value={filterVal}
                      onChange={(e) => setFilterVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onApplyFilter?.({
                            column: colDef?.key ?? col,
                            operator: filterOperator,
                            value: filterVal,
                          });
                          setOpenFilterCol(null);
                        } else if (e.key === "Escape") {
                          setOpenFilterCol(null);
                        }
                      }}
                      autoFocus
                    />
                  )}

                  <div className="excelat-filter-actions">
                    <button
                      type="button"
                      className="excelat-filter-apply-btn"
                      onClick={() => {
                        onApplyFilter?.({
                          column: colDef?.key ?? col,
                          operator: filterOperator,
                          value: filterVal,
                        });
                        setOpenFilterCol(null);
                      }}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      className="excelat-filter-clear-btn"
                      onClick={() => {
                        onClearFilter?.(col);
                        setOpenFilterCol(null);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Column Resize Handle */}
              <div
                className="excelat-col-resize-handle"
                role="separator"
                aria-orientation="vertical"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onStartResizeCol?.(e, col);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onAutoFitCol?.(col);
                }}
              />
            </th>
          );
        })}

        {rightSpacerWidth > 0 && (
          <th
            style={{
              width: `${rightSpacerWidth}px`,
              minWidth: `${rightSpacerWidth}px`,
              maxWidth: `${rightSpacerWidth}px`,
              padding: 0,
              border: 0,
            }}
            aria-hidden="true"
          />
        )}
      </tr>
    );
  }
);

ColumnHeader.displayName = "ColumnHeader";
