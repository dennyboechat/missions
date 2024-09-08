// Types
import { ToothStatus } from "../types/ToothStatus";
import { PatientDentalSummary } from "../types/PatientDentalSummary";
import { PatientDentalAppointmentSummary } from "../types/PatientDentalAppointmentSummary";

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
      const existingAppointment = acc.find(
        (appointment) =>
          appointment.patientDentistryId ===
          currentAppointment.patientDentistryId
      );

      const treatedTooth =
        currentAppointment.toothStatus === ToothStatus.TREATED
          ? currentAppointment.toothName
          : undefined;

      const extractedTooth =
        currentAppointment.toothStatus === ToothStatus.EXTRACTED
          ? currentAppointment.toothName
          : undefined;

      if (existingAppointment) {
        if (treatedTooth) {
          existingAppointment.treatedTeeth = [
            ...existingAppointment.treatedTeeth,
            treatedTooth,
          ];
        }

        if (extractedTooth) {
          existingAppointment.extractedTeeth = [
            ...existingAppointment.extractedTeeth,
            extractedTooth,
          ];
        }

        existingAppointment.appointmentDate =
          currentAppointment.appointmentDate;
      } else {
        acc.push({
          patientDentistryId: currentAppointment.patientDentistryId,
          appointmentDate: currentAppointment.appointmentDate,
          treatedTeeth: [treatedTooth],
          extractedTeeth: [extractedTooth],
        });
      }

      return acc;
    }, []);
  }

  return dentalAppointments;
};
