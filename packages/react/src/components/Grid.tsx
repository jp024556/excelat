import React from "react";
import { CellValue, CellCoord, CellRange, ExcelatData, ExcelatColumn, SelectionStyle, ExcelatMode, SortRule, Filter } from "../model/types";
import { ColumnHeader } from "./ColumnHeader";
import { RowHeader } from "./RowHeader";
import { Cell } from "./Cell";
import { GroupRow } from "./GroupRow";
import { EditMovement } from "../hooks/useEditing";
import { getCellValue, isCellInRange } from "../model/dataModel";
import { VirtualizationState } from "../hooks/useVirtualization";
import { GridDisplayRow } from "../model/grouping";

export interface GridProps {
  totalRows: number;
  totalCols: number;
  data: ExcelatData;
  displayRows?: GridDisplayRow[];
  onToggleGroup?: (groupKey: string) => void;
  columns?: ExcelatColumn[];
  mode?: ExcelatMode;
  showRowNumbers?: boolean;
  showColumnLetters?: boolean;
  selectionStyle?: SelectionStyle;
  columnWidths?: Record<number, number>;
  rowHeights?: Record<number, number>;
  defaultColWidth?: number;
  defaultRowHeight?: number;
  selectionRange: CellRange;
  activeCell: CellCoord;
  isEditing: boolean;
  editCoord: CellCoord;
  editValue: CellValue;
  fillTargetRange?: CellRange | null;
  moveTargetRange?: CellRange | null;
  virtualization?: VirtualizationState;
  rowOffset?: number;
  onMouseDownCell: (e: React.MouseEvent, row: number, col: number) => void;
  onMouseEnterCell: (row: number, col: number) => void;
  onDoubleClickCell: (row: number, col: number) => void;
  onContextMenuCell?: (e: React.MouseEvent, row: number, col: number) => void;
  onFillHandleMouseDown?: (e: React.MouseEvent) => void;
  onRangeBorderMouseDown?: (e: React.MouseEvent) => void;
  onEditValueChange: (val: CellValue) => void;
  onCommitEdit: (movement?: EditMovement, directValue?: CellValue) => void;
  onCancelEdit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onSelectRow: (rowIndex: number) => void;
  onSelectColumn: (colIndex: number) => void;
  onSelectAll: () => void;
  onStartResizeCol?: (e: React.MouseEvent, colIndex: number) => void;
  onAutoFitCol?: (colIndex: number) => void;
  onStartResizeRow?: (e: React.MouseEvent, rowIndex: number) => void;
  gridRef?: React.Ref<HTMLDivElement>;
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

export const Grid: React.FC<GridProps> = ({
  totalRows,
  totalCols,
  data,
  displayRows,
  onToggleGroup,
  columns,
  mode = "spreadsheet",
  showRowNumbers = true,
  showColumnLetters = true,
  selectionStyle = "excel",
  columnWidths = {},
  rowHeights = {},
  defaultColWidth = 100,
  defaultRowHeight = 25,
  selectionRange,
  activeCell,
  isEditing,
  editCoord,
  editValue,
  fillTargetRange,
  moveTargetRange,
  virtualization,
  rowOffset = 0,
  onMouseDownCell,
  onMouseEnterCell,
  onDoubleClickCell,
  onContextMenuCell,
  onFillHandleMouseDown,
  onRangeBorderMouseDown,
  onEditValueChange,
  onCommitEdit,
  onCancelEdit,
  onKeyDown,
  onSelectRow,
  onSelectColumn,
  onSelectAll,
  onStartResizeCol,
  onAutoFitCol,
  onStartResizeRow,
  gridRef,
  sortingEnabled,
  sortRules,
  onSort,
  filteringEnabled,
  filters,
  onApplyFilter,
  onClearFilter,
  columnReorder = true,
  onReorderColumn,
}) => {
  const isVirtual = virtualization?.isVirtual;
  const rowStart = isVirtual ? virtualization.visibleStartRow : 0;
  const rowEnd = isVirtual ? virtualization.visibleEndRow : totalRows - 1;
  const rowCountToRender = Math.max(0, rowEnd - rowStart + 1);

  const rowIndices = Array.from(
    { length: rowCountToRender },
    (_, i) => rowStart + i
  );

  const isVirtualCols = isVirtual && virtualization.isVirtualCols;
  const colStart = isVirtualCols ? virtualization.visibleStartCol : 0;
  const colEnd = isVirtualCols ? virtualization.visibleEndCol : totalCols - 1;
  const colIndices = isVirtualCols
    ? Array.from(
        { length: Math.max(0, colEnd - colStart + 1) },
        (_, i) => colStart + i
      )
    : Array.from({ length: totalCols }, (_, i) => i);

  const shouldRenderThead =
    showColumnLetters ||
    (columns !== undefined &&
      columns.some((c) => c?.header !== undefined || c?.label !== undefined));

  const totalColsSpan =
    colIndices.length +
    (showRowNumbers ? 1 : 0) +
    (virtualization?.leftSpacerWidth ? 1 : 0) +
    (virtualization?.rightSpacerWidth ? 1 : 0);

  return (
    <div
      ref={gridRef}
      className={`excelat-grid-viewport excelat-mode-${mode}`}
      tabIndex={0}
      role="grid"
      aria-rowcount={totalRows}
      aria-colcount={totalCols}
      onKeyDown={onKeyDown}
    >
      <table className="excelat-table">
        {shouldRenderThead && (
          <thead className="excelat-thead">
            <ColumnHeader
              totalCols={totalCols}
              columns={columns}
              showColumnLetters={showColumnLetters}
              showRowNumbers={showRowNumbers}
              columnWidths={columnWidths}
              defaultColWidth={defaultColWidth}
              visibleColIndices={isVirtualCols ? colIndices : undefined}
              leftSpacerWidth={virtualization?.leftSpacerWidth}
              rightSpacerWidth={virtualization?.rightSpacerWidth}
              isColumnSelected={(c) =>
                c >= selectionRange.startColumn && c <= selectionRange.endColumn
              }
              onSelectColumn={onSelectColumn}
              onSelectAll={onSelectAll}
              onStartResizeCol={onStartResizeCol}
              onAutoFitCol={onAutoFitCol}
              sortingEnabled={sortingEnabled}
              sortRules={sortRules}
              onSort={onSort}
              filteringEnabled={filteringEnabled}
              filters={filters}
              onApplyFilter={onApplyFilter}
              onClearFilter={onClearFilter}
              columnReorder={columnReorder}
              onReorderColumn={onReorderColumn}
            />
          </thead>
        )}
        <tbody className="excelat-tbody">
          {isVirtual && virtualization.topSpacerHeight > 0 && (
            <tr
              className="excelat-row-spacer"
              style={{ height: `${virtualization.topSpacerHeight}px` }}
              aria-hidden="true"
            >
              <td
                colSpan={totalColsSpan}
                style={{
                  height: `${virtualization.topSpacerHeight}px`,
                  padding: 0,
                  border: 0,
                }}
              />
            </tr>
          )}

          {rowIndices.map((row) => {
            const isRowSelected =
              row >= selectionRange.startRow && row <= selectionRange.endRow;
            const rowHeight = rowHeights[row] ?? defaultRowHeight;

            const displayItem = displayRows?.[row];

            // Render group header row if item is group
            if (displayItem && displayItem.type === "group") {
              return (
                <GroupRow
                  key={`group-${displayItem.groupKey}-${row}`}
                  item={displayItem}
                  rowIndex={row}
                  totalColsSpan={totalColsSpan}
                  isSelected={isRowSelected}
                  onToggle={onToggleGroup || (() => {})}
                />
              );
            }

            // Normal data row
            const dataRowIdx =
              displayItem && displayItem.type === "data"
                ? displayItem.dataRowIndex
                : row;

            return (
              <tr
                key={row}
                className="excelat-row"
                style={rowHeight ? { height: `${rowHeight}px` } : undefined}
                role="row"
              >
                {showRowNumbers && (
                  <RowHeader
                    rowIndex={(dataRowIdx >= 0 ? dataRowIdx : row) + rowOffset}
                    height={rowHeight}
                    isSelected={isRowSelected}
                    onSelectRow={() => onSelectRow(row)}
                    onStartResizeRow={(e) => onStartResizeRow?.(e, row)}
                  />
                )}
                {isVirtualCols && virtualization.leftSpacerWidth > 0 && (
                  <td
                    style={{
                      width: `${virtualization.leftSpacerWidth}px`,
                      minWidth: `${virtualization.leftSpacerWidth}px`,
                      maxWidth: `${virtualization.leftSpacerWidth}px`,
                      padding: 0,
                      border: 0,
                    }}
                    aria-hidden="true"
                  />
                )}
                {colIndices.map((col) => {
                  const val = getCellValue(data, dataRowIdx, col);
                  const isSelected =
                    row >= selectionRange.startRow &&
                    row <= selectionRange.endRow &&
                    col >= selectionRange.startColumn &&
                    col <= selectionRange.endColumn;
                  const isActive =
                    row === activeCell.row && col === activeCell.col;
                  const isCellEditing =
                    isEditing &&
                    row === editCoord.row &&
                    col === editCoord.col;

                  const colWidth =
                    columnWidths[col] ?? columns?.[col]?.width ?? defaultColWidth;

                  // Selection boundary edge classes
                  const isTopEdge = isSelected && row === selectionRange.startRow;
                  const isBottomEdge = isSelected && row === selectionRange.endRow;
                  const isLeftEdge = isSelected && col === selectionRange.startColumn;
                  const isRightEdge = isSelected && col === selectionRange.endColumn;

                  // Fill target & move target
                  const isFillTarget =
                    !!fillTargetRange &&
                    isCellInRange(row, col, fillTargetRange) &&
                    !isSelected;
                  const isMoveTarget =
                    !!moveTargetRange && isCellInRange(row, col, moveTargetRange);

                  return (
                    <Cell
                      key={col}
                      row={row}
                      col={col}
                      value={val}
                      isActive={isActive}
                      isSelected={isSelected}
                      isEditing={isCellEditing}
                      selectionStyle={selectionStyle}
                      width={colWidth}
                      height={rowHeight}
                      editValue={editValue}
                      isTopEdge={isTopEdge}
                      isBottomEdge={isBottomEdge}
                      isLeftEdge={isLeftEdge}
                      isRightEdge={isRightEdge}
                      isFillTarget={isFillTarget}
                      isMoveTarget={isMoveTarget}
                      column={columns?.[col]}
                      rowData={data[dataRowIdx]}
                      render={columns?.[col]?.render}
                      editor={columns?.[col]?.editor}
                      onMouseDown={onMouseDownCell}
                      onMouseEnter={onMouseEnterCell}
                      onDoubleClick={onDoubleClickCell}
                      onContextMenu={onContextMenuCell}
                      onFillHandleMouseDown={onFillHandleMouseDown}
                      onRangeBorderMouseDown={onRangeBorderMouseDown}
                      onEditValueChange={onEditValueChange}
                      onCommitEdit={onCommitEdit}
                      onCancelEdit={onCancelEdit}
                    />
                  );
                })}
                {isVirtualCols && virtualization.rightSpacerWidth > 0 && (
                  <td
                    style={{
                      width: `${virtualization.rightSpacerWidth}px`,
                      minWidth: `${virtualization.rightSpacerWidth}px`,
                      maxWidth: `${virtualization.rightSpacerWidth}px`,
                      padding: 0,
                      border: 0,
                    }}
                    aria-hidden="true"
                  />
                )}
              </tr>
            );
          })}

          {isVirtual && virtualization.bottomSpacerHeight > 0 && (
            <tr
              className="excelat-row-spacer"
              style={{ height: `${virtualization.bottomSpacerHeight}px` }}
              aria-hidden="true"
            >
              <td
                colSpan={totalColsSpan}
                style={{
                  height: `${virtualization.bottomSpacerHeight}px`,
                  padding: 0,
                  border: 0,
                }}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
