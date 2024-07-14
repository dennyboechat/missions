"use client";

// Components
import { Tabs, Heading } from "@radix-ui/themes";
import { TabNavigator } from "../../ui/TabNavigator";
import { TextAreaField } from "../../ui/TextAreaField";
import { Space } from "../../ui/Space";

// Types
import { DentalAppointmentProps } from "../types/DentalAppointmentProps";
import type { ReactElement } from "react";

// Utils
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState, useEffect } from "react";

export const DentalAppointment = ({
  patientDentistries,
  defaultActiveTab,
}: DentalAppointmentProps) => {
  const { setMessage } = usePopupMessage();
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  useEffect(() => {
    setActiveTab(defaultActiveTab);
  }, [defaultActiveTab]);

  const tabList: ReactElement[] = [];
  const tabContent: ReactElement[] = [];

  patientDentistries.map((patientDentistry) => {
    const { patientDentistryId, appointmentDate, appointmentNotes } =
      patientDentistry;

    const formattedAppointmentDate = getLocaleFormattedDate({
      date: appointmentDate,
    });

    const onChangeAppointmentNotes = (value: string) => {
      if (setMessage) {
        setMessage("Saved" + value);
      }
    };

    tabList.push(
      <Tabs.Trigger key={patientDentistryId} value={patientDentistryId}>
        {formattedAppointmentDate}
      </Tabs.Trigger>
    );

    tabContent.push(
      <Tabs.Content key={patientDentistryId} value={patientDentistryId}>
        <Space />
        <TextAreaField
          label="General notes"
          value={appointmentNotes}
          autoFocus
          onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) =>
            onChangeAppointmentNotes(e.target.value)
          }
        />
      </Tabs.Content>
    );
  });

  return (
    <>
      <Heading size="3">{"Existing appointments"}</Heading>
      <TabNavigator activeTab={activeTab} setActiveTab={setActiveTab}>
        <Tabs.List>{tabList}</Tabs.List>
        {tabContent}
      </TabNavigator>
    </>
  );
};
