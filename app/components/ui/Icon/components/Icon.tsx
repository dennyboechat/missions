// Components
import {
  Activity,
  Calculator,
  Check,
  ChevronDown,
  ChevronLeft,
  ChartPie,
  Droplet,
  Eye,
  FileDown,
  Gauge,
  HeartPulse,
  Inbox,
  Info,
  ListChecks,
  MapPin,
  Plus,
  Ruler,
  Search,
  Settings,
  ShieldUser,
  Smile,
  Stethoscope,
  Thermometer,
  Trash2,
  TriangleAlert,
  User,
  UsersRound,
  Weight,
  X,
} from "lucide-react";

// Types
import { IconName, IconProps } from "../types/IconProps";
import { LucideIcon } from "lucide-react";

/**
 * The one place the product names a glyph.
 *
 * Call sites ask for a role -- "reports", "dental", "back" -- not a library
 * export, so the icon set can be replaced here without touching a screen. That
 * already happened once: the app shipped Font Awesome Solid, whose filled
 * glyphs sat heavily against a 1px UI, and moved to Lucide, whose 2px stroke
 * matches the borders and the type.
 */
const GLYPHS: Record<IconName, LucideIcon> = {
  back: ChevronLeft,
  "blood-pressure": Gauge,
  bmi: Calculator,
  check: Check,
  "chevron-down": ChevronDown,
  dental: Smile,
  download: FileDown,
  general: Stethoscope,
  glucose: Droplet,
  height: Ruler,
  info: Info,
  inbox: Inbox,
  location: MapPin,
  oxygen: Activity,
  personal: User,
  plus: Plus,
  pulse: HeartPulse,
  reports: ChartPie,
  search: Search,
  settings: Settings,
  summary: ListChecks,
  temperature: Thermometer,
  trash: Trash2,
  users: UsersRound,
  "user-access": ShieldUser,
  vision: Eye,
  warning: TriangleAlert,
  weight: Weight,
  x: X,
};

export const Icon = ({ name, size = 18, className, label }: IconProps) => {
  const Glyph = GLYPHS[name];

  return (
    <Glyph
      size={size}
      strokeWidth={2}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
};
