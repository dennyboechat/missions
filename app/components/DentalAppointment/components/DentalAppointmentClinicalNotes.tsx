"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

// Hooks
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Database
import { updatePatientDentistry } from "../../../database/patient-dentistry/UpdatePatientDentistry";

export const DentalAppointmentClinicalNotes = ({
  patientDentistry,
}: {
  patientDentistry: PatientDentistryTypes;
}) => {
  const { setMessage } = usePopupMessage();
  const [notes, setNotes] = useState(patientDentistry.appointmentNotes);
  const { patientDentistryId } = patientDentistry;

  useEffect(() => {
    const onChangeAppointmentNotes = async () => {
      const updatedPatientDentistry = await updatePatientDentistry({
        patientDentistryId,
        field: "appointment_notes",
        value: notes,
      });

      if (updatedPatientDentistry && setMessage) {
        setMessage("Saved");
      } else {
        console.error(
          `Could not update appointment notes by id ${patientDentistryId}`
        );
      }
    };

    const updateData = setTimeout(() => {
      onChangeAppointmentNotes();
    }, 1000);

    return () => clearTimeout(updateData);
  }, [notes, patientDentistryId, setMessage]);

  return (
    <TextAreaField
      label="Clinical notes"
      value={notes}
      autoFocus
      onChange={(e) => setNotes(e.target.value)}
    />
  );
};
