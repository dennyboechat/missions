"use client";

// Multivariate Dependencies
import { Fragment, useState, useEffect } from "react";

// Components
import { Container, Text, Grid } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { SideMenuLayout } from "../../ui/SideMenuLayout";
import { PatientMenuItems } from "../../PatientMenuItems";
import { Space } from "../../ui/Space";
import { ToothButton } from "../../ui/ToothButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Styles
import styles from "../../../styles/content.module.css";
import patientSummaryStyles from "../styles/PatientSummary.module.css";

// Database
import { getPatientSummary } from "../../../database/patient-summary/GetPatientSummary";
import { getPatientDentalSummary } from "../../../database/patient-summary/GetPatientDentalSummary";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";
import { PatientDentalSummary } from "../../../types/PatientDentalSummary";
import { ToothStatus } from "../../../types/ToothStatus";

// Utils
import { getSideMenuSubHeader } from "../../../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../../../utils/getSideMenuSubHeaderFooter";
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";
import { getAge } from "../../../utils/getAge";
import { getGenderLabel } from "../../../utils/getGenderLabel";
import { getYearsOldLabel } from "../../../utils/getYearsOldLabel";
import { getDentalAppointmentsSummary } from "../utils/getDentalAppointmentsSummary";

// Icons
import {
  faUser,
  faNotesMedical,
  faTooth,
} from "@fortawesome/free-solid-svg-icons";

export const PatientSummary = ({ params }: { params: { id: string } }) => {
  const [patientPersonalSummary, setPatientPersonalSummary] =
    useState<PatientPersonalSummary>();
  const [patientDentalSummary, setPatientDentalSummary] =
    useState<PatientDentalSummary[]>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchProject = async () => {
      if (patientPersonalId) {
        const patientPersonalSummaryData = await getPatientSummary({
          patientPersonalId,
        });

        setPatientPersonalSummary(patientPersonalSummaryData);

        const patientDentalSummaryData = await getPatientDentalSummary({
          patientPersonalId,
        });

        setPatientDentalSummary(patientDentalSummaryData);
      }
    };

    fetchProject();
  }, [patientPersonalId]);

  if (!patientPersonalSummary) {
    return null;
  }

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-summary"
    />
  );

  const { patientFullName, patientDateOfBirth, isPatientMale } =
    patientPersonalSummary;

  const subHeader = getSideMenuSubHeader({
    patientDateOfBirth,
  });

  const subHeaderFooter = getSideMenuSubHeaderFooter({
    isPatientMale,
  });

  const patientAge = getAge({
    date: patientDateOfBirth,
  });

  const patientAgeLabel = getYearsOldLabel({ age: patientAge ?? 0 });

  const formattedDateOfBirth = getLocaleFormattedDate({
    date: patientDateOfBirth,
  });

  const birthData = `${formattedDateOfBirth} (${patientAgeLabel})`;

  const dentalAppointments = getDentalAppointmentsSummary({
    patientDentalSummary,
  });

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={patientFullName}
      subHeader={subHeader}
      subHeaderFooter={subHeaderFooter}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="Summary" />
        <Grid>
          <div className={patientSummaryStyles.summary_subtitle}>
            <FontAwesomeIcon icon={faUser} />
            <Text weight="bold" size="5">
              {patientFullName}
            </Text>
          </div>
          <Text className={patientSummaryStyles.summary_margin}>
            {birthData}
          </Text>
          <Text className={patientSummaryStyles.summary_margin}>
            {getGenderLabel({
              isPatientMale,
            })}
          </Text>
          <Space />
          <div className={patientSummaryStyles.summary_subtitle}>
            <FontAwesomeIcon icon={faNotesMedical} />
            <Text weight="bold" size="5">
              {"General"}
            </Text>
          </div>
          <Space />
          <div className={patientSummaryStyles.summary_subtitle}>
            <FontAwesomeIcon icon={faTooth} />
            <Text weight="bold" size="5">
              {"Dental"}
            </Text>
          </div>
          {dentalAppointments.length > 0 ? (
            <Text className={patientSummaryStyles.summary_margin}>
              {"Existing appointments:"}
            </Text>
          ) : (
            <Text
              className={`${patientSummaryStyles.italic} ${patientSummaryStyles.summary_margin}`}
            >
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
              <Grid
                key={patientDentistryId}
                className={patientSummaryStyles.dental_appointments}
              >
                <Text weight="medium" size="3">
                  {getLocaleFormattedDate({
                    date: appointmentDate,
                  })}
                </Text>
                <div className={patientSummaryStyles.summary_teeth}>
                  <Text>{"Teeth treated: "}</Text>
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
                    <Text className={patientSummaryStyles.italic}>
                      {"none"}
                    </Text>
                  )}
                </div>
                <Space />
                <div className={patientSummaryStyles.summary_teeth}>
                  <Text>{"Teeth extracted: "}</Text>
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
                    <Text className={patientSummaryStyles.italic}>
                      {"none"}
                    </Text>
                  )}
                </div>
                <Space />
                <div className={patientSummaryStyles.summary_margin}>
                  <Text>{"Prescribed medication: "}</Text>
                  {prescribedMedication.length > 0 ? (
                    <Grid
                      columns="30fr 10fr 10fr 50fr"
                      gap="2"
                      className={patientSummaryStyles.summary_margin}
                    >
                      <Text weight="medium">{"Drug"}</Text>
                      <Text weight="medium">{"Dose"}</Text>
                      <Text weight="medium">{"Quantity"}</Text>
                      <Text weight="medium">{"Instructions"}</Text>
                      {prescribedMedication.map(
                        ({ rowId, drug, dose, quantity, instructions }) => (
                          <Fragment key={rowId}>
                            <Text
                              className={
                                patientSummaryStyles.summary_medication_item
                              }
                            >
                              {drug}
                            </Text>
                            <Text
                              className={
                                patientSummaryStyles.summary_medication_item
                              }
                            >
                              {dose}
                            </Text>
                            <Text
                              className={
                                patientSummaryStyles.summary_medication_item
                              }
                            >
                              {quantity}
                            </Text>
                            <Text
                              className={
                                patientSummaryStyles.summary_medication_item
                              }
                            >
                              {instructions}
                            </Text>
                          </Fragment>
                        )
                      )}
                    </Grid>
                  ) : (
                    <Text className={patientSummaryStyles.italic}>
                      {"none"}
                    </Text>
                  )}
                </div>
                <Space />
              </Grid>
            )
          )}
        </Grid>
      </Container>
    </SideMenuLayout>
  );
};
