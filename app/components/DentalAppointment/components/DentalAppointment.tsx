"use client";

// Components
import {
  Tabs,
  Heading,
  Box,
  Text,
  Grid,
  Button,
  Popover,
} from "@radix-ui/themes";
import { TabNavigator } from "../../ui/TabNavigator";
import { TextAreaField } from "../../ui/TextAreaField";
import { Space } from "../../ui/Space";
import { PopupConfirmation } from "../../ui/PopupConfirmation";
import { DentalAppointmentMap } from "../../DentalAppointmentMap";

// Types
import { DentalAppointmentProps } from "../types/DentalAppointmentProps";
import type { ReactElement } from "react";

// Utils
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState, useEffect } from "react";

// Database
import { deletePatientDentistry } from "../../../database/patient-dentistry/DeletePatientDentistry";
import { updatePatientDentistry } from "../../../database/patient-dentistry/UpdatePatientDentistry";

export const DentalAppointment = ({
  patientDentistries,
  defaultActiveTab,
  afterDeleteAppointment,
}: DentalAppointmentProps) => {
  const { setMessage } = usePopupMessage();
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);

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

    const onChangeAppointmentNotes = async (value: string) => {
      if (appointmentNotes !== value) {
        const updatedPatientDentistry = await updatePatientDentistry({
          patientDentistryId,
          field: "appointment_notes",
          value,
        });

        if (updatedPatientDentistry && setMessage) {
          setMessage("Saved");
        } else {
          console.error(
            `Could not update appointment notes by id ${patientDentistryId}`
          );
        }
      }
    };

    tabList.push(
      <Tabs.Trigger key={patientDentistryId} value={patientDentistryId}>
        {formattedAppointmentDate}
      </Tabs.Trigger>
    );

    const onDeleteAppointment = async () => {
      setIsDeletingAppointment(true);

      await deletePatientDentistry({ patientDentistryId });

      if (afterDeleteAppointment) {
        afterDeleteAppointment();
      }

      setIsDeletingAppointment(false);
    };

    const deleteAppointmentPopupConfirmation = (
      <Box>
        <Text weight="bold">{"Confirm the appointment notes deletion?"}</Text>
        <Text as="p">{"This action cannot be undone."}</Text>
        <Grid columns="2" gapX="10px">
          <Button
            color="red"
            onClick={onDeleteAppointment}
            disabled={isDeletingAppointment}
            variant="outline"
          >
            {"Confirm"}
          </Button>
          <Popover.Close>
            <Button
              variant="outline"
              color="gray"
              disabled={isDeletingAppointment}
            >
              {"Cancel"}
            </Button>
          </Popover.Close>
        </Grid>
      </Box>
    );

    tabContent.push(
      <Tabs.Content key={patientDentistryId} value={patientDentistryId}>
        <Space />
        <DentalAppointmentMap patientDentistryId={patientDentistryId} />
        <Grid columns="2" gap="5">
          <TextAreaField
            label="Clinical notes"
            defaultValue={appointmentNotes}
            autoFocus
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) =>
              onChangeAppointmentNotes(e.target.value)
            }
          />
          <Text>{"Medication prescribed"}</Text>
        </Grid>
        <Grid width={{ initial: "auto", sm: "200px" }}>
          <PopupConfirmation content={deleteAppointmentPopupConfirmation}>
            <Button color="red" variant="outline">
              {"Delete appointment notes"}
            </Button>
          </PopupConfirmation>
        </Grid>
      </Tabs.Content>
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
