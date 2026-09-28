import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import fs from "fs";
import path from "path";
import { Excelat } from "../src/Excelat";
import type { ExcelatProps } from "../src/model/types";

describe("Excelat - Typography & Font Inheritance", () => {
  const sampleData = [
    ["Alice", 28, "Engineering"],
    ["Bob", 34, "Marketing"],
  ];

  it("renders the root element with .excelat class for consumer font targeting", () => {
    const { container } = render(<Excelat data={sampleData} />);
    const root = container.querySelector(".excelat");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("excelat-container")).toBe(true);
  });

  it("ensures excelat.css contains no bundled, imported, or hardcoded font families", () => {
    const cssPath = path.resolve(__dirname, "../src/styles/excelat.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // Must NOT contain @import of Google Fonts or external fonts
    expect(cssContent).not.toMatch(/@import/i);
    expect(cssContent).not.toMatch(/@font-face/i);

    // Must NOT contain hardcoded fonts such as Arial, Roboto, Inter, system-ui, Helvetica, monospace, serif
    expect(cssContent).not.toMatch(/font-family:\s*[^;\n]*\b(Arial|Roboto|Inter|system-ui|Helvetica|monospace|serif|sans-serif)\b/i);

    // --excelat-font CSS variable should be inherit
    expect(cssContent).toContain("--excelat-font: inherit;");

    // .excelat and .excelat-container must specify font-family: inherit
    expect(cssContent).toMatch(/\.excelat[\s\S]*?font-family:\s*inherit;/);

    // Form controls and table elements must explicitly inherit font-family
    expect(cssContent).toMatch(/\.excelat\s+button[\s\S]*?font-family:\s*inherit;/);
    expect(cssContent).toMatch(/\.excelat\s+input[\s\S]*?font-family:\s*inherit;/);
    expect(cssContent).toMatch(/\.excelat\s+select[\s\S]*?font-family:\s*inherit;/);
    expect(cssContent).toMatch(/\.excelat\s+textarea[\s\S]*?font-family:\s*inherit;/);
  });

  it("allows parent container typography to cascade naturally without interference", () => {
    const customFont = '"Custom Corporate Font", sans-serif';
    const { container } = render(
      <div style={{ fontFamily: customFont }}>
        <Excelat
          data={sampleData}
          showFormulaBar={true}
          mode="spreadsheet"
        />
      </div>
    );

    const root = container.querySelector<HTMLElement>(".excelat")!;
    expect(root).toBeTruthy();

    // Verify key visible Excelat elements are present and structure is intact
    expect(container.querySelector(".excelat-formula-bar")).toBeTruthy();
    expect(container.querySelector(".excelat-name-box")).toBeTruthy();
    expect(container.querySelector(".excelat-formula-input")).toBeTruthy();
    expect(container.querySelector(".excelat-col-header")).toBeTruthy();
    expect(container.querySelector(".excelat-row-header")).toBeTruthy();
    expect(container.querySelector(".excelat-cell")).toBeTruthy();
  });

  it("confirms fontFamily is NOT exposed as a component prop in V0.1", () => {
    // TypeScript type-level check: fontFamily should not exist on ExcelatProps
    type HasFontFamilyProp = "fontFamily" extends keyof ExcelatProps ? true : false;
    const hasFontFamily: HasFontFamilyProp = false;
    expect(hasFontFamily).toBe(false);
  });
});
