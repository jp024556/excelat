import React from "react";
import { CellCoord, CellRange, ExcelatData, ExcelatColumn, SelectionStyle, ExcelatMode } from "../model/types";
import { ColumnHeader } from "./ColumnHeader";
import { RowHeader } from "./RowHeader";
import { Cell } from "./Cell";
import { EditMovement } from "../hooks/useEditing";
import { getCellValue } from "../model/dataModel";

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
  onMouseDownCell: (e: React.MouseEvent, row: number, col: number) => void;
  onMouseEnterCell: (row: number, col: number) => void;
  onDoubleClickCell: (row: number, col: number) => void;
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
  onMouseDownCell,
  onMouseEnterCell,
  onDoubleClickCell,
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
  const rowIndices = Array.from({ length: totalRows }, (_, i) => i);
  const colIndices = Array.from({ length: totalCols }, (_, i) => i);

  const shouldRenderThead =
    showColumnLetters ||
    (columns !== undefined && columns.some((c) => c?.header !== undefined));

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
                    rowIndex={row}
                    height={rowHeight}
                    isSelected={isRowSelected}
                    onSelectRow={onSelectRow}
                    onStartResizeRow={onStartResizeRow}
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
                      onMouseDown={onMouseDownCell}
                      onMouseEnter={onMouseEnterCell}
                      onDoubleClick={onDoubleClickCell}
                      onEditValueChange={onEditValueChange}
                      onCommitEdit={onCommitEdit}
                      onCancelEdit={onCancelEdit}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
