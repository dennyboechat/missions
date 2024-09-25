// Types
import { PatientGeneralSummary } from "../../../types/PatientGeneralSummary";
import { PatientGeneralAppointmentSummary } from "../../../types/PatientGeneralAppointmentSummary";

export const getGeneralAppointmentsSummary = ({
  patientGeneralSummary,
}: {
  patientGeneralSummary?: PatientGeneralSummary[];
}) => {
  let generalAppointments: PatientGeneralAppointmentSummary[] = [];

  if (patientGeneralSummary?.length) {
    generalAppointments = patientGeneralSummary.reduce<
      PatientGeneralAppointmentSummary[]
    >((acc, currentAppointment) => {
      const {
        patientGeneralId,
        appointmentDate,
        patientGeneralPrescribedMedicationId,
        drug,
        dose,
        quantity,
        instructions,
      } = currentAppointment;

      const existingAppointment = acc.find(
        (appointment) => appointment.patientGeneralId === patientGeneralId
      );

      if (existingAppointment) {
        if (
          patientGeneralPrescribedMedicationId &&
          !existingAppointment.prescribedMedication.some(
            (medication) =>
              medication.medicationUid === patientGeneralPrescribedMedicationId
          )
        ) {
          existingAppointment.prescribedMedication = [
            ...existingAppointment.prescribedMedication,
            {
              rowId: patientGeneralPrescribedMedicationId,
              medicationUid: patientGeneralPrescribedMedicationId,
              drug,
              dose,
              quantity,
              instructions,
            },
          ];
        }
      } else {
        acc.push({
          patientGeneralId: patientGeneralId,
          appointmentDate: appointmentDate,
          prescribedMedication: patientGeneralPrescribedMedicationId
            ? [
                {
                  rowId: patientGeneralPrescribedMedicationId,
                  medicationUid: patientGeneralPrescribedMedicationId,
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

  return generalAppointments;
};
