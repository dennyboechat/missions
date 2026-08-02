"use client";

// Components
import { Tabs, Text } from "@radix-ui/themes";
import { TabNavigator } from "../../ui/TabNavigator";
import { GeneralAppointmentList } from "./GeneralAppointmentList";
import { GeneralAppointmentContent } from "./GeneralAppointmentContent";

// Types
import { GeneralAppointmentProps } from "../types/GeneralAppointmentProps";
import { ReactElement } from "react";

// Styles
import styles from "../styles/GeneralAppointment.module.css";

// Hooks
import { useState, useEffect } from "react";

export const GeneralAppointment = ({
  patientGeneral,
  setPatientGeneral,
  defaultActiveTab,
  afterDeleteAppointment,
}: GeneralAppointmentProps) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  useEffect(() => {
    setActiveTab(defaultActiveTab);
  }, [defaultActiveTab]);

  const tabList: ReactElement[] = [];
  const tabContent: ReactElement[] = [];

  patientGeneral.map((patientGeneral) => {
    const { patientGeneralId } = patientGeneral;

    tabList.push(
      <GeneralAppointmentList
        key={patientGeneralId}
        patientGeneral={patientGeneral}
      />
    );

    tabContent.push(
      <GeneralAppointmentContent
        key={patientGeneralId}
        patientGeneral={patientGeneral}
        setPatientGeneral={setPatientGeneral}
        afterDeleteAppointment={afterDeleteAppointment}
      />
    );
  });

  return (
    <>
      <Text className={styles.section_title}>{"Existing appointments"}</Text>
      <TabNavigator activeTab={activeTab} setActiveTab={setActiveTab}>
        <Tabs.List>{tabList}</Tabs.List>
        {tabContent}
      </TabNavigator>
    </>
  );
};
