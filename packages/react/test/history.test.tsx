import { describe, it, expect } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Excelat } from "../src/Excelat";

describe("Excelat - History (Undo / Redo)", () => {
  const initialData = [
    ["Jay", 30, "Bangalore"],
    ["Rahul", 28, "Delhi"],
  ];

  it("undoes and redoes a cell edit", () => {
    const { container } = render(
      <Excelat data={initialData} rows={5} columns={5} />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.doubleClick(cell00);

    const input = container.querySelector("input.excelat-cell-editor") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "UpdatedName" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Cell 0, 0 should show "UpdatedName"
    expect(cell00.textContent).toContain("UpdatedName");

    // Press Ctrl+Z to undo
    const viewport = container.querySelector(".excelat-grid-viewport")!;
    fireEvent.keyDown(viewport, { key: "z", ctrlKey: true });
    expect(cell00.textContent).toContain("Jay");

    // Press Ctrl+Y to redo
    fireEvent.keyDown(viewport, { key: "y", ctrlKey: true });
    expect(cell00.textContent).toContain("UpdatedName");
  });

  it("undoes a delete operation", () => {
    const { container } = render(
      <Excelat data={initialData} rows={5} columns={5} />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.mouseDown(cell00, { button: 0 });

    const viewport = container.querySelector(".excelat-grid-viewport")!;
    // Press Delete
    fireEvent.keyDown(viewport, { key: "Delete" });
    expect(cell00.textContent).toBe("");

    // Press Ctrl+Z to undo
    fireEvent.keyDown(viewport, { key: "z", ctrlKey: true });
    expect(cell00.textContent).toContain("Jay");
  });

  it("undoes a paste operation", async () => {
    const { container } = render(
      <Excelat data={initialData} rows={5} columns={5} />
    );

    await navigator.clipboard.writeText("PastedValue");

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.mouseDown(cell00, { button: 0 });

    const viewport = container.querySelector(".excelat-grid-viewport")!;
    fireEvent.keyDown(viewport, { key: "v", ctrlKey: true });

    await waitFor(() => {
      expect(cell00.textContent).toContain("PastedValue");
    });

    // Undo paste
    fireEvent.keyDown(viewport, { key: "z", ctrlKey: true });
    await waitFor(() => {
      expect(cell00.textContent).toContain("Jay");
    });
  });
});
