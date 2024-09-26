"use client";

// Multivariate Dependencies
import { Fragment, useState, useEffect } from "react";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { ToothButton } from "../../ui/ToothButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Space } from "../../ui/Space";

// Styles
import styles from "../styles/PatientSummary.module.css";

// Databases
import { getPatientDentalSummary } from "../../../database/patient-summary/GetPatientDentalSummary";

// Types
import { PatientDentalSummary } from "../../../types/PatientDentalSummary";
import { ToothStatus } from "../../../types/ToothStatus";
import { PatientPersonalId } from "../../../types/PatientPersonalTypes";

// Icons
import { faTooth } from "@fortawesome/free-solid-svg-icons";

// Utils
import { getDentalAppointmentsSummary } from "../utils/getDentalAppointmentsSummary";
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";

export const DentistrySummary = ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}) => {
  const [patientDentalSummary, setPatientDentalSummary] =
    useState<PatientDentalSummary[]>();

  useEffect(() => {
    const fetchProject = async () => {
      if (patientPersonalId) {
        const patientDentalSummaryData = await getPatientDentalSummary({
          patientPersonalId,
        });

        setPatientDentalSummary(patientDentalSummaryData);
      }
    };

    fetchProject();
  }, [patientPersonalId]);

  const dentalAppointments = getDentalAppointmentsSummary({
    patientDentalSummary,
  });

  return (
    <>
      <div className={styles.summary_subtitle}>
        <FontAwesomeIcon icon={faTooth} />
        <Text weight="bold" size="5">
          {"Dental"}
        </Text>
      </div>
      {dentalAppointments.length === 0 && (
        <Text className={`${styles.italic} ${styles.summary_margin}`}>
          {"No appointment"}
        </Text>
      )}
      <Space height={3} />
      {dentalAppointments.map(
        ({
          patientDentistryId,
          appointmentDate,
          treatedTeeth,
          extractedTeeth,
          prescribedMedication,
        }) => (
          <Grid key={patientDentistryId} className={styles.appointments}>
            <Text weight="medium" size="3">
              {getLocaleFormattedDate({
                date: appointmentDate,
              })}
            </Text>
            <Space height={3} />
            <div className={styles.summary_margin}>
              <div>
                <Text>{"Teeth treated: "}</Text>
              </div>
              <div className={styles.summary_teeth}>
                {treatedTeeth.length > 0 ? (
                  treatedTeeth.map((tooth) =>
                    tooth ? (
                      <ToothButton
                        key={tooth}
                        id={tooth}
                        toothDetails={{ toothStatus: ToothStatus.TREATED }}
                        ignoreAbsolutePosition
                      />
                    ) : null
                  )
                ) : (
                  <Text className={styles.italic}>{"none"}</Text>
                )}
              </div>
            </div>
            <Space />
            <div className={styles.summary_margin}>
              <div>
                <Text>{"Teeth extracted: "}</Text>
              </div>
              <div className={styles.summary_teeth}>
                {extractedTeeth.length > 0 ? (
                  extractedTeeth.map((tooth) =>
                    tooth ? (
                      <ToothButton
                        key={tooth}
                        id={tooth}
                        toothDetails={{ toothStatus: ToothStatus.EXTRACTED }}
                        ignoreAbsolutePosition
                      />
                    ) : null
                  )
                ) : (
                  <Text className={styles.italic}>{"none"}</Text>
                )}
              </div>
            </div>
            <Space />
            <div className={styles.summary_margin}>
              <div>
                <Text>{"Prescribed medication by the dentist: "}</Text>
              </div>
              {prescribedMedication.length > 0 ? (
                <Grid
                  columns="30fr 10fr 10fr 50fr"
                  gap="2"
                  className={styles.summary_margin}
                >
                  <Text weight="medium">{"Drug"}</Text>
                  <Text weight="medium">{"Dose"}</Text>
                  <Text weight="medium">{"Quantity"}</Text>
                  <Text weight="medium">{"Instructions"}</Text>
                  {prescribedMedication.map(
                    ({ rowId, drug, dose, quantity, instructions }) => (
                      <Fragment key={rowId}>
                        <Text className={styles.summary_medication_item}>
                          {drug}
                        </Text>
                        <Text className={styles.summary_medication_item}>
                          {dose}
                        </Text>
                        <Text className={styles.summary_medication_item}>
                          {quantity}
                        </Text>
                        <Text className={styles.summary_medication_item}>
                          {instructions}
                        </Text>
                      </Fragment>
                    )
                  )}
                </Grid>
              ) : (
                <div className={styles.summary_margin}>
                  <Text className={styles.italic}>{"none"}</Text>
                </div>
              )}
            </div>
            <Space />
          </Grid>
        )
      )}
    </>
  );
};
