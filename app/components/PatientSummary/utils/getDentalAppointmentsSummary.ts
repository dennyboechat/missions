// Types
import { ToothStatus } from "../../../types/ToothStatus";
import { PatientDentalSummary } from "../../../types/PatientDentalSummary";
import { PatientDentalAppointmentSummary } from "../../../types/PatientDentalAppointmentSummary";

export const getDentalAppointmentsSummary = ({
  patientDentalSummary,
}: {
  patientDentalSummary?: PatientDentalSummary[];
}) => {
  let dentalAppointments: PatientDentalAppointmentSummary[] = [];

  if (patientDentalSummary?.length) {
    dentalAppointments = patientDentalSummary.reduce<
      PatientDentalAppointmentSummary[]
    >((acc, currentAppointment) => {
      const {
        patientDentistryId,
        toothName,
        toothStatus,
        appointmentDate,
        appointmentHasReferral,
        appointmentReferral,
        patientDentistryPrescribedMedicationId,
        drug,
        dose,
        quantity,
        instructions,
      } = currentAppointment;

      const existingAppointment = acc.find(
        (appointment) => appointment.patientDentistryId === patientDentistryId
      );

      const treatedTooth =
        toothStatus === ToothStatus.TREATED ? toothName : undefined;

      const extractedTooth =
        toothStatus === ToothStatus.EXTRACTED ? toothName : undefined;

      if (existingAppointment) {
        if (
          treatedTooth &&
          !existingAppointment.treatedTeeth.includes(treatedTooth)
        ) {
          existingAppointment.treatedTeeth = [
            ...existingAppointment.treatedTeeth,
            treatedTooth,
          ];
        }

        if (
          extractedTooth &&
          !existingAppointment.extractedTeeth.includes(extractedTooth)
        ) {
          existingAppointment.extractedTeeth = [
            ...existingAppointment.extractedTeeth,
            extractedTooth,
          ];
        }

        if (
          patientDentistryPrescribedMedicationId &&
          !existingAppointment.prescribedMedication.some(
            (medication) =>
              medication.medicationUid ===
              patientDentistryPrescribedMedicationId
          )
        ) {
          existingAppointment.prescribedMedication = [
            ...existingAppointment.prescribedMedication,
            {
              rowId: patientDentistryPrescribedMedicationId,
              medicationUid: patientDentistryPrescribedMedicationId,
              drug,
              dose,
              quantity,
              instructions,
            },
          ];
        }
      } else {
        acc.push({
          patientDentistryId: patientDentistryId,
          appointmentDate,
          appointmentHasReferral,
          appointmentReferral,
          treatedTeeth: treatedTooth ? [treatedTooth] : [],
          extractedTeeth: extractedTooth ? [extractedTooth] : [],
          prescribedMedication: patientDentistryPrescribedMedicationId
            ? [
                {
                  rowId: patientDentistryPrescribedMedicationId,
                  medicationUid: patientDentistryPrescribedMedicationId,
                  drug,
                  dose,
                  quantity,
                  instructions,
                },
              ]
            : [],
        });
      }

      return acc;
    }, []);
  }

  return dentalAppointments;
};
