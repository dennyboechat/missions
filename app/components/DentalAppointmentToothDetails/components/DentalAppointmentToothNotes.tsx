"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { DentalAppointmentToothNotesProps } from "../types/DentalAppointmentToothNotesProps";
import { DentalAppointmentToothNotesPreviousState } from "../types/DentalAppointmentToothNotesPreviousState";

// Database
import { insertPatientTooth } from "../../../database/patient-tooth/InsertPatientTooth";
import { updatePatientTooth } from "../../../database/patient-tooth/UpdatePatientTooth";

// Hooks
import { useEffect, useRef } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

export const DentalAppointmentToothNotes = ({
  patientDentistryId,
  selectedTooth,
  patientDentistryToothId,
  notes,
  setToothDetails,
}: DentalAppointmentToothNotesProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const previousRef = useRef<DentalAppointmentToothNotesPreviousState>({
    patientDentistryToothId: undefined,
    selectedTooth: undefined,
    notes: undefined,
  });

  useEffect(() => {
    const onNoteChanged = async () => {
      if (selectedTooth !== previousRef.current.selectedTooth) {
        previousRef.current = { patientDentistryToothId, selectedTooth, notes };
        return;
      }

      previousRef.current = { patientDentistryToothId, selectedTooth, notes };

      if (patientDentistryToothId) {
        const codeToRun = async () => {
          const updatedPatientTooth = await updatePatientTooth({
            patientDentistryToothId,
            field: "tooth_notes",
            value: notes,
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
            toothNotes: notes,
          });

          if (setMessage && setMessageType) {
            if (insertedPatientTooth) {
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
              patientDentistryToothId:
                insertedPatientTooth?.patientDentistryToothId,
            },
          }));
        };

        const runSuccess = await runWithRetries(codeToRun);
        if (!runSuccess && setMessage && setMessageType) {
          setMessage("Error to save. Please try again.");
          setMessageType("error");
        }
      }
    };

    const updateData = setTimeout(() => {
      onNoteChanged();
    }, 1000);

    return () => clearTimeout(updateData);
  }, [
    patientDentistryToothId,
    notes,
    patientDentistryId,
    selectedTooth,
    setMessage,
    setToothDetails,
    setMessageType,
  ]);

  return (
    <TextAreaField
      label="Tooth notes"
      value={notes ?? ""}
      onChange={(e) => {
        setToothDetails((prevToothDetails: any) => ({
          ...prevToothDetails,
          [selectedTooth]: {
            ...prevToothDetails?.[selectedTooth],
            toothNotes: e.target.value,
          },
        }));
      }}
    />
  );
};
