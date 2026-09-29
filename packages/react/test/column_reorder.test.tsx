import React, { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act, waitFor } from "@testing-library/react";
import { Excelat } from "../src/Excelat";
import { ExcelatRef, ExcelatColumn } from "../src/model/types";
import { computeReorderTarget, reorderArray } from "../src/model/operations";

describe("Excelat - Column Drag & Drop Reordering", () => {
  it("helper functions: reorderArray and computeReorderTarget work correctly", () => {
    // reorderArray
    expect(reorderArray(["A", "B", "C", "D"], 0, 2)).toEqual(["B", "C", "A", "D"]);
    expect(reorderArray(["A", "B", "C", "D"], 3, 1)).toEqual(["A", "D", "B", "C"]);
    expect(reorderArray(["A", "B"], 0, 0)).toEqual(["A", "B"]);

    // computeReorderTarget: dragging forward (fromIdx < toIdx)
    // Dragging col 0 over col 2:
    // If dropping 'after' col 2 -> target index is 2
    expect(computeReorderTarget(0, 2, "after")).toBe(2);
    // If dropping 'before' col 2 -> target index is 1 (before col 2, after col 1)
    expect(computeReorderTarget(0, 2, "before")).toBe(1);

    // computeReorderTarget: dragging backward (fromIdx > toIdx)
    // Dragging col 3 over col 1:
    // If dropping 'before' col 1 -> target index is 1
    expect(computeReorderTarget(3, 1, "before")).toBe(1);
    // If dropping 'after' col 1 -> target index is 2 (after col 1, before col 2)
    expect(computeReorderTarget(3, 1, "after")).toBe(2);
  });

  it("reorders columns via imperative ref and updates headers and cell values", async () => {
    const ref = createRef<ExcelatRef>();
    const onColumnReorder = vi.fn();
    const onOperation = vi.fn();

    const columns: ExcelatColumn[] = [
      { key: "name", header: "Name" },
      { key: "age", header: "Age" },
      { key: "city", header: "City" },
    ];
    const data = [
      ["Alice", 25, "New York"],
      ["Bob", 30, "London"],
    ];

    const { container } = render(
      <Excelat
        ref={ref}
        mode="table"
        columns={columns}
        data={data}
        onColumnReorder={onColumnReorder}
        onOperation={onOperation}
      />
    );

    // Initial order: Name, Age, City
    const getHeaders = () =>
      Array.from(container.querySelectorAll(".excelat-col-header-text")).map(
        (el) => el.textContent
      );
    expect(getHeaders()).toEqual(["Name", "Age", "City"]);

    // Initial cells in Row 0
    const getRow0Cells = () => [
      container.querySelector('td[data-row="0"][data-col="0"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="1"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="2"]')?.textContent,
    ];
    expect(getRow0Cells()).toEqual(["Alice", "25", "New York"]);

    // Reorder: move column 0 (Name) to index 2 (after City)
    act(() => {
      ref.current?.reorderColumn(0, 2);
    });

    // Headers should now be: Age, City, Name
    expect(getHeaders()).toEqual(["Age", "City", "Name"]);

    // Row 0 cells should now be: 25, New York, Alice
    expect(getRow0Cells()).toEqual(["25", "New York", "Alice"]);

    // Callback assertions
    expect(onColumnReorder).toHaveBeenCalledWith(0, 2, [
      { key: "age", header: "Age" },
      { key: "city", header: "City" },
      { key: "name", header: "Name" },
    ]);
    expect(onOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "column.reorder",
        fromIndex: 0,
        toIndex: 2,
      })
    );
  });

  it("supports undo and redo for column reordering", async () => {
    const ref = createRef<ExcelatRef>();
    const columns: ExcelatColumn[] = [
      { key: "c1", header: "Col 1" },
      { key: "c2", header: "Col 2" },
      { key: "c3", header: "Col 3" },
    ];
    const data = [["A", "B", "C"]];

    const { container } = render(
      <Excelat ref={ref} mode="table" columns={columns} data={data} />
    );

    const getRow0Cells = () => [
      container.querySelector('td[data-row="0"][data-col="0"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="1"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="2"]')?.textContent,
    ];

    expect(getRow0Cells()).toEqual(["A", "B", "C"]);

    // Move Col 0 to 1
    act(() => {
      ref.current?.reorderColumn(0, 1);
    });
    expect(getRow0Cells()).toEqual(["B", "A", "C"]);

    // Undo (Ctrl+Z)
    const viewport = container.querySelector(".excelat-grid-viewport")!;
    act(() => {
      fireEvent.keyDown(viewport, { key: "z", ctrlKey: true });
    });
    expect(getRow0Cells()).toEqual(["A", "B", "C"]);

    // Redo (Ctrl+Y)
    act(() => {
      fireEvent.keyDown(viewport, { key: "y", ctrlKey: true });
    });
    expect(getRow0Cells()).toEqual(["B", "A", "C"]);
  });

  it("supports drag and drop HTML5 reordering", async () => {
    const onColumnReorder = vi.fn();
    const columns: ExcelatColumn[] = [
      { key: "col0", header: "First" },
      { key: "col1", header: "Second" },
      { key: "col2", header: "Third" },
    ];
    const data = [["1", "2", "3"]];

    const { container } = render(
      <Excelat
        mode="table"
        columns={columns}
        data={data}
        columnReorder={true}
        onColumnReorder={onColumnReorder}
      />
    );

    const getHeader = (col: number) =>
      container.querySelector(`th[data-col="${col}"]`) as HTMLTableCellElement;

    expect(getHeader(0).getAttribute("draggable")).toBe("true");

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue("0"),
      effectAllowed: "move",
      dropEffect: "move",
    };

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      if (this.getAttribute?.("data-col") === "2") {
        return {
          left: 200,
          right: 300,
          width: 100,
          top: 0,
          bottom: 30,
          height: 30,
          x: 200,
          y: 0,
          toJSON: () => {},
        } as DOMRect;
      }
      return {
        left: 0,
        right: 100,
        width: 100,
        top: 0,
        bottom: 30,
        height: 30,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect;
    });

    // 1. Drag start on header 0
    act(() => {
      fireEvent.dragStart(getHeader(0), { dataTransfer });
    });

    // 2. Drag over right half of header 2 (e.clientX = 280 > 250 midpoint -> position "after")
    act(() => {
      const dragOverEvent = new Event("dragover", { bubbles: true, cancelable: true });
      Object.assign(dragOverEvent, { clientX: 280, dataTransfer });
      getHeader(2).dispatchEvent(dragOverEvent);
    });
    expect(getHeader(2).classList.contains("excelat-col-drop-after")).toBe(true);

    // 3. Drop on header 2
    act(() => {
      const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
      Object.assign(dropEvent, { dataTransfer });
      getHeader(2).dispatchEvent(dropEvent);
    });

    // Header 0 moved after header 2 -> index 2
    expect(onColumnReorder).toHaveBeenCalledWith(0, 2, expect.any(Array));

    // Cells should be updated
    const getRow0Cells = () => [
      container.querySelector('td[data-row="0"][data-col="0"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="1"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="2"]')?.textContent,
    ];
    expect(getRow0Cells()).toEqual(["2", "3", "1"]);
  });

  it("respects columnReorder={false} to disable dragging", () => {
    const columns: ExcelatColumn[] = [
      { key: "col0", header: "First" },
      { key: "col1", header: "Second" },
    ];

    const { container } = render(
      <Excelat mode="table" columns={columns} columnReorder={false} />
    );

    const headerThs = container.querySelectorAll("th.excelat-col-header");
    expect(headerThs.length).toBe(2);
    expect(headerThs[0].getAttribute("draggable")).toBe("false");
    expect(headerThs[0].classList.contains("excelat-col-draggable")).toBe(false);
  });

  it("works seamlessly in mode='spreadsheet'", () => {
    const ref = createRef<ExcelatRef>();
    const data = [
      ["ValA", "ValB", "ValC"],
      ["10", "20", "30"],
    ];

    const { container } = render(
      <Excelat ref={ref} mode="spreadsheet" data={data} rows={3} columns={3} />
    );

    const getRow0Cells = () => [
      container.querySelector('td[data-row="0"][data-col="0"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="1"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="2"]')?.textContent,
    ];

    expect(getRow0Cells()).toEqual(["ValA", "ValB", "ValC"]);

    // Move col 2 to 0
    act(() => {
      ref.current?.reorderColumn(2, 0);
    });
    expect(getRow0Cells()).toEqual(["ValC", "ValA", "ValB"]);
  });
});
