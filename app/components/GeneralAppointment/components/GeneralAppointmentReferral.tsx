"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";
import { Checkbox, Text } from "@radix-ui/themes";

// Types
import { GeneralAppointmentReferralProps } from "../types/GeneralAppointmentReferralProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { useEffect } from "react";
import { useSaveField } from "../../../lib/useSaveField";
import { useLiveValue } from "../../../lib/useLiveValue";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils

// Styles
import styles from "../styles/GeneralAppointmentReferral.module.css";


export const GeneralAppointmentReferral = ({
  patientGeneral,
  setPatientGeneral,
}: GeneralAppointmentReferralProps) => {
  const { save } = useSaveField();
  const { patientGeneralId, appointmentReferral, appointmentHasReferral } = patientGeneral;
  const [hasReferral, setHasReferral] = useLiveValue(appointmentHasReferral);
  const [referral, setReferral] = useLiveValue(appointmentReferral);

  useEffect(() => {
    const onChangeAppointmentReferral = async () => {
      if (appointmentReferral !== referral) {
        const updatedPatientGeneral = await save(
          () => updatePatientGeneral({ patientGeneralId, field: "appointment_referral", value: referral, }),
          { failureMessages: { error: "Error to save referral. Please try again." } }
        );

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
        }
      }

      if (appointmentHasReferral !== hasReferral) {
        const updatedPatientGeneral = await save(
          () => updatePatientGeneral({ patientGeneralId, field: "appointment_has_referral", value: hasReferral, }),
          { failureMessages: { error: "Error to save has referral. Please try again." } }
        );

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
    save,
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
