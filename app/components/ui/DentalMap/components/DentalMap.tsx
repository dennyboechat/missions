"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { ToothButton } from "./ToothButton";

// Types
import { DentalMapProps } from "../types/DentalMapProps";
import { Tooth } from "../../../../types/Tooth";

// Styles
import styles from "../styles/DentalMap.module.css";

const toothButtonData = [
  { id: "1" as Tooth, left: "19px", top: "165px" },
  { id: "2" as Tooth, left: "19px", top: "137px" },
  { id: "3" as Tooth, left: "19px", top: "109px" },
  { id: "4" as Tooth, left: "19px", top: "81px" },
  { id: "5" as Tooth, left: "24px", top: "53px" },
  { id: "6" as Tooth, left: "42px", top: "26px" },
  { id: "7" as Tooth, left: "72px", top: "10px" },
  { id: "8" as Tooth, left: "103px", top: "0" },
  { id: "9" as Tooth, left: "135px", top: "0" },
  { id: "10" as Tooth, left: "166px", top: "10px" },
  { id: "11" as Tooth, left: "196px", top: "26px" },
  { id: "12" as Tooth, left: "214px", top: "53px" },
  { id: "13" as Tooth, left: "219px", top: "81px" },
  { id: "14" as Tooth, left: "219px", top: "109px" },
  { id: "15" as Tooth, left: "219px", top: "137px" },
  { id: "16" as Tooth, left: "219px", top: "165px" },
  { id: "17" as Tooth, left: "219px", top: "210px" },
  { id: "18" as Tooth, left: "219px", top: "238px" },
  { id: "19" as Tooth, left: "219px", top: "266px" },
  { id: "20" as Tooth, left: "219px", top: "294px" },
  { id: "21" as Tooth, left: "214px", top: "322px" },
  { id: "22" as Tooth, left: "195px", top: "349px" },
  { id: "23" as Tooth, left: "166px", top: "368px" },
  { id: "24" as Tooth, left: "135px", top: "381px" },
  { id: "25" as Tooth, left: "103px", top: "381px" },
  { id: "26" as Tooth, left: "72px", top: "368px" },
  { id: "27" as Tooth, left: "43px", top: "349px" },
  { id: "28" as Tooth, left: "24px", top: "322px" },
  { id: "29" as Tooth, left: "19px", top: "294px" },
  { id: "30" as Tooth, left: "19px", top: "266px" },
  { id: "31" as Tooth, left: "19px", top: "238px" },
  { id: "32" as Tooth, left: "19px", top: "210px" },
];

export const DentalMap = ({
  selectedTooth,
  toothDetails,
  onClickTooth,
}: DentalMapProps) => (
  <Box width="247px" height="415px" className={styles.container}>
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
    <Text className={styles.text} style={{ top: "137px", left: "112px" }}>
      {"upper"}
    </Text>
    <Text title="Right" className={styles.text} style={{ top: "187px" }}>
      {"R"}
    </Text>
    <Text className={styles.text} style={{ top: "180px", left: "20px" }}>
      {"_________________________"}
    </Text>
    <Text title="Left" className={styles.text} style={{ top: "187px", left: "256px" }}>
      {"L"}
    </Text>
    <Text className={styles.text} style={{ top: "238px", left: "112px" }}>
      {"lower"}
    </Text>
  </Box>
);
