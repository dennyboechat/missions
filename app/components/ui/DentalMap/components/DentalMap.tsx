// Components
import { Box, Text } from "@radix-ui/themes";
import { ToothButton } from "./ToothButton";

// Types
import { DentalMapProps } from "../types/DentalMapProps";
import { Tooth } from "../../../DentalAppointmentToothDetails/types/DentalAppointmentToothDetailsProps";

// Styles
import styles from "../styles/DentalMap.module.css";

export const DentalMap = ({
  selectedTooth,
  toothDetails,
  onClickTooth,
}: DentalMapProps) => (
  <Box width="247px" height="380px" className={styles.container}>
    <ToothButton
      id="1"
      left="10px"
      top="150px"
      toothDetails={toothDetails?.["1"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "1"}
    />
    <ToothButton
      id="2"
      left="10px"
      top="125px"
      toothDetails={toothDetails?.["2"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "2"}
    />
    <ToothButton
      id="3"
      left="10px"
      top="100px"
      toothDetails={toothDetails?.["3"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "3"}
    />
    <ToothButton
      id="4"
      left="10px"
      top="75px"
      toothDetails={toothDetails?.["4"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "4"}
    />
    <ToothButton
      id="5"
      left="15px"
      top="50px"
      toothDetails={toothDetails?.["5"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "5"}
    />
    <ToothButton
      id="6"
      left="34px"
      top="26px"
      toothDetails={toothDetails?.["6"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "6"}
    />
    <ToothButton
      id="7"
      left="63px"
      top="10px"
      toothDetails={toothDetails?.["7"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "7"}
    />
    <ToothButton
      id="8"
      left="94px"
      top="0"
      toothDetails={toothDetails?.["8"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "8"}
    />
    <ToothButton
      id="9"
      left="126px"
      top="0"
      toothDetails={toothDetails?.["9"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "9"}
    />
    <ToothButton
      id="10"
      left="157px"
      top="10px"
      toothDetails={toothDetails?.["10"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "10"}
    />
    <ToothButton
      id="11"
      left="186px"
      top="26px"
      toothDetails={toothDetails?.["11"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "11"}
    />
    <ToothButton
      id="12"
      left="205px"
      top="50px"
      toothDetails={toothDetails?.["12"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "12"}
    />
    <ToothButton
      id="13"
      left="210px"
      top="75px"
      toothDetails={toothDetails?.["13"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "13"}
    />
    <ToothButton
      id="14"
      left="210px"
      top="100px"
      toothDetails={toothDetails?.["14"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "14"}
    />
    <ToothButton
      id="15"
      left="210px"
      top="125px"
      toothDetails={toothDetails?.["15"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "15"}
    />
    <ToothButton
      id="16"
      left="210px"
      top="150px"
      toothDetails={toothDetails?.["16"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "16"}
    />
    <Text className={styles.text} style={{ top: "100px", left: "104px" }}>
      {"upper"}
    </Text>
    <Text className={styles.text} style={{ top: "175px" }}>
      {"R"}
    </Text>
    <Text className={styles.text} style={{ top: "170px", left: "20px" }}>
      {"_________________________"}
    </Text>
    <Text className={styles.text} style={{ top: "175px", left: "238px" }}>
      {"L"}
    </Text>
    <Text className={styles.text} style={{ top: "255px", left: "105px" }}>
      {"lower"}
    </Text>
    <ToothButton
      id="32"
      left="10px"
      top="205px"
      toothDetails={toothDetails?.["32"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "32"}
    />
    <ToothButton
      id="31"
      left="10px"
      top="230px"
      toothDetails={toothDetails?.["31"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "31"}
    />
    <ToothButton
      id="30"
      left="10px"
      top="255px"
      toothDetails={toothDetails?.["30"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "30"}
    />
    <ToothButton
      id="29"
      left="10px"
      top="280px"
      toothDetails={toothDetails?.["29"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "29"}
    />
    <ToothButton
      id="28"
      left="15px"
      top="305px"
      toothDetails={toothDetails?.["28"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "28"}
    />
    <ToothButton
      id="27"
      left="34px"
      top="329px"
      toothDetails={toothDetails?.["27"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "27"}
    />
    <ToothButton
      id="26"
      left="63px"
      top="345px"
      toothDetails={toothDetails?.["26"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "26"}
    />
    <ToothButton
      id="25"
      left="94px"
      top="355px"
      toothDetails={toothDetails?.["25"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "25"}
    />
    <ToothButton
      id="24"
      left="126px"
      top="355px"
      toothDetails={toothDetails?.["24"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "24"}
    />
    <ToothButton
      id="23"
      left="157px"
      top="345px"
      toothDetails={toothDetails?.["23"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "23"}
    />
    <ToothButton
      id="22"
      left="186px"
      top="329px"
      toothDetails={toothDetails?.["22"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "22"}
    />
    <ToothButton
      id="21"
      left="205px"
      top="305px"
      toothDetails={toothDetails?.["21"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "21"}
    />
    <ToothButton
      id="20"
      left="210px"
      top="280px"
      toothDetails={toothDetails?.["20"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "20"}
    />
    <ToothButton
      id="19"
      left="210px"
      top="255px"
      toothDetails={toothDetails?.["19"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "19"}
    />
    <ToothButton
      id="18"
      left="210px"
      top="230px"
      toothDetails={toothDetails?.["18"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "18"}
    />
    <ToothButton
      id="17"
      left="210px"
      top="205px"
      toothDetails={toothDetails?.["17"]}
      onClickTooth={(id: Tooth) => onClickTooth(id)}
      isSelected={selectedTooth === "17"}
    />
  </Box>
);
