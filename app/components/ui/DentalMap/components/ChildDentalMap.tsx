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
  { id: "A" as Tooth, left: "10px", top: "165px" },
  { id: "B" as Tooth, left: "15px", top: "137px" },
  { id: "C" as Tooth, left: "34px", top: "110px" },
  { id: "D" as Tooth, left: "63px", top: "92px" },
  { id: "E" as Tooth, left: "94px", top: "80px" },
  { id: "F" as Tooth, left: "126px", top: "80px" },
  { id: "G" as Tooth, left: "157px", top: "92px" },
  { id: "H" as Tooth, left: "186px", top: "110px" },
  { id: "I" as Tooth, left: "205px", top: "137px" },
  { id: "J" as Tooth, left: "210px", top: "165px" },
  { id: "K" as Tooth, left: "210px", top: "210px" },
  { id: "L" as Tooth, left: "205px", top: "238px" },
  { id: "M" as Tooth, left: "186px", top: "265px" },
  { id: "N" as Tooth, left: "157px", top: "284px" },
  { id: "O" as Tooth, left: "126px", top: "296px" },
  { id: "P" as Tooth, left: "94px", top: "296px" },
  { id: "Q" as Tooth, left: "63px", top: "284px" },
  { id: "R" as Tooth, left: "34px", top: "265px" },
  { id: "S" as Tooth, left: "15px", top: "238px" },
  { id: "T" as Tooth, left: "10px", top: "210px" },
];

export const ChildDentalMap = ({
  selectedTooth,
  toothDetails,
  onClickTooth,
}: ChildDentalMapProps) => (
  <Box width="247px" height="260px" className={styles.container}>
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
    <Text className={styles.text} style={{ top: "187px" }}>
      {"R"}
    </Text>
    <Text className={styles.text} style={{ top: "180px", left: "20px" }}>
      {"_______________________"}
    </Text>
    <Text className={styles.text} style={{ top: "187px", left: "238px" }}>
      {"L"}
    </Text>
    <Text className={styles.text} style={{ top: "225px", left: "105px" }}>
      {"lower"}
    </Text>
  </Box>
);
