"use client";

// Components
import { Tabs, Heading } from "@radix-ui/themes";
import { TabNavigator } from "../../ui/TabNavigator";
import { DentalAppointmentList } from "./DentalAppointmentList";
import { DentalAppointmentContent } from "./DentalAppointmentContent";

// Types
import { DentalAppointmentProps } from "../types/DentalAppointmentProps";
import { ReactElement } from "react";

// Hooks
import { useState, useEffect } from "react";

export const DentalAppointment = ({
  patientDentistries,
  setPatientDentistries,
  defaultActiveTab,
  afterDeleteAppointment,
}: DentalAppointmentProps) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  useEffect(() => {
    setActiveTab(defaultActiveTab);
  }, [defaultActiveTab]);

  const tabList: ReactElement[] = [];
  const tabContent: ReactElement[] = [];

  patientDentistries.map((patientDentistry) => {
    const { patientDentistryId } = patientDentistry;

    tabList.push(
      <DentalAppointmentList
        key={patientDentistryId}
        patientDentistry={patientDentistry}
      />
    );

    tabContent.push(
      <DentalAppointmentContent
        key={patientDentistryId}
        patientDentistry={patientDentistry}
        setPatientDentistries={setPatientDentistries}
        afterDeleteAppointment={afterDeleteAppointment}
      />
    );
  });

  return (
    <>
      <Heading size="3">{"Existing appointment notes"}</Heading>
      <TabNavigator activeTab={activeTab} setActiveTab={setActiveTab}>
        <Tabs.List>{tabList}</Tabs.List>
        {tabContent}
      </TabNavigator>
    </>
  );
};
