"use client";

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
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";
import { getAge } from "../../../utils/getAge";
import { getGenderLabel } from "../../../utils/getGenderLabel";
import { getYearsOldLabel } from "../../../utils/getYearsOldLabel";
import { getDentalAppointmentsSummary } from "../../../utils/getDentalAppointmentsSummary";

// Hooks
import { useState, useEffect } from "react";

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
          <Text>{birthData}</Text>
          <Text>
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
          <Text>{"Existing appointments:"}</Text>
          <Space height={3} />
          {dentalAppointments.map(
            ({
              patientDentistryId,
              appointmentDate,
              treatedTeeth,
              extractedTeeth,
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
                  {treatedTeeth.map((tooth) =>
                    tooth ? (
                      <ToothButton
                        key={tooth}
                        id={tooth}
                        toothDetails={{ toothStatus: ToothStatus.TREATED }}
                        ignoreAbsolutePosition
                      />
                    ) : null
                  )}
                </div>
                <Space />
                <div className={patientSummaryStyles.summary_teeth}>
                  <Text>{"Teeth extracted: "}</Text>
                  {extractedTeeth.map((tooth) =>
                    tooth ? (
                      <ToothButton
                        key={tooth}
                        id={tooth}
                        toothDetails={{ toothStatus: ToothStatus.EXTRACTED }}
                        ignoreAbsolutePosition
                      />
                    ) : null
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
