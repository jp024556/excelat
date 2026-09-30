import React from "react";
import { SortDirection } from "../model/types";

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Directional Streamlined Arrows Sort Indicator (15x15 pixel grid).
 * Linear / Raycast style: paired counter-directional arrows (↑↓) when neutral,
 * single crisp upward arrow (↑) for ascending, downward arrow (↓) for descending.
 */
export const SortIcon: React.FC<
  IconProps & { direction?: SortDirection }
> = ({ size = 13, direction, className = "", style }) => {
  if (direction === "asc") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`excelat-icon-sort excelat-icon-sort-asc ${className}`}
        style={style}
        aria-hidden="true"
      >
        <path
          d="M7.5 12.5V2.5M7.5 2.5L3.5 6.5M7.5 2.5L11.5 6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (direction === "desc") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`excelat-icon-sort excelat-icon-sort-desc ${className}`}
        style={style}
        aria-hidden="true"
      >
        <path
          d="M7.5 2.5V12.5M7.5 12.5L3.5 8.5M7.5 12.5L11.5 8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Streamlined paired counter-directional arrows (↑↓)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`excelat-icon-sort excelat-icon-sort-neutral ${className}`}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M4.75 11.5V3.5M4.75 3.5L2.5 5.75M4.75 3.5L7 5.75"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.25 3.5V11.5M10.25 11.5L8 9.25M10.25 11.5L12.5 9.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Teenyicons Filter Icon (15x15 pixel grid).
 * Outline when inactive, solid filled when filter is actively applied.
 */
export const FilterIcon: React.FC<IconProps & { active?: boolean }> = ({
  size = 13,
  active = false,
  className = "",
  style,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`excelat-icon-filter ${active ? "active" : ""} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {active ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15 3H0V2H15V3ZM12 8H3V7H12V8ZM10 13H5V12H10V13Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M0 2.5H15M3 7.5H12M5 12.5H10"
          stroke="currentColor"
          strokeLinecap="square"
        />
      )}
    </svg>
  );
};

/**
 * Teenyicons Right Chevron (15x15 pixel grid) for row grouping and tree collapse/expand.
 */
export const ChevronRightIcon: React.FC<
  IconProps & { expanded?: boolean }
> = ({ size = 12, expanded = false, className = "", style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`excelat-icon-chevron ${expanded ? "expanded" : ""} ${className}`}
      style={{
        transition: "transform 0.15s ease",
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
        transformOrigin: "center",
        ...style,
      }}
      aria-hidden="true"
    >
      <path d="M6 3.5L10 7.5L6 11.5" stroke="currentColor" strokeLinecap="square" />
    </svg>
  );
};

/**
 * Teenyicons Left Chevron (15x15 pixel grid).
 */
export const ChevronLeftIcon: React.FC<IconProps> = ({
  size = 12,
  className = "",
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`excelat-icon-chevron-left ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d="M9 3.5L5 7.5L9 11.5" stroke="currentColor" strokeLinecap="square" />
  </svg>
);

/**
 * Teenyicons Right Chevron (15x15 pixel grid) for pagination.
 */
export const ChevronRightNavIcon: React.FC<IconProps> = ({
  size = 12,
  className = "",
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`excelat-icon-chevron-right ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d="M6 3.5L10 7.5L6 11.5" stroke="currentColor" strokeLinecap="square" />
  </svg>
);

/**
 * Teenyicons Double Left Chevron (15x15 pixel grid) for first page.
 */
export const ChevronsLeftIcon: React.FC<IconProps> = ({
  size = 12,
  className = "",
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`excelat-icon-chevrons-left ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d="M8 3.5L4 7.5L8 11.5" stroke="currentColor" strokeLinecap="square" />
    <path d="M12 3.5L8 7.5L12 11.5" stroke="currentColor" strokeLinecap="square" />
  </svg>
);

/**
 * Teenyicons Double Right Chevron (15x15 pixel grid) for last page.
 */
export const ChevronsRightIcon: React.FC<IconProps> = ({
  size = 12,
  className = "",
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`excelat-icon-chevrons-right ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d="M3 3.5L7 7.5L3 11.5" stroke="currentColor" strokeLinecap="square" />
    <path d="M7 3.5L11 7.5L7 11.5" stroke="currentColor" strokeLinecap="square" />
  </svg>
);
