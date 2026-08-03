"use client";

// Components
import { SummaryRow, SummarySection } from "./SummarySection";

// Utils
import { getGenderLabel } from "../../../utils/getGenderLabel";
import { getAge } from "../../../utils/getAge";
import { getYearsOldLabel } from "../../../utils/getYearsOldLabel";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

// Hooks
import { useProjectFormats } from "../../../lib/useProjectFormats";

export const PersonalSummary = ({
  patientPersonalSummary,
}: {
  patientPersonalSummary?: PatientPersonalSummary;
}) => {
  const { formatDate } = useProjectFormats();
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
  const formattedDateOfBirth = formatDate(patientDateOfBirth);

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
