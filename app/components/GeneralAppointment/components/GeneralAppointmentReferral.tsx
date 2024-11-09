"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";

// Types
import { GeneralAppointmentReferralProps } from "../types/GeneralAppointmentReferralProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

export const GeneralAppointmentReferral = ({
  patientGeneral,
  setPatientGeneral,
}: GeneralAppointmentReferralProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [referral, setReferral] = useState(patientGeneral.appointmentReferral);
  const { patientGeneralId, appointmentReferral } = patientGeneral;

  useEffect(() => {
    const onChangeAppointmentReferral = async () => {
      if (appointmentReferral !== referral) {
        const codeToRun = async () => {
          const updatedPatientGeneral = await updatePatientGeneral({
            patientGeneralId,
            field: "appointment_referral",
            value: referral,
          });

          if (updatedPatientGeneral) {
            setPatientGeneral((prevState: PatientGeneralTypes[] | undefined) =>
              prevState?.map((existingPatientGeneral) =>
                existingPatientGeneral.patientGeneralId === patientGeneralId
                  ? {
                      ...existingPatientGeneral,
                      appointmentReferral: referral,
                    }
                  : existingPatientGeneral
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
              `Could not update appointment referral by id ${patientGeneralId}`
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
    patientGeneralId,
    setPatientGeneral,
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
