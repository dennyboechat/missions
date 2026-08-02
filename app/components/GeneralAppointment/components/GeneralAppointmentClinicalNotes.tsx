"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { GeneralAppointmentClinicalNotesProps } from "../types/GeneralAppointmentClinicalNotesProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { useEffect } from "react";
import { useSaveField } from "../../../lib/useSaveField";
import { useLiveValue } from "../../../lib/useLiveValue";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils


export const GeneralAppointmentClinicalNotes = ({
  patientGeneral,
  setPatientGeneral,
}: GeneralAppointmentClinicalNotesProps) => {
  const { save } = useSaveField();
  const { patientGeneralId, appointmentNotes } = patientGeneral;
  const [notes, setNotes] = useLiveValue(appointmentNotes);

  useEffect(() => {
    const onChangeAppointmentNotes = async () => {
      if (appointmentNotes !== notes) {
        const updatedPatientGeneral = await save(
          () => updatePatientGeneral({ patientGeneralId, field: "appointment_notes", value: notes, })
        );

        if (updatedPatientGeneral) {
            setPatientGeneral((prevState: PatientGeneralTypes[] | undefined) =>
              prevState?.map((existingPatientGeneral) =>
                existingPatientGeneral.patientGeneralId === patientGeneralId
                  ? { ...existingPatientGeneral, appointmentNotes: notes }
                  : existingPatientGeneral
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
    patientGeneralId,
    setPatientGeneral,
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
