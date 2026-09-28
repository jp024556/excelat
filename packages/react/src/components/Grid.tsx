import React from "react";
import { CellCoord, CellRange, ExcelatData } from "../model/types";
import { ColumnHeader } from "./ColumnHeader";
import { RowHeader } from "./RowHeader";
import { Cell } from "./Cell";
import { EditMovement } from "../hooks/useEditing";
import { getCellValue } from "../model/dataModel";

export interface GridProps {
  totalRows: number;
  totalCols: number;
  data: ExcelatData;
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
  gridRef?: React.Ref<HTMLDivElement>;
}

export const Grid: React.FC<GridProps> = ({
  totalRows,
  totalCols,
  data,
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
  gridRef,
}) => {
  const rowIndices = Array.from({ length: totalRows }, (_, i) => i);
  const colIndices = Array.from({ length: totalCols }, (_, i) => i);

  return (
    <div
      ref={gridRef}
      className="excelat-grid-viewport"
      tabIndex={0}
      role="grid"
      aria-rowcount={totalRows}
      aria-colcount={totalCols}
      onKeyDown={onKeyDown}
    >
      <table className="excelat-table">
        <thead className="excelat-thead">
          <ColumnHeader
            totalCols={totalCols}
            isColumnSelected={(c) =>
              c >= selectionRange.startColumn && c <= selectionRange.endColumn
            }
            onSelectColumn={onSelectColumn}
            onSelectAll={onSelectAll}
          />
        </thead>
        <tbody className="excelat-tbody">
          {rowIndices.map((row) => {
            const isRowSelected =
              row >= selectionRange.startRow && row <= selectionRange.endRow;

            return (
              <tr key={row} className="excelat-row" role="row">
                <RowHeader
                  rowIndex={row}
                  isSelected={isRowSelected}
                  onSelectRow={onSelectRow}
                />
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
