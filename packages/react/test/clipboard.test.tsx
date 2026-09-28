import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Excelat } from "../src/Excelat";

describe("Excelat - Clipboard", () => {
  const initialData = [
    ["Jay", 30, "Bangalore"],
    ["Rahul", 28, "Delhi"],
    ["Amit", 32, "Mumbai"],
  ];

  it("copies a single cell to clipboard", async () => {
    const { container } = render(
      <Excelat data={initialData} rows={5} columns={5} />
    );

    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    fireEvent.mouseDown(cell00, { button: 0 });

    const viewport = container.querySelector(".excelat-grid-viewport")!;
    fireEvent.keyDown(viewport, { key: "c", ctrlKey: true });

    await waitFor(async () => {
      const text = await navigator.clipboard.readText();
      expect(text).toBe("Jay");
    });
  });

  it("copies a range to clipboard with TSV format", async () => {
    const { container } = render(
      <Excelat data={initialData} rows={5} columns={5} />
    );

    // Drag select (0, 0) to (1, 1)
    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
    const cell11 = container.querySelector('td[data-row="1"][data-col="1"]')!;
    fireEvent.mouseDown(cell00, { button: 0 });
    fireEvent.mouseEnter(cell11);
    fireEvent.mouseUp(window);

    const viewport = container.querySelector(".excelat-grid-viewport")!;
    fireEvent.keyDown(viewport, { key: "c", ctrlKey: true });

    await waitFor(async () => {
      const text = await navigator.clipboard.readText();
      expect(text).toBe("Jay\t30\r\nRahul\t28");
    });
  });

  it("pastes a matrix into grid starting at active cell", async () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Excelat
        data={initialData}
        rows={6}
        columns={6}
        onChange={handleChange}
      />
    );

    // Set clipboard content
    await navigator.clipboard.writeText("Max\t25\r\nSam\t27");

    // Select cell (1, 1)
    const cell11 = container.querySelector('td[data-row="1"][data-col="1"]')!;
    fireEvent.mouseDown(cell11, { button: 0 });

    const viewport = container.querySelector(".excelat-grid-viewport")!;
    fireEvent.keyDown(viewport, { key: "v", ctrlKey: true });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
      const updated = handleChange.mock.calls[0][0];
      // (1, 1) should be "Max", (1, 2) should be 25
      // (2, 1) should be "Sam", (2, 2) should be 27
      expect(updated[1][1]).toBe("Max");
      expect(updated[1][2]).toBe(25);
      expect(updated[2][1]).toBe("Sam");
      expect(updated[2][2]).toBe(27);
    });
  });

  it("cuts a cell (copies and clears)", async () => {
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
    fireEvent.keyDown(viewport, { key: "x", ctrlKey: true });

    await waitFor(async () => {
      const text = await navigator.clipboard.readText();
      expect(text).toBe("Jay");
      expect(handleChange).toHaveBeenCalled();
      const updated = handleChange.mock.calls[0][0];
      expect(updated[0][0]).toBeNull();
    });
  });
});
