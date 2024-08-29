"use client";

// Components
import { Tabs, Box, Text, Grid, Button, Popover } from "@radix-ui/themes";
import { Space } from "../../ui/Space";
import { PopupConfirmation } from "../../ui/PopupConfirmation";
import { DentalAppointmentMap } from "../../DentalAppointmentMap";
import { DentalAppointmentClinicalNotes } from "./DentalAppointmentClinicalNotes";
import { DentalAppointmentMedicationPrescribed } from "./DentalAppointmentMedicationPrescribed";

// Types
import { DentalAppointmentContentProps } from "../types/DentalAppointmentContentProps";

// Hooks
import { useState } from "react";

// Database
import { deletePatientDentistry } from "../../../database/patient-dentistry/DeletePatientDentistry";

export const DentalAppointmentContent = ({
  patientDentistry,
  setPatientDentistries,
  afterDeleteAppointment,
}: DentalAppointmentContentProps) => {
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const { patientDentistryId } = patientDentistry;

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

  return (
    <Tabs.Content key={patientDentistryId} value={patientDentistryId}>
      <Space height={50} />
      <DentalAppointmentMap patientDentistryId={patientDentistryId} />
      <Space height={50} />
      <DentalAppointmentMedicationPrescribed
        patientDentistryId={patientDentistryId}
      />
      <Space height={50} />
      <DentalAppointmentClinicalNotes
        patientDentistry={patientDentistry}
        setPatientDentistries={setPatientDentistries}
      />
      <Space height={50} />
      <Grid width={{ initial: "auto", sm: "220px" }}>
        <PopupConfirmation content={deleteAppointmentPopupConfirmation}>
          <Button color="red" variant="outline">
            {"Delete appointment notes"}
          </Button>
        </PopupConfirmation>
      </Grid>
    </Tabs.Content>
  );
};
