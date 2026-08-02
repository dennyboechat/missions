"use client";

// Multivariate Dependencies
import { useState, useEffect } from "react";

// Components
import { Text } from "@radix-ui/themes";
import { SummarySection } from "./SummarySection";
import { SummaryMedication } from "./SummaryMedication";
import { GeneralSummaryDetails } from "./GeneralSummaryDetails";

// Styles
import styles from "../styles/PatientSummary.module.css";

// Databases
import { getPatientGeneralSummary } from "../../../database/patient-summary/GetPatientGeneralSummary";

// Types
import { PatientGeneralSummary } from "../../../types/PatientGeneralSummary";
import { PatientPersonalId } from "../../../types/PatientPersonalTypes";

// Utils
import { getGeneralAppointmentsSummary } from "../utils/getGeneralAppointmentsSummary";
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";

// Types
import { actionData } from "../../../types/ActionResult";

export const GeneralSummary = ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}) => {
  const [patientGeneralSummary, setPatientGeneralSummary] =
    useState<PatientGeneralSummary[]>();

  useEffect(() => {
    const fetchProject = async () => {
      if (patientPersonalId) {
        const patientGeneralSummaryData = actionData(
          await getPatientGeneralSummary({ patientPersonalId }),
        );

        setPatientGeneralSummary(patientGeneralSummaryData);
      }
    };

    fetchProject();
  }, [patientPersonalId]);

  const generalAppointments = getGeneralAppointmentsSummary({
    patientGeneralSummary,
  });

  return (
    <SummarySection
      icon="general"
      title="General"
      count={generalAppointments.length}
      noun="appointment"
      sunken
    >
      {generalAppointments.length === 0 ? (
        <Text className={styles.empty}>{"No appointment"}</Text>
      ) : (
        generalAppointments.map(
          ({
            patientGeneralId,
            appointmentDate,
            prescribedMedication,
            appointmentHasReferral,
            appointmentReferral,
            ...vitals
          }) => (
            <article key={patientGeneralId} className={styles.appointment}>
              <Text className={styles.appointment_date}>
                {getLocaleFormattedDate({ date: appointmentDate })}
              </Text>

              <GeneralSummaryDetails {...vitals} />

              {appointmentHasReferral && (
                <div className={styles.field}>
                  <Text className={styles.field_label}>{"Referral"}</Text>
                  {appointmentReferral ? (
                    <Text className={styles.notes}>{appointmentReferral}</Text>
                  ) : (
                    <Text className={styles.empty}>{"No details given"}</Text>
                  )}
                </div>
              )}

              <div className={styles.field}>
                <Text className={styles.field_label}>
                  {"Prescribed medication"}
                </Text>
                <SummaryMedication medications={prescribedMedication} />
              </div>
            </article>
          ),
        )
      )}
    </SummarySection>
  );
};
