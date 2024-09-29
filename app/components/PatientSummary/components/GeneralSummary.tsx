"use client";

// Multivariate Dependencies
import { Fragment, useState, useEffect } from "react";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Space } from "../../ui/Space";
import { GeneralSummaryDetails } from "./GeneralSummaryDetails";

// Styles
import styles from "../styles/PatientSummary.module.css";

// Databases
import { getPatientGeneralSummary } from "../../../database/patient-summary/GetPatientGeneralSummary";

// Types
import { PatientGeneralSummary } from "../../../types/PatientGeneralSummary";
import { PatientPersonalId } from "../../../types/PatientPersonalTypes";

// Icons
import { faNotesMedical } from "@fortawesome/free-solid-svg-icons";

// Utils
import { getGeneralAppointmentsSummary } from "../utils/getGeneralAppointmentsSummary";
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";

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
        const patientGeneralSummaryData = await getPatientGeneralSummary({
          patientPersonalId,
        });

        setPatientGeneralSummary(patientGeneralSummaryData);
      }
    };

    fetchProject();
  }, [patientPersonalId]);

  const generalAppointments = getGeneralAppointmentsSummary({
    patientGeneralSummary,
  });

  return (
    <>
      <div className={styles.summary_subtitle}>
        <FontAwesomeIcon icon={faNotesMedical} />
        <Text weight="bold" size="5">
          {"General"}
        </Text>
      </div>
      {generalAppointments.length === 0 && (
        <Text className={`${styles.italic} ${styles.summary_margin}`}>
          {"No appointment"}
        </Text>
      )}
      <Space height={3} />
      {generalAppointments.map(
        ({
          patientGeneralId,
          appointmentDate,
          prescribedMedication,
          patientHeight,
          patientWeight,
          patientTemperature,
          patientPulse,
          patientOxygenSaturation,
          patientBloodGlucose,
          patientBloodPressureSystolic,
          patientBloodPressureDiastolic,
          patientVisionLeftTestedDistance,
          patientVisionLeftNormalDistance,
          patientVisionRightTestedDistance,
          patientVisionRightNormalDistance,
        }) => (
          <Grid key={patientGeneralId} className={styles.appointments}>
            <Text weight="medium" size="3">
              {getLocaleFormattedDate({
                date: appointmentDate,
              })}
            </Text>
            <Space />
            <GeneralSummaryDetails
              patientHeight={patientHeight}
              patientWeight={patientWeight}
              patientTemperature={patientTemperature}
              patientPulse={patientPulse}
              patientOxygenSaturation={patientOxygenSaturation}
              patientBloodGlucose={patientBloodGlucose}
              patientBloodPressureSystolic={patientBloodPressureSystolic}
              patientBloodPressureDiastolic={patientBloodPressureDiastolic}
              patientVisionLeftTestedDistance={patientVisionLeftTestedDistance}
              patientVisionLeftNormalDistance={patientVisionLeftNormalDistance}
              patientVisionRightTestedDistance={
                patientVisionRightTestedDistance
              }
              patientVisionRightNormalDistance={
                patientVisionRightNormalDistance
              }
            />
            <Space />
            <div className={styles.summary_margin}>
              <Text>{"Prescribed medication by the doctor: "}</Text>
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
                <Text className={styles.italic}>{"none"}</Text>
              )}
            </div>
            <Space />
          </Grid>
        )
      )}
    </>
  );
};
