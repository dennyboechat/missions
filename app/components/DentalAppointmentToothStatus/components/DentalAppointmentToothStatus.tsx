"use client";

// Components
import { Grid, Button, Text } from "@radix-ui/themes";

// Types
import { DentalAppointmentToothStatusProps } from "../types/DentalAppointmentToothStatusProps";
import { ToothStatus } from "../../../types/ToothStatus";

// Database
import { insertPatientTooth } from "../../../database/patient-tooth/InsertPatientTooth";
import { updatePatientTooth } from "../../../database/patient-tooth/UpdatePatientTooth";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";

export const DentalAppointmentToothStatus = ({
  patientDentistryId,
  selectedTooth,
  toothDetails,
  setToothDetails,
}: DentalAppointmentToothStatusProps) => {
  const { setMessage, setMessageType } = usePopupMessage();

  const onSelectStatus = async (status: ToothStatus) => {
    const newStatus =
      toothDetails?.[selectedTooth]?.toothStatus === status
        ? undefined
        : status;

    let patientDentistryToothId =
      toothDetails?.[selectedTooth]?.patientDentistryToothId;

    if (patientDentistryToothId) {
      await updatePatientTooth({
        patientDentistryToothId,
        field: "tooth_status",
        value: newStatus,
      });
    } else {
      const insertedPatientTooth = await insertPatientTooth({
        patientDentistryId,
        toothName: selectedTooth,
        toothStatus: status,
      });

      if (insertedPatientTooth) {
        patientDentistryToothId = insertedPatientTooth.patientDentistryToothId;
      } else if (setMessage && setMessageType) {
        setMessage("Error to insert patient tooth data");
        setMessageType("error");
      }
    }

    setToothDetails((prevToothDetails: any) => ({
      ...prevToothDetails,
      [selectedTooth]: {
        ...prevToothDetails?.[selectedTooth],
        toothStatus: newStatus,
        patientDentistryToothId,
      },
    }));

    if (setMessage && setMessageType) {
      setMessage("Saved");
      setMessageType("regular");
    }
  };

  return (
    <>
      <Text>{"Tooth status"}</Text>
      <Grid columns="2" gap="10px">
        <Button
          color="bronze"
          variant={
            toothDetails?.[selectedTooth]?.toothStatus === ToothStatus.EXTRACTED
              ? "solid"
              : "outline"
          }
          onClick={() => onSelectStatus(ToothStatus.EXTRACTED)}
        >
          {"Extracted"}
        </Button>
        <Button
          color="green"
          variant={
            toothDetails?.[selectedTooth]?.toothStatus === ToothStatus.TREATED
              ? "solid"
              : "outline"
          }
          onClick={() => onSelectStatus(ToothStatus.TREATED)}
        >
          {"Treated"}
        </Button>
      </Grid>
    </>
  );
};
