import { LucideIcon } from "lucide-react";

export type DocSectionId =
  | "overview"
  | "modes"
  | "data-model"
  | "custom-cells"
  | "sorting"
  | "filtering"
  | "grouping"
  | "virtualization"
  | "pagination"
  | "column-reorder"
  | "operations"
  | "state-persistence"
  | "toolbar-context"
  | "api-reference";

export interface DocCategory {
  title: string;
  items: {
    id: DocSectionId;
    title: string;
    description: string;
    icon: LucideIcon;
    badge?: string;
  }[];
}

export interface PropDefinition {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
  required?: boolean;
}
