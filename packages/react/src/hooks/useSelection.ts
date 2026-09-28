import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { CellCoord, CellRange } from "../model/types";
import { normalizeRange } from "../model/dataModel";

export function useSelection(
  totalRows: number,
  totalCols: number,
  onSelectionChange?: (range: CellRange) => void
) {
  const [anchor, setAnchor] = useState<CellCoord>({ row: 0, col: 0 });
  const [focus, setFocus] = useState<CellCoord>({ row: 0, col: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const range: CellRange = useMemo(() => {
    return normalizeRange({
      startRow: anchor.row,
      startColumn: anchor.col,
      endRow: focus.row,
      endColumn: focus.col,
    });
  }, [anchor, focus]);

  // Keep a ref of onSelectionChange to avoid stale closures
  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  // Trigger onSelectionChange when range changes
  const prevRangeRef = useRef<CellRange>(range);
  useEffect(() => {
    const prev = prevRangeRef.current;
    if (
      prev.startRow !== range.startRow ||
      prev.endRow !== range.endRow ||
      prev.startColumn !== range.startColumn ||
      prev.endColumn !== range.endColumn
    ) {
      prevRangeRef.current = range;
      onSelectionChangeRef.current?.(range);
    }
  }, [range]);

  const clampRow = useCallback(
    (row: number) => Math.max(0, Math.min(row, totalRows - 1)),
    [totalRows]
  );
  const clampCol = useCallback(
    (col: number) => Math.max(0, Math.min(col, totalCols - 1)),
    [totalCols]
  );

  const selectCell = useCallback(
    (row: number, col: number) => {
      const clamped = { row: clampRow(row), col: clampCol(col) };
      setAnchor(clamped);
      setFocus(clamped);
    },
    [clampRow, clampCol]
  );

  const extendSelection = useCallback(
    (row: number, col: number) => {
      setFocus({ row: clampRow(row), col: clampCol(col) });
    },
    [clampRow, clampCol]
  );

  const setRange = useCallback(
    (startRow: number, startColumn: number, endRow: number, endColumn: number) => {
      setAnchor({ row: clampRow(startRow), col: clampCol(startColumn) });
      setFocus({ row: clampRow(endRow), col: clampCol(endColumn) });
    },
    [clampRow, clampCol]
  );

  const startDrag = useCallback(
    (row: number, col: number) => {
      const clamped = { row: clampRow(row), col: clampCol(col) };
      setAnchor(clamped);
      setFocus(clamped);
      setIsDragging(true);
    },
    [clampRow, clampCol]
  );

  const dragTo = useCallback(
    (row: number, col: number) => {
      if (!isDragging) return;
      setFocus({ row: clampRow(row), col: clampCol(col) });
    },
    [isDragging, clampRow, clampCol]
  );

  const stopDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouseup listener to cancel drag even if mouse leaves grid
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging]);

  const isCellSelected = useCallback(
    (row: number, col: number) => {
      return (
        row >= range.startRow &&
        row <= range.endRow &&
        col >= range.startColumn &&
        col <= range.endColumn
      );
    },
    [range]
  );

  const isActiveCell = useCallback(
    (row: number, col: number) => {
      return anchor.row === row && anchor.col === col;
    },
    [anchor]
  );

  const isRowSelected = useCallback(
    (row: number) => {
      return row >= range.startRow && row <= range.endRow;
    },
    [range]
  );

  const isColumnSelected = useCallback(
    (col: number) => {
      return col >= range.startColumn && col <= range.endColumn;
    },
    [range]
  );

  return {
    anchor,
    focus,
    range,
    isDragging,
    selectCell,
    extendSelection,
    setRange,
    startDrag,
    dragTo,
    stopDrag,
    isCellSelected,
    isActiveCell,
    isRowSelected,
    isColumnSelected,
  };
}
