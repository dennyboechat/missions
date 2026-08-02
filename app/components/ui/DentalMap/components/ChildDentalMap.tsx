"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { ToothButton } from "../../ToothButton";

// Types
import { ChildDentalMapProps } from "../types/ChildDentalMapProps";
import { Tooth } from "../../../../types/Tooth";

// Styles
import styles from "../styles/DentalMap.module.css";

/** Same separation between the arches as the adult map. See DentalMap. */
const ARCH_GAP = 16;

const UPPER_TEETH = [
  { id: "A" as Tooth, left: 19, top: 85 },
  { id: "B" as Tooth, left: 24, top: 57 },
  { id: "C" as Tooth, left: 43, top: 30 },
  { id: "D" as Tooth, left: 72, top: 12 },
  { id: "E" as Tooth, left: 103, top: 0 },
  { id: "F" as Tooth, left: 135, top: 0 },
  { id: "G" as Tooth, left: 166, top: 12 },
  { id: "H" as Tooth, left: 195, top: 30 },
  { id: "I" as Tooth, left: 214, top: 57 },
  { id: "J" as Tooth, left: 219, top: 85 },
];

const LOWER_TEETH = [
  { id: "K" as Tooth, left: 219, top: 130 },
  { id: "L" as Tooth, left: 214, top: 158 },
  { id: "M" as Tooth, left: 195, top: 185 },
  { id: "N" as Tooth, left: 166, top: 204 },
  { id: "O" as Tooth, left: 135, top: 216 },
  { id: "P" as Tooth, left: 103, top: 216 },
  { id: "Q" as Tooth, left: 72, top: 204 },
  { id: "R" as Tooth, left: 43, top: 185 },
  { id: "S" as Tooth, left: 24, top: 158 },
  { id: "T" as Tooth, left: 19, top: 130 },
];

const MIDLINE_TOP = 129;

export const ChildDentalMap = ({
  selectedTooth,
  toothDetails,
  onClickTooth,
}: ChildDentalMapProps) => (
  <Box width="247px" height="262px" className={styles.container}>
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
    <Text className={styles.text} style={{ top: "57px", left: "112px" }}>
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
      style={{ top: `${158 + ARCH_GAP}px`, left: "112px" }}
    >
      {"lower"}
    </Text>
  </Box>
);
