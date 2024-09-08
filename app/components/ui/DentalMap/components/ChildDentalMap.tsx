"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { ToothButton } from "../../ToothButton";

// Types
import { ChildDentalMapProps } from "../types/ChildDentalMapProps";
import { Tooth } from "../../../../types/Tooth";

// Styles
import styles from "../styles/DentalMap.module.css";

const toothButtonData = [
  { id: "A" as Tooth, left: "19px", top: "85px" },
  { id: "B" as Tooth, left: "24px", top: "57px" },
  { id: "C" as Tooth, left: "43px", top: "30px" },
  { id: "D" as Tooth, left: "72px", top: "12px" },
  { id: "E" as Tooth, left: "103px", top: "0px" },
  { id: "F" as Tooth, left: "135px", top: "0px" },
  { id: "G" as Tooth, left: "166px", top: "12px" },
  { id: "H" as Tooth, left: "195px", top: "30px" },
  { id: "I" as Tooth, left: "214px", top: "57px" },
  { id: "J" as Tooth, left: "219px", top: "85px" },
  { id: "K" as Tooth, left: "219px", top: "130px" },
  { id: "L" as Tooth, left: "214px", top: "158px" },
  { id: "M" as Tooth, left: "195px", top: "185px" },
  { id: "N" as Tooth, left: "166px", top: "204px" },
  { id: "O" as Tooth, left: "135px", top: "216px" },
  { id: "P" as Tooth, left: "103px", top: "216px" },
  { id: "Q" as Tooth, left: "72px", top: "204px" },
  { id: "R" as Tooth, left: "43px", top: "185px" },
  { id: "S" as Tooth, left: "24px", top: "158px" },
  { id: "T" as Tooth, left: "19px", top: "130px" },
];

export const ChildDentalMap = ({
  selectedTooth,
  toothDetails,
  onClickTooth,
}: ChildDentalMapProps) => (
  <Box width="247px" height="255px" className={styles.container}>
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
    <Text className={styles.text} style={{ top: "57px", left: "112px" }}>
      {"upper"}
    </Text>
    <Text title="Right" className={styles.text} style={{ top: "107px" }}>
      {"R"}
    </Text>
    <Text className={styles.text} style={{ top: "100px", left: "20px" }}>
      {"_________________________"}
    </Text>
    <Text className={styles.text} style={{ top: "107px", left: "256px" }}>
      {"L"}
    </Text>
    <Text className={styles.text} style={{ top: "158px", left: "112px" }}>
      {"lower"}
    </Text>
  </Box>
);
