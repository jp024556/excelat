import React from "react";
import { CellCoord, CellRange, ExcelatData, ExcelatColumn, SelectionStyle, ExcelatMode } from "../model/types";
import { ColumnHeader } from "./ColumnHeader";
import { RowHeader } from "./RowHeader";
import { Cell } from "./Cell";
import { EditMovement } from "../hooks/useEditing";
import { getCellValue, isCellInRange } from "../model/dataModel";
import { VirtualizationState } from "../hooks/useVirtualization";

export interface GridProps {
  totalRows: number;
  totalCols: number;
  data: ExcelatData;
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
  editValue: string;
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
  onEditValueChange: (val: string) => void;
  onCommitEdit: (movement?: EditMovement) => void;
  onCancelEdit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onSelectRow: (rowIndex: number) => void;
  onSelectColumn: (colIndex: number) => void;
  onSelectAll: () => void;
  onStartResizeCol?: (e: React.MouseEvent, colIndex: number) => void;
  onAutoFitCol?: (colIndex: number) => void;
  onStartResizeRow?: (e: React.MouseEvent, rowIndex: number) => void;
  gridRef?: React.Ref<HTMLDivElement>;
}

export const Grid: React.FC<GridProps> = ({
  totalRows,
  totalCols,
  data,
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
}) => {
  const isVirtual = virtualization?.isVirtual;
  const rowStart = isVirtual ? virtualization.visibleStartRow : 0;
  const rowEnd = isVirtual ? virtualization.visibleEndRow : totalRows - 1;
  const rowIndices = Array.from(
    { length: Math.max(0, rowEnd - rowStart + 1) },
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
    (columns !== undefined && columns.some((c) => c?.header !== undefined));

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

            return (
              <tr
                key={row}
                className="excelat-row"
                style={rowHeight ? { height: `${rowHeight}px` } : undefined}
                role="row"
              >
                {showRowNumbers && (
                  <RowHeader
                    rowIndex={row + rowOffset}
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
                  const val = getCellValue(data, row, col);
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
                      render={columns?.[col]?.render}
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
