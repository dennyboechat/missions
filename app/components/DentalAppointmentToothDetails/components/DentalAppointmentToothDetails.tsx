"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { TextAreaField } from "../../ui/TextAreaField";
import { Space } from "../../ui/Space";
import { DentalAppointmentToothStatus } from "../../DentalAppointmentToothStatus";

// Types
import { DentalAppointmentToothDetailsProps } from "../types/DentalAppointmentToothDetailsProps";

// Database
import { insertPatientTooth } from "../../../database/patient-tooth/InsertPatientTooth";
import { updatePatientTooth } from "../../../database/patient-tooth/UpdatePatientTooth";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";

export const DentalAppointmentToothDetails = ({
  patientDentistryId,
  selectedTooth,
  toothDetails,
  setToothDetails,
}: DentalAppointmentToothDetailsProps) => {
  const { setMessage } = usePopupMessage();

  const onNoteChanged = async ({
    value,
    patientDentistryToothId,
  }: {
    value: string;
    patientDentistryToothId?: string;
  }) => {
    if (patientDentistryToothId) {
      await updatePatientTooth({
        patientDentistryToothId,
        field: "tooth_notes",
        value,
      });
    } else {
      const insertedPatientTooth = await insertPatientTooth({
        patientDentistryId,
        toothName: selectedTooth,
        toothNotes: value,
      });

      if (insertedPatientTooth) {
        patientDentistryToothId = insertedPatientTooth.patientDentistryToothId;
      } else if (setMessage) {
        setMessage("Error to insert patient tooth data");
      }
    }

    setToothDetails((prevToothDetails: any) => ({
      ...prevToothDetails,
      [selectedTooth]: {
        ...prevToothDetails?.[selectedTooth],
        patientDentistryToothId,
      },
    }));

    if (setMessage) {
      setMessage("Saved");
    }
  };

  return (
    <Box>
      <Text color="blue">{`Tooth ${selectedTooth}`}</Text>
      <Space />
      <Text>{"Tooth status"}</Text>
      <DentalAppointmentToothStatus
        patientDentistryId={patientDentistryId}
        selectedTooth={selectedTooth}
        toothDetails={toothDetails}
        setToothDetails={setToothDetails}
      />
      <Space />
      <TextAreaField
        label="Tooth notes"
        value={toothDetails?.[selectedTooth]?.toothNotes ?? ""}
        onChange={(e) => {
          setToothDetails((prevToothDetails: any) => ({
            ...prevToothDetails,
            [selectedTooth]: {
              ...prevToothDetails?.[selectedTooth],
              toothNotes: e.target.value,
            },
          }));
        }}
        onBlur={(e) => {
          onNoteChanged({
            value: e.target.value,
            patientDentistryToothId:
              toothDetails?.[selectedTooth]?.patientDentistryToothId,
          });
        }}
        size="1"
      />
    </Box>
  );
};
