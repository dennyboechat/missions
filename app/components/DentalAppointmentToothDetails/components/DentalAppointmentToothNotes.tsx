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

export const DentalAppointmentToothNotes = ({
  patientDentistryId,
  selectedTooth,
  patientDentistryToothId,
  notes,
  setToothDetails,
}: DentalAppointmentToothNotesProps) => {
  const { setMessage } = usePopupMessage();
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
        await updatePatientTooth({
          patientDentistryToothId,
          field: "tooth_notes",
          value: notes,
        });
      } else {
        const insertedPatientTooth = await insertPatientTooth({
          patientDentistryId,
          toothName: selectedTooth,
          toothNotes: notes,
        });

        setToothDetails((prevToothDetails: any) => ({
          ...prevToothDetails,
          [selectedTooth]: {
            ...prevToothDetails?.[selectedTooth],
            patientDentistryToothId:
              insertedPatientTooth?.patientDentistryToothId,
          },
        }));
      }

      if (setMessage) {
        setMessage("Saved");
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
