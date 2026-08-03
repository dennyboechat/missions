"use client";

// Multivariate Dependencies
import { useState, useEffect } from "react";

// Components
import { Text } from "@radix-ui/themes";
import { ToothButton } from "../../ui/ToothButton";
import { SummarySection } from "./SummarySection";
import { SummaryMedication } from "./SummaryMedication";

// Styles
import styles from "../styles/PatientSummary.module.css";

// Databases
import { getPatientDentalSummary } from "../../../database/patient-summary/GetPatientDentalSummary";

// Types
import { PatientDentalSummary } from "../../../types/PatientDentalSummary";
import { ToothStatus } from "../../../types/ToothStatus";
import { Tooth } from "../../../types/Tooth";
import { PatientPersonalId } from "../../../types/PatientPersonalTypes";

// Utils
import { getDentalAppointmentsSummary } from "../utils/getDentalAppointmentsSummary";

// Types
import { actionData } from "../../../types/ActionResult";

// Hooks
import { useProjectFormats } from "../../../lib/useProjectFormats";

/**
 * Teeth in one state, as the same squares the odontogram uses -- green
 * treated, clay extracted -- so the summary and the map read alike.
 */
const Teeth = ({
  label,
  teeth,
  toothStatus,
}: {
  label: string;
  teeth: (Tooth | undefined)[];
  toothStatus: ToothStatus;
}) => {
  const recorded = teeth.filter((tooth): tooth is Tooth => Boolean(tooth));

  return (
    <div className={styles.field}>
      <Text className={styles.field_label}>{label}</Text>
      {recorded.length > 0 ? (
        <div className={styles.teeth}>
          {recorded.map((tooth) => (
            <ToothButton
              key={tooth}
              id={tooth}
              toothDetails={{ toothStatus }}
              ignoreAbsolutePosition
            />
          ))}
        </div>
      ) : (
        <Text className={styles.empty}>{"None"}</Text>
      )}
    </div>
  );
};

export const DentistrySummary = ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}) => {
  const { formatDate } = useProjectFormats();
  const [patientDentalSummary, setPatientDentalSummary] =
    useState<PatientDentalSummary[]>();

  useEffect(() => {
    const fetchProject = async () => {
      if (patientPersonalId) {
        const patientDentalSummaryData = actionData(
          await getPatientDentalSummary({ patientPersonalId }),
        );

        setPatientDentalSummary(patientDentalSummaryData);
      }
    };

    fetchProject();
  }, [patientPersonalId]);

  const dentalAppointments = getDentalAppointmentsSummary({
    patientDentalSummary,
  });

  return (
    <SummarySection
      icon="dental"
      title="Dental"
      count={dentalAppointments.length}
      noun="appointment"
      href={`/patient-dentistry/${patientPersonalId}`}
      sunken
    >
      {dentalAppointments.length === 0 ? (
        <Text className={styles.empty}>{"No appointment"}</Text>
      ) : (
        dentalAppointments.map(
          ({
            patientDentistryId,
            appointmentDate,
            appointmentHasReferral,
            appointmentReferral,
            treatedTeeth,
            extractedTeeth,
            prescribedMedication,
          }) => (
            <article key={patientDentistryId} className={styles.appointment}>
              <Text className={styles.appointment_date}>
                {formatDate(appointmentDate)}
              </Text>

              <Teeth
                label="Teeth treated"
                teeth={treatedTeeth}
                toothStatus={ToothStatus.TREATED}
              />
              <Teeth
                label="Teeth extracted"
                teeth={extractedTeeth}
                toothStatus={ToothStatus.EXTRACTED}
              />

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
