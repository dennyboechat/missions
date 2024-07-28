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
  { id: "1" as Tooth, left: "10px", top: "160px" },
  { id: "2" as Tooth, left: "10px", top: "133px" },
  { id: "3" as Tooth, left: "10px", top: "106px" },
  { id: "4" as Tooth, left: "10px", top: "79px" },
  { id: "5" as Tooth, left: "15px", top: "52px" },
  { id: "6" as Tooth, left: "34px", top: "26px" },
  { id: "7" as Tooth, left: "63px", top: "10px" },
  { id: "8" as Tooth, left: "94px", top: "0" },
  { id: "9" as Tooth, left: "126px", top: "0" },
  { id: "10" as Tooth, left: "157px", top: "10px" },
  { id: "11" as Tooth, left: "186px", top: "26px" },
  { id: "12" as Tooth, left: "205px", top: "52px" },
  { id: "13" as Tooth, left: "210px", top: "79px" },
  { id: "14" as Tooth, left: "210px", top: "106px" },
  { id: "15" as Tooth, left: "210px", top: "133px" },
  { id: "16" as Tooth, left: "210px", top: "160px" },
  { id: "17" as Tooth, left: "210px", top: "205px" },
  { id: "18" as Tooth, left: "210px", top: "232px" },
  { id: "19" as Tooth, left: "210px", top: "259px" },
  { id: "20" as Tooth, left: "210px", top: "286px" },
  { id: "21" as Tooth, left: "205px", top: "313px" },
  { id: "22" as Tooth, left: "186px", top: "339px" },
  { id: "23" as Tooth, left: "157px", top: "357px" },
  { id: "24" as Tooth, left: "126px", top: "369px" },
  { id: "25" as Tooth, left: "94px", top: "369px" },
  { id: "26" as Tooth, left: "63px", top: "357px" },
  { id: "27" as Tooth, left: "34px", top: "339px" },
  { id: "28" as Tooth, left: "15px", top: "313px" },
  { id: "29" as Tooth, left: "10px", top: "286px" },
  { id: "30" as Tooth, left: "10px", top: "259px" },
  { id: "31" as Tooth, left: "10px", top: "232px" },
  { id: "32" as Tooth, left: "10px", top: "205px" },
];

export const DentalMap = ({
  selectedTooth,
  toothDetails,
  onClickTooth,
}: DentalMapProps) => (
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
    <Text className={styles.text} style={{ top: "100px", left: "104px" }}>
      {"upper"}
    </Text>
    <Text className={styles.text} style={{ top: "182px" }}>
      {"R"}
    </Text>
    <Text className={styles.text} style={{ top: "176px", left: "20px" }}>
      {"_______________________"}
    </Text>
    <Text className={styles.text} style={{ top: "182px", left: "238px" }}>
      {"L"}
    </Text>
    <Text className={styles.text} style={{ top: "265px", left: "105px" }}>
      {"lower"}
    </Text>
  </Box>
);
