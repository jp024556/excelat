import React from "react";
import { ToolbarProps } from "../model/types";

export interface GridToolbarWrapperProps {
  toolbar: React.ReactNode | ((props: ToolbarProps) => React.ReactNode);
  toolbarProps: ToolbarProps;
}

export const GridToolbar: React.FC<GridToolbarWrapperProps> = React.memo(
  ({ toolbar, toolbarProps }) => {
    if (!toolbar) return null;

    const content =
      typeof toolbar === "function" ? toolbar(toolbarProps) : toolbar;

    return (
      <div className="excelat-toolbar" role="toolbar" aria-label="Grid actions">
        {content}
      </div>
    );
  }
);

GridToolbar.displayName = "GridToolbar";
