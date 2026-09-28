import React, { useEffect, useRef } from "react";
import { EditMovement } from "../hooks/useEditing";

export interface CellEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (movement?: EditMovement) => void;
  onCancel: () => void;
}

export const CellEditor: React.FC<CellEditorProps> = ({
  value,
  onChange,
  onCommit,
  onCancel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Place cursor at the end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation so parent grid key listener doesn't intercept
    e.stopPropagation();

    if (e.key === "Enter") {
      e.preventDefault();
      onCommit(e.shiftKey ? "up" : "down");
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      onCommit(e.shiftKey ? "left" : "right");
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      isCancelledRef.current = true;
      onCancel();
      return;
    }
  };

  const handleBlur = () => {
    if (!isCancelledRef.current) {
      onCommit("none");
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      className="excelat-cell-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    />
  );
};
