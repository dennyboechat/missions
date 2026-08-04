export type IconName =
  | "back"
  | "blood-pressure"
  | "bmi"
  | "check"
  | "chevron-down"
  | "dental"
  | "download"
  | "error"
  | "general"
  | "history"
  | "glucose"
  | "height"
  | "info"
  | "inbox"
  | "location"
  | "oxygen"
  | "personal"
  | "plus"
  | "print"
  | "pulse"
  | "reports"
  | "search"
  | "settings"
  | "summary"
  | "temperature"
  | "trash"
  | "users"
  | "user-access"
  | "vision"
  | "warning"
  | "weight"
  | "x";

/**
 * What every glyph in the set takes. Lucide's own props, re-exported from here so
 * the one hand-drawn glyph in Icon.tsx is typed against the same contract as the
 * 2000 imported ones rather than against a shape of its own.
 */
export type { LucideProps } from "lucide-react";

export interface IconProps {
  name: IconName;
  /** 13 in a badge, 15-16 inline with text, 17-18 in buttons and nav, 20-21 in empty states. */
  size?: number;
  className?: string;
  /** Icons are decorative by default; give a label when the glyph is the only content. */
  label?: string;
}
