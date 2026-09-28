import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Excelat } from "../src/Excelat";

describe("Excelat - Editing", () => {
  const initialData = [
    ["Jay", 30, "Bangalore"],
    ["Rahul", 28, "Delhi"],
  ];

  it("starts editing on double click", () => {
    const { container } = render(
      <Excelat data={initialData} rows={5} columns={5} />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.doubleClick(cell00);

    const input = container.querySelector("input.excelat-cell-editor") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("Jay");
  });

  it("replaces existing value when typing while cell is selected", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Excelat
        data={initialData}
        rows={5}
        columns={5}
        onChange={handleChange}
      />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.mouseDown(cell00, { button: 0 });

    const viewport = container.querySelector(".excelat-grid-viewport")!;
    // Type 'M' directly
    fireEvent.keyDown(viewport, { key: "M" });

    const input = container.querySelector("input.excelat-cell-editor") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("M");

    // Type the rest: "Max" and press Enter
    fireEvent.change(input, { target: { value: "Max" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleChange).toHaveBeenCalled();
    const updatedData = handleChange.mock.calls[0][0];
    expect(updatedData[0][0]).toBe("Max");
  });

  it("commits on Enter and moves to the next row", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Excelat
        data={initialData}
        rows={5}
        columns={5}
        onChange={handleChange}
      />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.doubleClick(cell00);

    const input = container.querySelector("input.excelat-cell-editor") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "John" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0][0][0]).toBe("John");

    // Active cell should now be at row 1, col 0
    const cell10 = container.querySelector('td[data-row="1"][data-col="0"]')!;
    expect(cell10).toHaveClass("excelat-cell-active");
  });

  it("commits on Tab and moves to next column", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Excelat
        data={initialData}
        rows={5}
        columns={5}
        onChange={handleChange}
      />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.doubleClick(cell00);

    const input = container.querySelector("input.excelat-cell-editor") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "John" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0][0][0]).toBe("John");

    // Active cell should now be at row 0, col 1
    const cell01 = container.querySelector('td[data-row="0"][data-col="1"]')!;
    expect(cell01).toHaveClass("excelat-cell-active");
  });

  it("cancels editing on Escape without changing value", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Excelat
        data={initialData}
        rows={5}
        columns={5}
        onChange={handleChange}
      />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.doubleClick(cell00);

    const input = container.querySelector("input.excelat-cell-editor") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ShouldNotSave" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(handleChange).not.toHaveBeenCalled();
    expect(container.querySelector("input.excelat-cell-editor")).toBeNull();
    expect(cell00.textContent).toContain("Jay");
  });
});
