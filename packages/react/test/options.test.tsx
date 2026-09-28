import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Excelat } from "../src/Excelat";

describe("Excelat - Options & Modes", () => {
  const sampleData = [
    ["Alice", 25, "Seattle"],
    ["Bob", 30, "Portland"],
  ];

  it("renders in table mode with custom column headers and no row numbers", () => {
    const { container } = render(
      <Excelat
        data={sampleData}
        mode="table"
        columns={[{ header: "Full Name" }, { header: "User Age" }, { header: "Location" }]}
      />
    );

    // Row headers (1, 2, 3...) should NOT be rendered by default in table mode
    const rowHeaders = container.querySelectorAll(".excelat-row-header");
    expect(rowHeaders.length).toBe(0);

    // Custom headers should be visible
    const ths = container.querySelectorAll(".excelat-col-header");
    expect(ths[0].textContent).toContain("Full Name");
    expect(ths[1].textContent).toContain("User Age");
    expect(ths[2].textContent).toContain("Location");

    // Underlying selection and keyboard navigation still work seamlessly
    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.mouseDown(cell00, { button: 0 });
    expect(cell00).toHaveAttribute("aria-selected", "true");

    const viewport = container.querySelector(".excelat-grid-viewport")!;
    fireEvent.keyDown(viewport, { key: "ArrowRight" });
    const cell01 = container.querySelector('td[data-row="0"][data-col="1"]')!;
    expect(cell01).toHaveAttribute("aria-selected", "true");
  });

  it("supports selectionStyle='subtle' without drag handle", () => {
    const { container } = render(
      <Excelat
        data={sampleData}
        selectionStyle="subtle"
      />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.mouseDown(cell00, { button: 0 });

    expect(cell00).toHaveClass("excelat-cell-subtle-active");
    expect(cell00).toHaveClass("excelat-cell-subtle-selected");
    // No Excel drag handle
    expect(container.querySelector(".excelat-cell-handle")).toBeNull();
  });

  it("supports selectionStyle='none' while preserving full interaction", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Excelat
        data={sampleData}
        selectionStyle="none"
        onChange={handleChange}
      />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.mouseDown(cell00, { button: 0 });

    // No visual classes
    expect(cell00).not.toHaveClass("excelat-cell-selected");
    expect(cell00).not.toHaveClass("excelat-cell-subtle-selected");
    expect(container.querySelector(".excelat-cell-handle")).toBeNull();

    // But typing and editing still work!
    const viewport = container.querySelector(".excelat-grid-viewport")!;
    fireEvent.keyDown(viewport, { key: "Z" });

    const input = container.querySelector("input.excelat-cell-editor") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("Z");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleChange).toHaveBeenCalled();
  });

  it("supports column resizing via drag handle and callback", () => {
    const handleColResize = vi.fn();
    const { container } = render(
      <Excelat
        data={sampleData}
        onColumnResize={handleColResize}
      />
    );

    const resizeHandle = container.querySelectorAll(".excelat-col-resize-handle")[0];
    expect(resizeHandle).toBeTruthy();

    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 160 });
    fireEvent.mouseUp(window);

    expect(handleColResize).toHaveBeenCalled();
    const [colIndex, width] = handleColResize.mock.calls[0];
    expect(colIndex).toBe(0);
    expect(width).toBeGreaterThan(100);
  });

  it("renders formula bar when showFormulaBar is true", () => {
    const { container } = render(
      <Excelat
        data={sampleData}
        showFormulaBar={true}
      />
    );

    const formulaBar = container.querySelector(".excelat-formula-bar");
    expect(formulaBar).toBeTruthy();
    expect(formulaBar?.textContent).toContain("A1");
  });
});
