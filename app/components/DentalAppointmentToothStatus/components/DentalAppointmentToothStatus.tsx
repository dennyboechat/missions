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

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

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
      const codeToRun = async () => {
        const updatedPatientTooth = await updatePatientTooth({
          patientDentistryToothId,
          field: "tooth_status",
          value: newStatus,
        });

        if (setMessage && setMessageType) {
          if (updatedPatientTooth) {
            setMessage("Saved");
            setMessageType("regular");
          } else {
            setMessage("Error to save. Please try again.");
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
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
        setMessageType("error");
      }
    } else {
      const codeToRun = async () => {
        const insertedPatientTooth = await insertPatientTooth({
          patientDentistryId,
          toothName: selectedTooth,
          toothStatus: status,
        });

        if (insertedPatientTooth) {
          patientDentistryToothId =
            insertedPatientTooth.patientDentistryToothId;
        } else if (setMessage && setMessageType) {
          setMessage("Error to insert patient tooth data");
          setMessageType("error");
        }

        setToothDetails((prevToothDetails: any) => ({
          ...prevToothDetails,
          [selectedTooth]: {
            ...prevToothDetails?.[selectedTooth],
            toothStatus: newStatus,
            patientDentistryToothId,
          },
        }));
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
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
