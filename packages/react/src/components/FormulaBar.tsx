import React from "react";
import { CellValue } from "../model/types";

export interface FormulaBarProps {
  activeCoordText: string;
  activeValue: CellValue;
  isEditing: boolean;
  editValue: string;
  onChangeEditValue?: (value: string) => void;
  onCommit?: () => void;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCoordText,
  activeValue,
  isEditing,
  editValue,
  onChangeEditValue,
  onCommit,
}) => {
  const displayValue = isEditing
    ? editValue
    : activeValue !== null && activeValue !== undefined
    ? String(activeValue)
    : "";

  return (
    <div className="excelat-formula-bar" role="toolbar" aria-label="Formula Bar">
      <div className="excelat-name-box" title="Active Cell">
        {activeCoordText}
      </div>
      <div className="excelat-fx-icon" aria-hidden="true">
        fx
      </div>
      <div className="excelat-formula-input-wrapper">
        <input
          type="text"
          className="excelat-formula-input"
          value={displayValue}
          onChange={(e) => onChangeEditValue?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCommit?.();
            }
          }}
          placeholder="Enter a value..."
          aria-label="Cell formula input"
        />
      </div>
    </div>
  );
};

FormulaBar.displayName = "FormulaBar";
