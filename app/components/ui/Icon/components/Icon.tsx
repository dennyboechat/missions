// Components
import {
  Activity,
  Calculator,
  Check,
  ChevronDown,
  ChevronLeft,
  ChartPie,
  CircleAlert,
  Droplet,
  Eye,
  FileDown,
  Gauge,
  HeartPulse,
  History,
  Inbox,
  Info,
  ListChecks,
  MapPin,
  Plus,
  Printer,
  Ruler,
  Search,
  Settings,
  ShieldUser,
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
import { ComponentType } from "react";
import { IconName, IconProps, LucideProps } from "../types/IconProps";

/**
 * A tooth, drawn here because the set does not have one.
 *
 * Lucide ships 2007 glyphs and no tooth, so Dental has been wearing Smile -- a
 * mouth, which is close, and which is also what Personal's face would be if it
 * were not a bust. This is the shape the label actually says.
 *
 * Drawn to Lucide's own conventions so it does not read as a guest: the 24-unit
 * grid, no fill, a 2px stroke that scales with the size, round caps and joins.
 * Symmetric about x=12, crown from y=3 to the shoulders at y=9, two roots down to
 * y=21 -- the same optical bounds the rest of the set uses.
 */
/* Every segment states its own command letter, including where the letter could
   be inferred. Dropping them lets the next group of numbers be read as a
   continuation of the previous curve instead of a new one, which does not fail --
   it just quietly draws something else. */
const TOOTH_PATH = [
  "M5 9", // left shoulder
  "c0-4.4 3.1-6 7-6", // up over the crown to the midline
  "s7 1.6 7 6", // and down the far side, mirrored
  "c0 3-1 4.5-1.4 7", // right side, narrowing
  "c-.3 2.2-.8 5-2.2 5", // out to the right root tip
  "c-1.1 0-1.4-1.6-1.8-4", // back up its inner edge
  "c-.2-1.4-.7-2.4-1.6-2.4", // into the notch at the midline
  "s-1.4 1-1.6 2.4", // out of it, mirrored
  "c-.4 2.4-.7 4-1.8 4", // down to the left root tip
  "c-1.4 0-1.9-2.8-2.2-5", // back up its outer edge
  "C6 13.5 5 12 5 9", // and home to the left shoulder
  "Z",
].join("");

const Tooth = ({
  size = 24,
  strokeWidth = 2,
  className,
  ...rest
}: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    <path d={TOOTH_PATH} />
  </svg>
);

/**
 * The one place the product names a glyph.
 *
 * Call sites ask for a role -- "reports", "dental", "back" -- not a library
 * export, so the icon set can be replaced here without touching a screen. That
 * already happened once: the app shipped Font Awesome Solid, whose filled
 * glyphs sat heavily against a 1px UI, and moved to Lucide, whose 2px stroke
 * matches the borders and the type.
 */
const GLYPHS: Record<IconName, ComponentType<LucideProps>> = {
  back: ChevronLeft,
  "blood-pressure": Gauge,
  bmi: Calculator,
  check: Check,
  "chevron-down": ChevronDown,
  dental: Tooth,
  download: FileDown,
  // A round alert beside the triangle the warning uses: the two messages sit in
  // the same block, so the glyph has to say which one this is before the colour
  // does.
  error: CircleAlert,
  general: Stethoscope,
  history: History,
  glucose: Droplet,
  height: Ruler,
  info: Info,
  inbox: Inbox,
  location: MapPin,
  oxygen: Activity,
  personal: User,
  plus: Plus,
  print: Printer,
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
