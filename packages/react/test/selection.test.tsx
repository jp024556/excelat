import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Excelat } from "../src/Excelat";

describe("Excelat - Selection", () => {
  const testData = [
    ["Name", "Age", "City"],
    ["Jay", 30, "Bangalore"],
    ["Rahul", 28, "Delhi"],
  ];

  it("selects a cell when clicked", () => {
    const handleSelectionChange = vi.fn();
    const { container } = render(
      <Excelat
        data={testData}
        rows={10}
        columns={5}
        onSelectionChange={handleSelectionChange}
      />
    );

    // Select row 1, col 2 ("Bangalore")
    const cell = container.querySelector('td[data-row="1"][data-col="2"]');
    expect(cell).toBeTruthy();
    fireEvent.mouseDown(cell!, { button: 0 });

    expect(cell).toHaveClass("excelat-cell-active");
    expect(cell).toHaveClass("excelat-cell-selected");
    expect(handleSelectionChange).toHaveBeenCalledWith({
      startRow: 1,
      startColumn: 2,
      endRow: 1,
      endColumn: 2,
    });
  });

  it("supports mouse drag range selection", () => {
    const handleSelectionChange = vi.fn();
    const { container } = render(
      <Excelat
        data={testData}
        rows={10}
        columns={5}
        onSelectionChange={handleSelectionChange}
      />
    );

    const startCell = container.querySelector('td[data-row="0"][data-col="0"]');
    const targetCell = container.querySelector('td[data-row="2"][data-col="1"]');

    // Drag from (0, 0) to (2, 1)
    fireEvent.mouseDown(startCell!, { button: 0 });
    fireEvent.mouseEnter(targetCell!);
    fireEvent.mouseUp(window);

    expect(handleSelectionChange).toHaveBeenLastCalledWith({
      startRow: 0,
      startColumn: 0,
      endRow: 2,
      endColumn: 1,
    });

    // Check cells inside range have excelat-cell-selected class
    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]');
    const cell11 = container.querySelector('td[data-row="1"][data-col="1"]');
    const cell21 = container.querySelector('td[data-row="2"][data-col="1"]');
    expect(cell00).toHaveClass("excelat-cell-selected");
    expect(cell11).toHaveClass("excelat-cell-selected");
    expect(cell21).toHaveClass("excelat-cell-selected");
  });

  it("supports Shift + Arrow keyboard range selection", () => {
    const handleSelectionChange = vi.fn();
    const { container } = render(
      <Excelat
        data={testData}
        rows={10}
        columns={5}
        onSelectionChange={handleSelectionChange}
      />
    );

    const viewport = container.querySelector(".excelat-grid-viewport")!;

    // Initial click at (1, 1)
    const cell11 = container.querySelector('td[data-row="1"][data-col="1"]');
    fireEvent.mouseDown(cell11!, { button: 0 });

    // Press Shift + ArrowRight, then Shift + ArrowDown
    fireEvent.keyDown(viewport, { key: "ArrowRight", shiftKey: true });
    expect(handleSelectionChange).toHaveBeenLastCalledWith({
      startRow: 1,
      startColumn: 1,
      endRow: 1,
      endColumn: 2,
    });

    fireEvent.keyDown(viewport, { key: "ArrowDown", shiftKey: true });
    expect(handleSelectionChange).toHaveBeenLastCalledWith({
      startRow: 1,
      startColumn: 1,
      endRow: 2,
      endColumn: 2,
    });
  });
});
