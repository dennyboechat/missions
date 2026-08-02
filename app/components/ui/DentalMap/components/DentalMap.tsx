"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { ToothButton } from "../../ToothButton";

// Types
import { DentalMapProps } from "../types/DentalMapProps";
import { Tooth } from "../../../../types/Tooth";

// Styles
import styles from "../styles/DentalMap.module.css";

/**
 * The two arches are laid out from the same origin, then the lower one is
 * pushed down by this much. Upper 16 and lower 17 would otherwise sit a few
 * pixels apart across the midline, which reads as one continuous ring of teeth
 * rather than two jaws.
 */
const ARCH_GAP = 16;

const UPPER_TEETH = [
  { id: "1" as Tooth, left: 19, top: 165 },
  { id: "2" as Tooth, left: 19, top: 137 },
  { id: "3" as Tooth, left: 19, top: 109 },
  { id: "4" as Tooth, left: 19, top: 81 },
  { id: "5" as Tooth, left: 24, top: 53 },
  { id: "6" as Tooth, left: 42, top: 26 },
  { id: "7" as Tooth, left: 72, top: 10 },
  { id: "8" as Tooth, left: 103, top: 0 },
  { id: "9" as Tooth, left: 135, top: 0 },
  { id: "10" as Tooth, left: 166, top: 10 },
  { id: "11" as Tooth, left: 196, top: 26 },
  { id: "12" as Tooth, left: 214, top: 53 },
  { id: "13" as Tooth, left: 219, top: 81 },
  { id: "14" as Tooth, left: 219, top: 109 },
  { id: "15" as Tooth, left: 219, top: 137 },
  { id: "16" as Tooth, left: 219, top: 165 },
];

const LOWER_TEETH = [
  { id: "17" as Tooth, left: 219, top: 210 },
  { id: "18" as Tooth, left: 219, top: 238 },
  { id: "19" as Tooth, left: 219, top: 266 },
  { id: "20" as Tooth, left: 219, top: 294 },
  { id: "21" as Tooth, left: 214, top: 322 },
  { id: "22" as Tooth, left: 195, top: 349 },
  { id: "23" as Tooth, left: 166, top: 368 },
  { id: "24" as Tooth, left: 135, top: 381 },
  { id: "25" as Tooth, left: 103, top: 381 },
  { id: "26" as Tooth, left: 72, top: 368 },
  { id: "27" as Tooth, left: 43, top: 349 },
  { id: "28" as Tooth, left: 24, top: 322 },
  { id: "29" as Tooth, left: 19, top: 294 },
  { id: "30" as Tooth, left: 19, top: 266 },
  { id: "31" as Tooth, left: 19, top: 238 },
  { id: "32" as Tooth, left: 19, top: 210 },
];

const MIDLINE_TOP = 209;

export const DentalMap = ({
  selectedTooth,
  toothDetails,
  onClickTooth,
}: DentalMapProps) => (
  <Box width="247px" height="425px" className={styles.container}>
    {UPPER_TEETH.concat(
      LOWER_TEETH.map((tooth) => ({ ...tooth, top: tooth.top + ARCH_GAP }))
    ).map(({ id, left, top }) => (
      <ToothButton
        key={id}
        id={id}
        left={`${left}px`}
        top={`${top}px`}
        toothDetails={toothDetails?.[id]}
        onClickTooth={onClickTooth}
        isSelected={selectedTooth === id}
      />
    ))}
    <Text className={styles.text} style={{ top: "137px", left: "112px" }}>
      {"upper"}
    </Text>
    <Text
      title="Right"
      className={styles.text}
      style={{ top: `${MIDLINE_TOP - 9}px` }}
    >
      {"R"}
    </Text>
    <span
      className={styles.midline}
      style={{ top: `${MIDLINE_TOP}px`, left: "20px", width: "227px" }}
      aria-hidden
    />
    <Text
      title="Left"
      className={styles.text}
      style={{ top: `${MIDLINE_TOP - 9}px`, left: "256px" }}
    >
      {"L"}
    </Text>
    <Text
      className={styles.text}
      style={{ top: `${238 + ARCH_GAP}px`, left: "112px" }}
    >
      {"lower"}
    </Text>
  </Box>
);
