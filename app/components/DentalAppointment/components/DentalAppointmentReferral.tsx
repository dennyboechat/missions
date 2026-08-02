"use client";

// Components
import { TextAreaField } from "../../ui/TextAreaField";
import { Checkbox, Text } from "@radix-ui/themes";

// Types
import { DentalAppointmentReferralProps } from "../types/DentalAppointmentReferralProps";
import { PatientDentistryTypes } from "@/app/types/PatientDentistryTypes";

// Hooks
import { useEffect } from "react";
import { useSaveField } from "../../../lib/useSaveField";
import { useLiveValue } from "../../../lib/useLiveValue";

// Database
import { updatePatientDentistry } from "../../../database/patient-dentistry/UpdatePatientDentistry";

// Utils

// Styles
import styles from "../styles/DentalAppointmentReferral.module.css";


export const DentalAppointmentReferral = ({
  patientDentistry,
  setPatientDentistries,
}: DentalAppointmentReferralProps) => {
  const { save } = useSaveField();
  const { patientDentistryId, appointmentReferral, appointmentHasReferral } = patientDentistry;
  const [hasReferral, setHasReferral] = useLiveValue(appointmentHasReferral);
  const [referral, setReferral] = useLiveValue(appointmentReferral);

  useEffect(() => {
    const onChangeAppointmentReferral = async () => {
      if (appointmentReferral !== referral) {
        const updatedPatientDentistry = await save(
          () => updatePatientDentistry({ patientDentistryId, field: "appointment_referral", value: referral, }),
          { failureMessages: { error: "Error to save referral. Please try again." } }
        );

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
        }
      }

      if (appointmentHasReferral !== hasReferral) {
        const updatedPatientDentistry = await save(
          () => updatePatientDentistry({ patientDentistryId, field: "appointment_has_referral", value: hasReferral, }),
          { failureMessages: { error: "Error to save has referral. Please try again." } }
        );

        if (updatedPatientDentistry) {
            setPatientDentistries(
              (prevState: PatientDentistryTypes[] | undefined) =>
                prevState?.map((existingPatientDentistry) =>
                  existingPatientDentistry.patientDentistryId ===
                  patientDentistryId
                    ? {
                        ...existingPatientDentistry,
                        appointmentHasReferral: hasReferral,
                      }
                    : existingPatientDentistry
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
    patientDentistryId,
    setPatientDentistries,
    save,
  ]);

  return (
    <>
      <div className={styles.referral_panel}>
        <Text>{'Has referral?'}</Text>
        <Checkbox checked={hasReferral} onCheckedChange={(checked) => setHasReferral(checked === true)} />
      </div>
      <TextAreaField
        label="Referral"
        value={referral}
        onChange={(e) => setReferral(e.target.value)}
        disabled={!hasReferral}
      />
    </>
  );
};
