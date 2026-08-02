export type IconName =
  | "back"
  | "blood-pressure"
  | "bmi"
  | "check"
  | "chevron-down"
  | "dental"
  | "download"
  | "general"
  | "glucose"
  | "height"
  | "info"
  | "inbox"
  | "location"
  | "oxygen"
  | "personal"
  | "plus"
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

export interface IconProps {
  name: IconName;
  /** 13 in a badge, 15-16 inline with text, 17-18 in buttons and nav, 20-21 in empty states. */
  size?: number;
  className?: string;
  /** Icons are decorative by default; give a label when the glyph is the only content. */
  label?: string;
}
