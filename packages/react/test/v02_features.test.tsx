import React, { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { Excelat, ExcelatRef, ExcelatData, ExcelatOperation } from "../src";

describe("Excelat - Virtualization, Pagination & Operations", () => {
  // Generate a dataset of 500 rows
  const generateLargeData = (rowCount: number, colCount: number): ExcelatData => {
    return Array.from({ length: rowCount }, (_, r) =>
      Array.from({ length: colCount }, (_, c) => `R${r}C${c}`)
    );
  };

  describe("Virtualization", () => {
    it("virtualizes large datasets and renders only a window of rows with spacers", () => {
      const data = generateLargeData(500, 5);
      const { container } = render(
        <div style={{ height: "400px", width: "600px" }}>
          <Excelat data={data} virtualization={true} />
        </div>
      );

      const rows = container.querySelectorAll(".excelat-tbody tr.excelat-row");
      // All 500 rows should NOT be in the DOM
      expect(rows.length).toBeLessThan(100);
      expect(rows.length).toBeGreaterThan(0);

      // Spacer row should be present
      const spacer = container.querySelector(".excelat-row-spacer");
      expect(spacer).not.toBeNull();
    });

    it("supports cell selection and navigation in virtualized mode", () => {
      const data = generateLargeData(500, 5);
      const { container } = render(
        <div style={{ height: "400px", width: "600px" }}>
          <Excelat data={data} virtualization={true} />
        </div>
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      expect(cell00.classList.contains("excelat-cell-active")).toBe(true);

      const viewport = container.querySelector(".excelat-grid-viewport")!;
      fireEvent.keyDown(viewport, { key: "ArrowDown" });

      const cell10 = container.querySelector('td[data-row="1"][data-col="0"]')!;
      expect(cell10.classList.contains("excelat-cell-active")).toBe(true);
    });
  });

  describe("Controlled Server-Side Pagination", () => {
    it("renders pagination controls and info correctly", () => {
      const rows: ExcelatData = [
        ["A", "B"],
        ["C", "D"],
      ];
      const handlePageChange = vi.fn();

      const { container } = render(
        <Excelat
          data={rows}
          pagination={{
            page: 1,
            pageSize: 25,
            total: 100,
          }}
          onPageChange={handlePageChange}
        />
      );

      const bar = container.querySelector(".excelat-pagination-bar");
      expect(bar).not.toBeNull();
      expect(bar?.textContent).toContain("Showing 1–25 of 100");
      expect(bar?.textContent).toContain("Page 1 of 4");

      // First & Prev buttons should be disabled on page 1
      const prevBtn = container.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement;
      expect(prevBtn.disabled).toBe(true);

      // Next button should be enabled
      const nextBtn = container.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
      expect(nextBtn.disabled).toBe(false);

      fireEvent.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(2);

      // Last button should invoke last page (4)
      const lastBtn = container.querySelector('button[aria-label="Last page"]') as HTMLButtonElement;
      fireEvent.click(lastBtn);
      expect(handlePageChange).toHaveBeenCalledWith(4);
    });

    it("displays row numbers with row offset on subsequent pages", () => {
      const rows: ExcelatData = [
        ["Row 26", "Data"],
        ["Row 27", "Data"],
      ];

      const { container } = render(
        <Excelat
          data={rows}
          pagination={{
            page: 2,
            pageSize: 25,
            total: 100,
          }}
        />
      );

      const rowHeaders = container.querySelectorAll(".excelat-row-header-text");
      expect(rowHeaders[0]?.textContent).toBe("26");
      expect(rowHeaders[1]?.textContent).toBe("27");
    });
  });

  describe("Infinite / Incremental Loading", () => {
    it("invokes onLoadMore when scrolled near bottom and avoids duplicate calls during loading", () => {
      const data = generateLargeData(50, 5);
      const handleLoadMore = vi.fn();

      const { container, rerender } = render(
        <div style={{ height: "300px", width: "500px" }}>
          <Excelat
            data={data}
            virtualization={true}
            hasMore={true}
            loading={false}
            onLoadMore={handleLoadMore}
          />
        </div>
      );

      const viewport = container.querySelector(".excelat-grid-viewport") as HTMLElement;

      // Mock scroll dimensions
      Object.defineProperty(viewport, "scrollTop", { value: 900, writable: true });
      Object.defineProperty(viewport, "clientHeight", { value: 300, writable: true });
      Object.defineProperty(viewport, "scrollHeight", { value: 1250, writable: true });

      // Trigger scroll near threshold
      fireEvent.scroll(viewport);

      expect(handleLoadMore).toHaveBeenCalledTimes(1);

      // When loading is true, scroll should NOT invoke onLoadMore again
      rerender(
        <div style={{ height: "300px", width: "500px" }}>
          <Excelat
            data={data}
            virtualization={true}
            hasMore={true}
            loading={true}
            onLoadMore={handleLoadMore}
          />
        </div>
      );

      fireEvent.scroll(viewport);
      expect(handleLoadMore).toHaveBeenCalledTimes(1); // Still 1!
    });
  });

  describe("Granular Operations & Mutations (onOperation)", () => {
    it("dispatches cell.update operation when editing a cell", () => {
      const data: ExcelatData = [
        ["Initial", 10],
        ["Second", 20],
      ];
      const handleOperation = vi.fn();

      const { container } = render(
        <Excelat data={data} onOperation={handleOperation} />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.doubleClick(cell00);

      const editor = container.querySelector(".excelat-cell-editor") as HTMLInputElement;
      expect(editor).not.toBeNull();

      fireEvent.change(editor, { target: { value: "UpdatedValue" } });
      fireEvent.keyDown(editor, { key: "Enter" });

      expect(handleOperation).toHaveBeenCalledTimes(1);
      const op: ExcelatOperation = handleOperation.mock.calls[0][0];
      expect(op).toMatchObject({
        type: "cell.update",
        row: 0,
        column: 0,
        value: "UpdatedValue",
      });
    });

    it("dispatches range.clear operation when pressing Delete on a selection", () => {
      const data: ExcelatData = [
        ["A", "B"],
        ["C", "D"],
      ];
      const handleOperation = vi.fn();

      const { container } = render(
        <Excelat data={data} onOperation={handleOperation} />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      const cell01 = container.querySelector('td[data-row="0"][data-col="1"]')!;
      fireEvent.mouseEnter(cell01);

      const viewport = container.querySelector(".excelat-grid-viewport")!;
      fireEvent.keyDown(viewport, { key: "Delete" });

      expect(handleOperation).toHaveBeenCalledTimes(1);
      const op: ExcelatOperation = handleOperation.mock.calls[0][0];
      expect(op.type).toBe("range.clear");
      if (op.type === "range.clear") {
        expect(op.range).toEqual({
          startRow: 0,
          startColumn: 0,
          endRow: 0,
          endColumn: 1,
        });
      }
    });

    it("dispatches formula bar edits through the exact same onOperation pipeline", () => {
      const data: ExcelatData = [["Hello", "World"]];
      const handleOperation = vi.fn();

      const { container } = render(
        <Excelat
          data={data}
          showFormulaBar={true}
          onOperation={handleOperation}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      const formulaInput = container.querySelector(".excelat-formula-input") as HTMLInputElement;
      fireEvent.change(formulaInput, { target: { value: "Hello Excelat" } });
      fireEvent.keyDown(formulaInput, { key: "Enter" });

      expect(handleOperation).toHaveBeenCalledTimes(1);
      const op: ExcelatOperation = handleOperation.mock.calls[0][0];
      expect(op).toMatchObject({
        type: "cell.update",
        row: 0,
        column: 0,
        value: "Hello Excelat",
      });
    });

    it("dispatches row.insert and row.delete operations via imperative ref", () => {
      const data: ExcelatData = [
        ["Row 0", "A"],
        ["Row 1", "B"],
      ];
      const handleOperation = vi.fn();
      const ref = createRef<ExcelatRef>();

      render(<Excelat ref={ref} data={data} onOperation={handleOperation} />);

      act(() => {
        ref.current?.insertRow(1, ["Inserted", "Row"]);
      });

      expect(handleOperation).toHaveBeenCalledWith({
        type: "row.insert",
        index: 1,
        values: ["Inserted", "Row"],
      });

      act(() => {
        ref.current?.deleteRow(0);
      });

      expect(handleOperation).toHaveBeenCalledWith({
        type: "row.delete",
        index: 0,
      });
    });

    it("dispatches column.insert and column.delete operations via imperative ref", () => {
      const data: ExcelatData = [
        ["A", "B"],
        ["C", "D"],
      ];
      const handleOperation = vi.fn();
      const ref = createRef<ExcelatRef>();

      render(<Excelat ref={ref} data={data} onOperation={handleOperation} />);

      act(() => {
        ref.current?.insertColumn(1);
      });

      expect(handleOperation).toHaveBeenCalledWith({
        type: "column.insert",
        index: 1,
      });

      act(() => {
        ref.current?.deleteColumn(0);
      });

      expect(handleOperation).toHaveBeenCalledWith({
        type: "column.delete",
        index: 0,
      });
    });

    it("dispatches range.fill operation when dragging fill handle", () => {
      const data: ExcelatData = [
        [10, "A"],
        [null, "B"],
        [null, "C"],
      ];
      const handleOperation = vi.fn();

      const { container } = render(
        <Excelat data={data} onOperation={handleOperation} />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      const fillHandle = container.querySelector(".excelat-cell-handle")!;
      expect(fillHandle).not.toBeNull();

      fireEvent.mouseDown(fillHandle, { button: 0 });

      // Drag down to cell (2, 0)
      const cell20 = container.querySelector('td[data-row="2"][data-col="0"]')!;
      fireEvent.mouseEnter(cell20);

      // Mouse up to complete fill
      const containerDiv = container.querySelector(".excelat-container")!;
      fireEvent.mouseUp(containerDiv);

      expect(handleOperation).toHaveBeenCalledTimes(1);
      const op: ExcelatOperation = handleOperation.mock.calls[0][0];
      expect(op.type).toBe("range.fill");
      if (op.type === "range.fill") {
        expect(op.source).toEqual({
          startRow: 0,
          startColumn: 0,
          endRow: 0,
          endColumn: 0,
        });
        expect(op.destination).toEqual({
          startRow: 0,
          startColumn: 0,
          endRow: 2,
          endColumn: 0,
        });
      }
    });
  });
});
