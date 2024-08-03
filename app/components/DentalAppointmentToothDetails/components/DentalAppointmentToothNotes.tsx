"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { DentalAppointmentToothNotesProps } from "../types/DentalAppointmentToothNotesProps";

// Database
import { insertPatientTooth } from "../../../database/patient-tooth/InsertPatientTooth";
import { updatePatientTooth } from "../../../database/patient-tooth/UpdatePatientTooth";

// Hooks
import { useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

export const DentalAppointmentToothNotes = ({
  patientDentistryId,
  selectedTooth,
  toothDetails,
  setToothDetails,
}: DentalAppointmentToothNotesProps) => {
  const { setMessage } = usePopupMessage();

  useEffect(() => {
    const onNoteChanged = async () => {
      let patientDentistryToothId =
        toothDetails?.[selectedTooth]?.patientDentistryToothId;
      const value = toothDetails?.[selectedTooth]?.toothNotes;

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
          patientDentistryToothId =
            insertedPatientTooth.patientDentistryToothId;
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

    const updateData = setTimeout(() => {
      onNoteChanged();
    }, 1000);

    return () => clearTimeout(updateData);
  }, [
    toothDetails,
    patientDentistryId,
    selectedTooth,
    setMessage,
    setToothDetails,
  ]);

  return (
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
    />
  );
};
