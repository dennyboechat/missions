"use client";

// Components
import { SummaryRow, SummarySection } from "./SummarySection";

// Utils
import { getGenderLabel } from "../../../utils/getGenderLabel";
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";
import { getAge } from "../../../utils/getAge";
import { getYearsOldLabel } from "../../../utils/getYearsOldLabel";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

export const PersonalSummary = ({
  patientPersonalSummary,
}: {
  patientPersonalSummary?: PatientPersonalSummary;
}) => {
  if (!patientPersonalSummary) {
    return null;
  }

  const {
    patientFullName,
    patientDateOfBirth,
    isPatientMale,
    patientPhoneNumber,
  } = patientPersonalSummary;

  const patientAge = getAge({ date: patientDateOfBirth });
  const patientAgeLabel = getYearsOldLabel({ age: patientAge ?? 0 });
  const formattedDateOfBirth = getLocaleFormattedDate({
    date: patientDateOfBirth,
  });

  return (
    <SummarySection icon="personal" title="Personal">
      <SummaryRow label="Full name" value={patientFullName} />
      {/* Age always follows a date of birth. */}
      <SummaryRow
        label="Date of birth"
        value={`${formattedDateOfBirth} (${patientAgeLabel})`}
        numeric
      />
      <SummaryRow label="Gender" value={getGenderLabel({ isPatientMale })} />
      <SummaryRow label="Phone number" value={patientPhoneNumber} numeric />
    </SummarySection>
  );
};
