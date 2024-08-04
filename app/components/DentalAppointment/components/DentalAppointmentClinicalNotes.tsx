"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { DentalAppointmentClinicalNotesProps } from "../types/DentalAppointmentClinicalNotesProps";
import { PatientDentistryTypes } from "@/app/types/PatientDentistryTypes";

// Hooks
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Database
import { updatePatientDentistry } from "../../../database/patient-dentistry/UpdatePatientDentistry";

export const DentalAppointmentClinicalNotes = ({
  patientDentistry,
  setPatientDentistries,
}: DentalAppointmentClinicalNotesProps) => {
  const { setMessage } = usePopupMessage();
  const [notes, setNotes] = useState(patientDentistry.appointmentNotes);
  const { patientDentistryId, appointmentNotes } = patientDentistry;

  useEffect(() => {
    const onChangeAppointmentNotes = async () => {
      if (appointmentNotes !== notes) {
        const updatedPatientDentistry = await updatePatientDentistry({
          patientDentistryId,
          field: "appointment_notes",
          value: notes,
        });

        if (updatedPatientDentistry && setMessage) {
          setPatientDentistries(
            (prevState: PatientDentistryTypes[] | undefined) =>
              prevState?.map((existingPatientDentistry) =>
                existingPatientDentistry.patientDentistryId ===
                patientDentistryId
                  ? { ...existingPatientDentistry, appointmentNotes: notes }
                  : existingPatientDentistry
              )
          );

          setMessage("Saved");
        } else {
          console.error(
            `Could not update appointment notes by id ${patientDentistryId}`
          );
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
    patientDentistryId,
    setPatientDentistries,
    setMessage,
  ]);

  return (
    <TextAreaField
      label="Clinical notes"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  );
};
