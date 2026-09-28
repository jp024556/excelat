import React, { useRef } from "react";
import { CellValue } from "../model/types";
import { EditMovement } from "../hooks/useEditing";

export interface FormulaBarProps {
  activeCoordText: string;
  activeValue: CellValue;
  isEditing: boolean;
  editValue: CellValue;
  onChange: (value: string) => void;
  onCommit: (movement?: EditMovement) => void;
  onCancel: () => void;
  onFocus?: () => void;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCoordText,
  activeValue,
  isEditing,
  editValue,
  onChange,
  onCommit,
  onCancel,
  onFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = isEditing
    ? editValue !== null && editValue !== undefined
      ? String(editValue)
      : ""
    : activeValue !== null && activeValue !== undefined
    ? String(activeValue)
    : "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onCommit(e.shiftKey ? "up" : "down");
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      inputRef.current?.blur();
      return;
    }
  };

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
          ref={inputRef}
          type="text"
          className="excelat-formula-input"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          placeholder="Enter a value..."
          aria-label="Cell formula input"
        />
      </div>
    </div>
  );
};

FormulaBar.displayName = "FormulaBar";
