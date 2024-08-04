"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { ToothButton } from "./ToothButton";

// Types
import { ChildDentalMapProps } from "../types/ChildDentalMapProps";
import { Tooth } from "../../../../types/Tooth";

// Styles
import styles from "../styles/DentalMap.module.css";

const toothButtonData = [
  { id: "A" as Tooth, left: "10px", top: "160px" },
  { id: "B" as Tooth, left: "15px", top: "133px" },
  { id: "C" as Tooth, left: "34px", top: "106px" },
  { id: "D" as Tooth, left: "63px", top: "88px" },
  { id: "E" as Tooth, left: "94px", top: "76px" },
  { id: "F" as Tooth, left: "126px", top: "76px" },
  { id: "G" as Tooth, left: "157px", top: "88px" },
  { id: "H" as Tooth, left: "186px", top: "106px" },
  { id: "I" as Tooth, left: "205px", top: "133px" },
  { id: "J" as Tooth, left: "210px", top: "160px" },
  { id: "K" as Tooth, left: "210px", top: "205px" },
  { id: "L" as Tooth, left: "205px", top: "232px" },
  { id: "M" as Tooth, left: "186px", top: "259px" },
  { id: "N" as Tooth, left: "157px", top: "277px" },
  { id: "O" as Tooth, left: "126px", top: "289px" },
  { id: "P" as Tooth, left: "94px", top: "289px" },
  { id: "Q" as Tooth, left: "63px", top: "277px" },
  { id: "R" as Tooth, left: "34px", top: "259px" },
  { id: "S" as Tooth, left: "15px", top: "232px" },
  { id: "T" as Tooth, left: "10px", top: "205px" },
];

export const ChildDentalMap = ({
  selectedTooth,
  toothDetails,
  onClickTooth,
}: ChildDentalMapProps) => (
  <Box width="247px" height="400px" className={styles.container}>
    {toothButtonData.map(({ id, left, top }) => (
      <ToothButton
        key={id}
        id={id}
        left={left}
        top={top}
        toothDetails={toothDetails?.[id]}
        onClickTooth={onClickTooth}
        isSelected={selectedTooth === id}
      />
    ))}
    <Text className={styles.text} style={{ top: "140px", left: "104px" }}>
      {"upper"}
    </Text>
    <Text className={styles.text} style={{ top: "182px" }}>
      {"R"}
    </Text>
    <Text className={styles.text} style={{ top: "175px", left: "20px" }}>
      {"_______________________"}
    </Text>
    <Text className={styles.text} style={{ top: "182px", left: "238px" }}>
      {"L"}
    </Text>
    <Text className={styles.text} style={{ top: "225px", left: "105px" }}>
      {"lower"}
    </Text>
  </Box>
);
