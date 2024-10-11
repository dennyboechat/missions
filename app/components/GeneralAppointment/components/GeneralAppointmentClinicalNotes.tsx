"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { GeneralAppointmentClinicalNotesProps } from "../types/GeneralAppointmentClinicalNotesProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

export const GeneralAppointmentClinicalNotes = ({
  patientGeneral,
  setPatientGeneral,
}: GeneralAppointmentClinicalNotesProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [notes, setNotes] = useState(patientGeneral.appointmentNotes);
  const { patientGeneralId, appointmentNotes } = patientGeneral;

  useEffect(() => {
    const onChangeAppointmentNotes = async () => {
      if (appointmentNotes !== notes) {
        const codeToRun = async () => {
          const updatedPatientGeneral = await updatePatientGeneral({
            patientGeneralId,
            field: "appointment_notes",
            value: notes,
          });

          if (updatedPatientGeneral) {
            setPatientGeneral((prevState: PatientGeneralTypes[] | undefined) =>
              prevState?.map((existingPatientGeneral) =>
                existingPatientGeneral.patientGeneralId === patientGeneralId
                  ? { ...existingPatientGeneral, appointmentNotes: notes }
                  : existingPatientGeneral
              )
            );

            if (setMessage && setMessageType) {
              setMessage("Saved");
              setMessageType("regular");
            }
          } else {
            if (setMessage && setMessageType) {
              setMessage("Error to save. Please try again.");
              setMessageType("error");
            }

            console.error(
              `Could not update appointment by id ${patientGeneralId}`
            );
          }
        };

        const runSuccess = await runWithRetries(codeToRun);
        if (!runSuccess && setMessage && setMessageType) {
          setMessage("Error to save. Please try again.");
          setMessageType("error");
        }
      }
    };

    const updateData = setTimeout(() => {
      onChangeAppointmentNotes();
    }, 1000);

    return () => clearTimeout(updateData);
  }, [
    notes,
    appointmentNotes,
    patientGeneralId,
    setPatientGeneral,
    setMessage,
    setMessageType,
  ]);

  return (
    <TextAreaField
      label="Clinical notes"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  );
};
