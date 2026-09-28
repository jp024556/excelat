import React from "react";
import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Excelat } from "../src/Excelat";

describe("Excelat - Navigation", () => {
  const testData = [
    ["A1", "B1", "C1"],
    ["A2", "B2", "C2"],
    ["A3", "B3", "C3"],
  ];

  it("navigates with Arrow keys", () => {
    const { container } = render(
      <Excelat data={testData} rows={5} columns={5} />
    );
    const viewport = container.querySelector(".excelat-grid-viewport")!;

    // Start at (0, 0)
    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]');
    fireEvent.mouseDown(cell00!, { button: 0 });
    expect(cell00).toHaveClass("excelat-cell-active");

    // ArrowRight -> (0, 1)
    fireEvent.keyDown(viewport, { key: "ArrowRight" });
    const cell01 = container.querySelector('td[data-row="0"][data-col="1"]');
    expect(cell01).toHaveClass("excelat-cell-active");

    // ArrowDown -> (1, 1)
    fireEvent.keyDown(viewport, { key: "ArrowDown" });
    const cell11 = container.querySelector('td[data-row="1"][data-col="1"]');
    expect(cell11).toHaveClass("excelat-cell-active");

    // ArrowLeft -> (1, 0)
    fireEvent.keyDown(viewport, { key: "ArrowLeft" });
    const cell10 = container.querySelector('td[data-row="1"][data-col="0"]');
    expect(cell10).toHaveClass("excelat-cell-active");

    // ArrowUp -> (0, 0)
    fireEvent.keyDown(viewport, { key: "ArrowUp" });
    expect(cell00).toHaveClass("excelat-cell-active");
  });

  it("navigates with Tab and Shift + Tab", () => {
    const { container } = render(
      <Excelat data={testData} rows={5} columns={5} />
    );
    const viewport = container.querySelector(".excelat-grid-viewport")!;

    // Start at (0, 0)
    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]');
    fireEvent.mouseDown(cell00!, { button: 0 });

    // Tab -> (0, 1)
    fireEvent.keyDown(viewport, { key: "Tab" });
    const cell01 = container.querySelector('td[data-row="0"][data-col="1"]');
    expect(cell01).toHaveClass("excelat-cell-active");

    // Shift + Tab -> (0, 0)
    fireEvent.keyDown(viewport, { key: "Tab", shiftKey: true });
    expect(cell00).toHaveClass("excelat-cell-active");
  });

  it("navigates with Enter and Shift + Enter", () => {
    const { container } = render(
      <Excelat data={testData} rows={5} columns={5} />
    );
    const viewport = container.querySelector(".excelat-grid-viewport")!;

    // Start at (0, 0)
    const cell00 = container.querySelector('td[data-row="0"][data-col="0"]');
    fireEvent.mouseDown(cell00!, { button: 0 });

    // Enter -> (1, 0)
    fireEvent.keyDown(viewport, { key: "Enter" });
    const cell10 = container.querySelector('td[data-row="1"][data-col="0"]');
    expect(cell10).toHaveClass("excelat-cell-active");

    // Shift + Enter -> (0, 0)
    fireEvent.keyDown(viewport, { key: "Enter", shiftKey: true });
    expect(cell00).toHaveClass("excelat-cell-active");
  });

  it("navigates with Home and End keys", () => {
    const { container } = render(
      <Excelat data={testData} rows={5} columns={5} />
    );
    const viewport = container.querySelector(".excelat-grid-viewport")!;

    // Start at (1, 2)
    const cell12 = container.querySelector('td[data-row="1"][data-col="2"]');
    fireEvent.mouseDown(cell12!, { button: 0 });

    // Home -> (1, 0)
    fireEvent.keyDown(viewport, { key: "Home" });
    const cell10 = container.querySelector('td[data-row="1"][data-col="0"]');
    expect(cell10).toHaveClass("excelat-cell-active");

    // End -> (1, 4) (total cols is 5, index 4)
    fireEvent.keyDown(viewport, { key: "End" });
    const cell14 = container.querySelector('td[data-row="1"][data-col="4"]');
    expect(cell14).toHaveClass("excelat-cell-active");
  });
});
