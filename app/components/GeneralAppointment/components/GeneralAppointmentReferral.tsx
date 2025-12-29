"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";
import { Checkbox, Text } from "@radix-ui/themes";

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

// Styles
import styles from "../styles/GeneralAppointmentReferral.module.css";

export const GeneralAppointmentReferral = ({
  patientGeneral,
  setPatientGeneral,
}: GeneralAppointmentReferralProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [hasReferral, setHasReferral] = useState(patientGeneral.appointmentHasReferral);
  const [referral, setReferral] = useState(patientGeneral.appointmentReferral);
  const { patientGeneralId, appointmentReferral, appointmentHasReferral } = patientGeneral;

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

      if (appointmentHasReferral !== hasReferral) {
        const codeToRun = async () => {
          const updatedPatientGeneral = await updatePatientGeneral({
            patientGeneralId,
            field: "appointment_has_referral",
            value: hasReferral,
          });

          if (updatedPatientGeneral) {
            setPatientGeneral((prevState: PatientGeneralTypes[] | undefined) =>
              prevState?.map((existingPatientGeneral) =>
                existingPatientGeneral.patientGeneralId === patientGeneralId
                  ? {
                      ...existingPatientGeneral,
                      appointmentHasReferral: hasReferral,
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
              setMessage("Error to save has referral. Please try again.");
              setMessageType("error");
            }

            console.error(
              `Could not update appointment has referral by id ${patientGeneralId}`
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
    hasReferral,
    appointmentReferral,
    appointmentHasReferral,
    patientGeneralId,
    setPatientGeneral,
    setMessage,
    setMessageType,
  ]);

  return (
    <>
      <div className={styles.referral_panel}>
        <Text>{'Has referral?'}</Text>
        <Checkbox checked={hasReferral} onCheckedChange={(checked) => setHasReferral(checked === true)} />
      </div>
      <TextAreaField
        label="Referral details"
        value={referral}
        onChange={(e) => setReferral(e.target.value)}
        disabled={!hasReferral}
      />
    </>
  );
};
