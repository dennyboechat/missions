"use client";

// Components
import { Text } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Styles
import styles from "../styles/PatientSummary.module.css";

// Utils
import { getGenderLabel } from "../../../utils/getGenderLabel";
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";
import { getAge } from "../../../utils/getAge";
import { getYearsOldLabel } from "../../../utils/getYearsOldLabel";

// Icons
import { faUser } from "@fortawesome/free-solid-svg-icons";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

export const PersonalSummary = ({
  patientPersonalSummary,
}: {
  patientPersonalSummary: PatientPersonalSummary;
}) => {
  const { patientFullName, patientDateOfBirth, isPatientMale } =
    patientPersonalSummary;

  const patientAge = getAge({
    date: patientDateOfBirth,
  });

  const patientAgeLabel = getYearsOldLabel({ age: patientAge ?? 0 });

  const formattedDateOfBirth = getLocaleFormattedDate({
    date: patientDateOfBirth,
  });

  const birthData = `${formattedDateOfBirth} (${patientAgeLabel})`;

  return (
    <>
      <div className={styles.summary_subtitle}>
        <FontAwesomeIcon icon={faUser} />
        <Text weight="bold" size="5">
          {patientFullName}
        </Text>
      </div>
      <Text className={styles.summary_margin}>{birthData}</Text>
      <Text className={styles.summary_margin}>
        {getGenderLabel({
          isPatientMale,
        })}
      </Text>
    </>
  );
};
