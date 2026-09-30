import {
  BookOpen,
  Sliders,
  Table,
  Palette,
  ArrowUpDown,
  Filter,
  FolderTree,
  Cpu,
  ListOrdered,
  MoveHorizontal,
  Terminal,
  BookmarkCheck,
  Layout,
  Code2,
} from "lucide-react";
import { DocCategory } from "./types";

export const DOC_CATEGORIES: DocCategory[] = [
  {
    title: "GETTING STARTED",
    items: [
      {
        id: "overview",
        title: "Overview & Quickstart",
        description: "Core architecture, installation, and first spreadsheet table.",
        icon: BookOpen,
      },
      {
        id: "modes",
        title: "Visual Modes & Selection",
        description: "Spreadsheet vs Table presentation, Excel accent, subtle border, and hidden selection.",
        icon: Sliders,
      },
    ],
  },
  {
    title: "CORE CAPABILITIES",
    items: [
      {
        id: "data-model",
        title: "Data Model & Editing",
        description: "2D matrix architecture, keyboard navigation, Formula Bar, and TSV clipboard.",
        icon: Table,
      },
      {
        id: "custom-cells",
        title: "Custom Cells & Editors",
        description: "Badges, formatted currency, interactive action buttons, and custom editor widgets.",
        icon: Palette,
      },
      {
        id: "sorting",
        title: "Sorting (Single & Multi)",
        description: "Client & server sorting, Shift+Click multi-column priority badges, and cycle rules.",
        icon: ArrowUpDown,
      },
      {
        id: "filtering",
        title: "Filtering & Operators",
        description: "Header filter popovers, text and numeric operators, and server event pipelines.",
        icon: Filter,
      },
      {
        id: "grouping",
        title: "Row Grouping & Trees",
        description: "Multi-level hierarchical grouping, collapse/expand chevrons, and sub-aggregations.",
        icon: FolderTree,
      },
    ],
  },
  {
    title: "PERFORMANCE & SCALE",
    items: [
      {
        id: "virtualization",
        title: "Virtualization (10k+ Rows)",
        description: "High-performance windowing engine, dynamic spacers, and sub-millisecond scrolling.",
        icon: Cpu,
      },
      {
        id: "pagination",
        title: "Pagination & Infinite Scroll",
        description: "Client and server-side controlled pagination, custom slots, and infinite loading.",
        icon: ListOrdered,
      },
    ],
  },
  {
    title: "INTERACTIONS & STATE",
    items: [
      {
        id: "column-reorder",
        title: "Column Drag & Drop",
        description: "Native HTML5 drag-and-drop column reordering, live insertion guides, and Undo/Redo.",
        icon: MoveHorizontal,
      },
      {
        id: "operations",
        title: "Operations & Realtime Sync",
        description: "Granular onOperation mutation pipeline for WebSocket, Supabase, or backend sync.",
        icon: Terminal,
      },
      {
        id: "state-persistence",
        title: "State Persistence & Views",
        description: "Saving and restoring grid layouts with initialState, getState, setState, and resetState.",
        icon: BookmarkCheck,
      },
      {
        id: "toolbar-context",
        title: "Toolbar & Context Menu",
        description: "Custom toolbar slots, imperative action helpers, and right-click context menu callbacks.",
        icon: Layout,
      },
    ],
  },
  {
    title: "REFERENCE",
    items: [
      {
        id: "api-reference",
        title: "API Reference & Types",
        description: "Complete TypeScript interface specifications, ExcelatProps, ExcelatRef, and utilities.",
        icon: Code2,
      },
    ],
  },
];

export const ALL_SECTIONS = DOC_CATEGORIES.flatMap((c) => c.items);
