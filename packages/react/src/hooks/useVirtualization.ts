import { useState, useEffect, useRef } from "react";
import { ExcelatColumn, VirtualizationConfig } from "../model/types";

export interface UseVirtualizationOptions {
  enabled: boolean | VirtualizationConfig | undefined;
  totalRows: number;
  totalCols: number;
  rowHeights: Record<number, number>;
  defaultRowHeight: number;
  columnWidths: Record<number, number>;
  defaultColWidth: number;
  columns?: ExcelatColumn[];
  viewportRef: React.RefObject<HTMLDivElement>;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
}

export interface VirtualizationState {
  isVirtual: boolean;
  visibleStartRow: number;
  visibleEndRow: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
  visibleStartCol: number;
  visibleEndCol: number;
  leftSpacerWidth: number;
  rightSpacerWidth: number;
  isVirtualCols: boolean;
}

export function useVirtualization({
  enabled,
  totalRows,
  totalCols,
  rowHeights,
  defaultRowHeight,
  columnWidths,
  defaultColWidth,
  columns,
  viewportRef,
  hasMore,
  loading,
  onLoadMore,
}: UseVirtualizationOptions): VirtualizationState {
  const isVirtual = Boolean(enabled);
  const rowOverscan =
    typeof enabled === "object" && enabled?.rowOverscan !== undefined
      ? enabled.rowOverscan
      : 8;
  const colOverscan =
    typeof enabled === "object" && enabled?.colOverscan !== undefined
      ? enabled.colOverscan
      : 4;

  const [scrollMetrics, setScrollMetrics] = useState({
    scrollTop: 0,
    scrollLeft: 0,
    clientHeight: 600,
    clientWidth: 1000,
  });

  const animFrameRef = useRef<number | null>(null);
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  // Handle scroll listener
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Initial measurement
    setScrollMetrics({
      scrollTop: viewport.scrollTop,
      scrollLeft: viewport.scrollLeft,
      clientHeight: viewport.clientHeight || 600,
      clientWidth: viewport.clientWidth || 1000,
    });

    const handleScroll = () => {
      const vp = viewportRef.current;
      if (!vp) return;

      // Check if near bottom for infinite loading
      if (hasMoreRef.current && !loadingRef.current && onLoadMoreRef.current) {
        const scrollBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
        if (scrollBottom < 250) {
          onLoadMoreRef.current();
        }
      }

      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }

      animFrameRef.current = requestAnimationFrame(() => {
        const currentVp = viewportRef.current;
        if (!currentVp) return;

        setScrollMetrics({
          scrollTop: currentVp.scrollTop,
          scrollLeft: currentVp.scrollLeft,
          clientHeight: currentVp.clientHeight,
          clientWidth: currentVp.clientWidth,
        });
      });
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [viewportRef, totalRows]);

  if (!isVirtual) {
    return {
      isVirtual: false,
      visibleStartRow: 0,
      visibleEndRow: totalRows - 1,
      topSpacerHeight: 0,
      bottomSpacerHeight: 0,
      visibleStartCol: 0,
      visibleEndCol: totalCols - 1,
      leftSpacerWidth: 0,
      rightSpacerWidth: 0,
      isVirtualCols: false,
    };
  }

  // Row virtualization calculation
  const { scrollTop, scrollLeft, clientHeight, clientWidth } = scrollMetrics;
  const effectiveClientHeight = Math.max(100, Math.min(clientHeight || 600, 2400));
  const maxRowsToRender = 120; // Hard ceiling to guarantee high-performance 60fps rendering

  const hasCustomRowHeights = Object.keys(rowHeights).length > 0;
  let visibleStartRow = 0;
  let visibleEndRow = 0;
  let topSpacerHeight = 0;
  let bottomSpacerHeight = 0;

  if (!hasCustomRowHeights) {
    // Fast O(1) uniform height calculation
    const rawStart = Math.max(0, Math.floor(scrollTop / defaultRowHeight));
    const rawEnd = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + effectiveClientHeight) / defaultRowHeight)
    );

    visibleStartRow = Math.max(0, rawStart - rowOverscan);
    visibleEndRow = Math.min(
      totalRows - 1,
      Math.min(rawEnd + rowOverscan, visibleStartRow + maxRowsToRender)
    );

    topSpacerHeight = visibleStartRow * defaultRowHeight;
    bottomSpacerHeight = Math.max(0, (totalRows - 1 - visibleEndRow) * defaultRowHeight);
  } else {
    // Linear scan when custom row heights are present
    let currentTop = 0;
    let startRow = 0;
    let endRow = totalRows - 1;

    for (let r = 0; r < totalRows; r++) {
      const h = rowHeights[r] ?? defaultRowHeight;
      const rowBottom = currentTop + h;
      if (rowBottom >= scrollTop && startRow === 0) {
        startRow = r;
      }
      if (currentTop <= scrollTop + effectiveClientHeight) {
        endRow = r;
      }
      currentTop += h;
    }

    visibleStartRow = Math.max(0, startRow - rowOverscan);
    visibleEndRow = Math.min(
      totalRows - 1,
      Math.min(endRow + rowOverscan, visibleStartRow + maxRowsToRender)
    );

    for (let r = 0; r < visibleStartRow; r++) {
      topSpacerHeight += rowHeights[r] ?? defaultRowHeight;
    }
    for (let r = visibleEndRow + 1; r < totalRows; r++) {
      bottomSpacerHeight += rowHeights[r] ?? defaultRowHeight;
    }
  }

  // Column virtualization: enabled if totalCols > 25
  const isVirtualCols = totalCols > 25;
  let visibleStartCol = 0;
  let visibleEndCol = totalCols - 1;
  let leftSpacerWidth = 0;
  let rightSpacerWidth = 0;

  if (isVirtualCols) {
    const effectiveClientWidth = Math.max(100, Math.min(clientWidth || 1000, 3840));
    const hasCustomColWidths =
      Object.keys(columnWidths).length > 0 ||
      (columns && columns.some((c) => c.width !== undefined));

    if (!hasCustomColWidths) {
      const rawStart = Math.max(0, Math.floor(scrollLeft / defaultColWidth));
      const rawEnd = Math.min(
        totalCols - 1,
        Math.ceil((scrollLeft + effectiveClientWidth) / defaultColWidth)
      );

      visibleStartCol = Math.max(0, rawStart - colOverscan);
      visibleEndCol = Math.min(totalCols - 1, rawEnd + colOverscan);
      leftSpacerWidth = visibleStartCol * defaultColWidth;
      rightSpacerWidth = Math.max(0, (totalCols - 1 - visibleEndCol) * defaultColWidth);
    } else {
      let currentLeft = 0;
      let startCol = 0;
      let endCol = totalCols - 1;

      for (let c = 0; c < totalCols; c++) {
        const w = columnWidths[c] ?? columns?.[c]?.width ?? defaultColWidth;
        const colRight = currentLeft + w;
        if (colRight >= scrollLeft && startCol === 0) {
          startCol = c;
        }
        if (currentLeft <= scrollLeft + effectiveClientWidth) {
          endCol = c;
        }
        currentLeft += w;
      }

      visibleStartCol = Math.max(0, startCol - colOverscan);
      visibleEndCol = Math.min(totalCols - 1, endCol + colOverscan);

      for (let c = 0; c < visibleStartCol; c++) {
        leftSpacerWidth += columnWidths[c] ?? columns?.[c]?.width ?? defaultColWidth;
      }

      for (let c = visibleEndCol + 1; c < totalCols; c++) {
        rightSpacerWidth += columnWidths[c] ?? columns?.[c]?.width ?? defaultColWidth;
      }
    }
  }

  return {
    isVirtual: true,
    visibleStartRow,
    visibleEndRow,
    topSpacerHeight,
    bottomSpacerHeight,
    visibleStartCol,
    visibleEndCol,
    leftSpacerWidth,
    rightSpacerWidth,
    isVirtualCols,
  };
}
