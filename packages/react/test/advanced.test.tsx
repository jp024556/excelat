import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act, waitFor } from "@testing-library/react";
import { Excelat, ExcelatRef, ExcelatData } from "../src";

describe("Excelat - Advanced Features", () => {
  const sampleData: ExcelatData = [
    ["Alice", 25, "Seattle"],
    ["Bob", 30, "Portland"],
    ["Charlie", 35, "San Francisco"],
  ];

  describe("Formula Bar Editing Surface", () => {
    it("updates formula bar when active cell changes", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          showFormulaBar={true}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      const nameBox = container.querySelector(".excelat-name-box");
      const formulaInput = container.querySelector(".excelat-formula-input") as HTMLInputElement;

      expect(nameBox?.textContent).toBe("A1");
      expect(formulaInput.value).toBe("Alice");

      // Select cell (1, 2) -> C2
      const cell12 = container.querySelector('td[data-row="1"][data-col="2"]')!;
      fireEvent.mouseDown(cell12, { button: 0 });

      expect(nameBox?.textContent).toBe("C2");
      expect(formulaInput.value).toBe("Portland");
    });

    it("edits active cell from formula bar and commits on Enter", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          showFormulaBar={true}
          onChange={handleChange}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      const formulaInput = container.querySelector(".excelat-formula-input") as HTMLInputElement;
      fireEvent.change(formulaInput, { target: { value: "Alicia" } });
      fireEvent.keyDown(formulaInput, { key: "Enter" });

      expect(handleChange).toHaveBeenCalled();
      const updated = handleChange.mock.calls[0][0];
      expect(updated[0][0]).toBe("Alicia");
      expect(cell00.textContent).toContain("Alicia");
    });

    it("cancels formula bar edit on Escape", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          showFormulaBar={true}
          onChange={handleChange}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      const formulaInput = container.querySelector(".excelat-formula-input") as HTMLInputElement;
      fireEvent.change(formulaInput, { target: { value: "Changed" } });
      fireEvent.keyDown(formulaInput, { key: "Escape" });

      expect(handleChange).not.toHaveBeenCalled();
      expect(cell00.textContent).toContain("Alice");
    });

    it("supports undo and redo for formula bar edits", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          showFormulaBar={true}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      const formulaInput = container.querySelector(".excelat-formula-input") as HTMLInputElement;
      fireEvent.change(formulaInput, { target: { value: "EditedFromBar" } });
      fireEvent.keyDown(formulaInput, { key: "Enter" });

      expect(cell00.textContent).toContain("EditedFromBar");

      // Undo
      const viewport = container.querySelector(".excelat-grid-viewport")!;
      fireEvent.keyDown(viewport, { key: "z", ctrlKey: true });
      expect(cell00.textContent).toContain("Alice");

      // Redo
      fireEvent.keyDown(viewport, { key: "y", ctrlKey: true });
      expect(cell00.textContent).toContain("EditedFromBar");
    });
  });

  describe("Structural Operations (Insert & Delete Rows / Columns)", () => {
    it("inserts and deletes rows via imperative ref with undo/redo", () => {
      const ref = createRef<ExcelatRef>();
      const handleChange = vi.fn();

      render(
        <Excelat
          ref={ref}
          data={sampleData}
          onChange={handleChange}
        />
      );

      // Insert row at index 1
      act(() => {
        ref.current?.insertRow(1);
      });
      expect(handleChange).toHaveBeenCalled();
      let updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated.length).toBe(sampleData.length + 1);
      expect(updated[1][0]).toBeNull();
      expect(updated[2][0]).toBe("Bob");

      // Undo row insertion
      act(() => {
        ref.current?.undo();
      });
      updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated.length).toBe(sampleData.length);
      expect(updated[1][0]).toBe("Bob");

      // Delete row 0 ("Alice")
      act(() => {
        ref.current?.deleteRow(0);
      });
      updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated.length).toBe(sampleData.length - 1);
      expect(updated[0][0]).toBe("Bob");

      // Undo row deletion
      act(() => {
        ref.current?.undo();
      });
      updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated.length).toBe(sampleData.length);
      expect(updated[0][0]).toBe("Alice");
    });

    it("inserts and deletes columns via imperative ref with undo/redo", () => {
      const ref = createRef<ExcelatRef>();
      const handleChange = vi.fn();

      render(
        <Excelat
          ref={ref}
          data={sampleData}
          onChange={handleChange}
        />
      );

      // Insert column at index 1
      act(() => {
        ref.current?.insertColumn(1);
      });
      expect(handleChange).toHaveBeenCalled();
      let updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated[0][1]).toBeNull();
      expect(updated[0][2]).toBe(25); // 25 shifted right

      // Undo column insertion
      act(() => {
        ref.current?.undo();
      });
      updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated[0][1]).toBe(25);

      // Delete column at index 1
      act(() => {
        ref.current?.deleteColumn(1);
      });
      updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated[0][1]).toBe("Seattle"); // Seattle shifted left

      // Undo column deletion
      act(() => {
        ref.current?.undo();
      });
      updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated[0][1]).toBe(25);
    });
  });

  describe("Custom Cell Rendering & Column Types", () => {
    it("renders custom cell component when render context is provided", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          mode="table"
          columns={[
            { header: "Name" },
            {
              header: "Age Badge",
              render: ({ value }) => (
                <span data-testid="age-badge" className="badge">
                  Age: {String(value)}
                </span>
              ),
            },
            { header: "City" },
          ]}
        />
      );

      const badges = container.querySelectorAll('[data-testid="age-badge"]');
      expect(badges.length).toBeGreaterThan(0);
      expect(badges[0].textContent).toBe("Age: 25");
      expect(badges[1].textContent).toBe("Age: 30");
    });

    it("parses numbers predictably when column type is 'number'", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          onChange={handleChange}
          columns={[
            { header: "Name", type: "text" },
            { header: "Age", type: "number" },
          ]}
        />
      );

      const cell01 = container.querySelector('td[data-row="0"][data-col="1"]')!;
      fireEvent.doubleClick(cell01);

      const input = container.querySelector("input.excelat-cell-editor") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "99" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(handleChange).toHaveBeenCalled();
      const updated = handleChange.mock.calls[0][0];
      expect(updated[0][1]).toBe(99);
      expect(typeof updated[0][1]).toBe("number");
    });
  });

  describe("Fill Handle", () => {
    it("drags fill handle to extend values", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          onChange={handleChange}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      const handle = container.querySelector(".excelat-cell-handle");
      expect(handle).toBeTruthy();

      // Mouse down on handle
      fireEvent.mouseDown(handle!, { button: 0 });

      // Drag down to row 2
      const targetCell = container.querySelector('td[data-row="2"][data-col="0"]')!;
      fireEvent.mouseEnter(targetCell);

      // Release mouse
      fireEvent.mouseUp(window);

      expect(handleChange).toHaveBeenCalled();
      const updated = handleChange.mock.calls[0][0];
      // "Alice" was copied down to row 1 and row 2
      expect(updated[0][0]).toBe("Alice");
      expect(updated[1][0]).toBe("Alice");
      expect(updated[2][0]).toBe("Alice");
    });
  });

  describe("Drag Selected Range (Move)", () => {
    it("drags selected range to move values with undo support", () => {
      const handleChange = vi.fn();
      const ref = createRef<ExcelatRef>();
      const { container } = render(
        <Excelat
          ref={ref}
          data={sampleData}
          rows={5}
          columns={5}
          onChange={handleChange}
        />
      );

      // Select cell (0, 0)
      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.mouseDown(cell00, { button: 0 });

      // Border drag zone should exist on selected cell
      const dragZone = cell00.querySelector(".excelat-cell-border-drag-zone");
      expect(dragZone).toBeTruthy();

      // Start dragging border zone
      fireEvent.mouseDown(dragZone!, { button: 0 });

      // Move to cell (3, 3)
      const targetCell = container.querySelector('td[data-row="3"][data-col="3"]')!;
      fireEvent.mouseEnter(targetCell);

      // Release mouse on container
      const containerDiv = container.querySelector(".excelat-container")!;
      fireEvent.mouseUp(containerDiv);

      expect(handleChange).toHaveBeenCalled();
      const updated = handleChange.mock.calls[0][0];
      // (0, 0) value was "Alice", now cleared to null, moved to (3, 3)
      expect(updated[0][0]).toBeNull();
      expect(updated[3][3]).toBe("Alice");

      // Undo range move
      act(() => {
        ref.current?.undo();
      });
      const reverted = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(reverted[0][0]).toBe("Alice");
      expect(reverted[3][3]).toBeNull();
    });
  });

  describe("Row and Column Clipboard", () => {
    it("copies and pastes a full row via keyboard shortcut", async () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          rows={5}
          columns={3}
          onChange={handleChange}
        />
      );

      // Click row header 0 to select entire row 0
      const rowHeader0 = container.querySelector('th.excelat-row-header[data-row="0"]')!;
      fireEvent.click(rowHeader0);

      // Copy row (Ctrl+C)
      const viewport = container.querySelector(".excelat-grid-viewport")!;
      fireEvent.keyDown(viewport, { key: "c", ctrlKey: true });

      const text = await navigator.clipboard.readText();
      expect(text).toBe("Alice\t25\tSeattle");

      // Select cell (3, 0)
      const cell30 = container.querySelector('td[data-row="3"][data-col="0"]')!;
      fireEvent.mouseDown(cell30, { button: 0 });

      // Paste row (Ctrl+V)
      fireEvent.keyDown(viewport, { key: "v", ctrlKey: true });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const updated = handleChange.mock.calls[0][0];
        expect(updated[3][0]).toBe("Alice");
        expect(updated[3][1]).toBe(25);
        expect(updated[3][2]).toBe("Seattle");
      });
    });

    it("copies and pastes a column via keyboard shortcut", async () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          rows={3}
          columns={5}
          onChange={handleChange}
        />
      );

      // Click column header 0 (Name column)
      const colHeader0 = container.querySelector('th.excelat-col-header[data-col="0"]')!;
      fireEvent.click(colHeader0);

      // Copy column (Ctrl+C)
      const viewport = container.querySelector(".excelat-grid-viewport")!;
      fireEvent.keyDown(viewport, { key: "c", ctrlKey: true });

      const text = await navigator.clipboard.readText();
      expect(text).toBe("Alice\r\nBob\r\nCharlie");

      // Select cell (0, 3)
      const cell03 = container.querySelector('td[data-row="0"][data-col="3"]')!;
      fireEvent.mouseDown(cell03, { button: 0 });

      // Paste column (Ctrl+V)
      fireEvent.keyDown(viewport, { key: "v", ctrlKey: true });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const updated = handleChange.mock.calls[0][0];
        expect(updated[0][3]).toBe("Alice");
        expect(updated[1][3]).toBe("Bob");
        expect(updated[2][3]).toBe("Charlie");
      });
    });
  });

  describe("Context Menu Callback", () => {
    it("fires onContextMenu with row, col, and selection context", () => {
      const handleContextMenu = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          onContextMenu={handleContextMenu}
        />
      );

      const cell11 = container.querySelector('td[data-row="1"][data-col="1"]')!;
      fireEvent.contextMenu(cell11);

      expect(handleContextMenu).toHaveBeenCalled();
      const [, context] = handleContextMenu.mock.calls[0];
      expect(context.rowIndex).toBe(1);
      expect(context.columnIndex).toBe(1);
      expect(context.selection).toBeTruthy();
    });
  });
});
