"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { DentalAppointmentClinicalNotesProps } from "../types/DentalAppointmentClinicalNotesProps";
import { PatientDentistryTypes } from "@/app/types/PatientDentistryTypes";

// Hooks
import { useEffect } from "react";
import { useSaveField } from "../../../lib/useSaveField";
import { useLiveValue } from "../../../lib/useLiveValue";

// Database
import { updatePatientDentistry } from "../../../database/patient-dentistry/UpdatePatientDentistry";

// Utils


export const DentalAppointmentClinicalNotes = ({
  patientDentistry,
  setPatientDentistries,
}: DentalAppointmentClinicalNotesProps) => {
  const { save } = useSaveField();
  const { patientDentistryId, appointmentNotes } = patientDentistry;
  const [notes, setNotes] = useLiveValue(appointmentNotes);

  useEffect(() => {
    const onChangeAppointmentNotes = async () => {
      if (appointmentNotes !== notes) {
        const updatedPatientDentistry = await save(
          () => updatePatientDentistry({ patientDentistryId, field: "appointment_notes", value: notes, })
        );

        if (updatedPatientDentistry) {
            setPatientDentistries(
              (prevState: PatientDentistryTypes[] | undefined) =>
                prevState?.map((existingPatientDentistry) =>
                  existingPatientDentistry.patientDentistryId ===
                  patientDentistryId
                    ? { ...existingPatientDentistry, appointmentNotes: notes }
                    : existingPatientDentistry
                )
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
    save,
  ]);

  return (
    <TextAreaField
      label="Clinical notes"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  );
};
