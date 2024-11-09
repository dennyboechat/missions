"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { DentalAppointmentReferralProps } from "../types/DentalAppointmentReferralProps";
import { PatientDentistryTypes } from "@/app/types/PatientDentistryTypes";

// Hooks
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Database
import { updatePatientDentistry } from "../../../database/patient-dentistry/UpdatePatientDentistry";

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

export const DentalAppointmentReferral = ({
  patientDentistry,
  setPatientDentistries,
}: DentalAppointmentReferralProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [referral, setReferral] = useState(
    patientDentistry.appointmentReferral
  );
  const { patientDentistryId, appointmentReferral } = patientDentistry;

  useEffect(() => {
    const onChangeAppointmentReferral = async () => {
      if (appointmentReferral !== referral) {
        const codeToRun = async () => {
          const updatedPatientDentistry = await updatePatientDentistry({
            patientDentistryId,
            field: "appointment_referral",
            value: referral,
          });

          if (updatedPatientDentistry) {
            setPatientDentistries(
              (prevState: PatientDentistryTypes[] | undefined) =>
                prevState?.map((existingPatientDentistry) =>
                  existingPatientDentistry.patientDentistryId ===
                  patientDentistryId
                    ? {
                        ...existingPatientDentistry,
                        appointmentReferral: referral,
                      }
                    : existingPatientDentistry
                )
            );

            if (setMessage && setMessageType) {
              setMessage("Saved");
              setMessageType("regular");
            }
          } else {
            if (setMessage && setMessageType) {
              setMessage("Error to save referral. Please try again.");
              setMessageType("error");
            }

            console.error(
              `Could not update appointment referral by id ${patientDentistryId}`
            );
          }
        };

        const runSuccess = await runWithRetries(codeToRun);
        if (!runSuccess && setMessage && setMessageType) {
          setMessage("Error to save referral. Please try again.");
          setMessageType("error");
        }
      }
    };

    const updateData = setTimeout(() => {
      onChangeAppointmentReferral();
    }, 1000);

    return () => clearTimeout(updateData);
  }, [
    referral,
    appointmentReferral,
    patientDentistryId,
    setPatientDentistries,
    setMessage,
    setMessageType,
  ]);

  return (
    <TextAreaField
      label="Referral"
      value={referral}
      onChange={(e) => setReferral(e.target.value)}
    />
  );
};
