//Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";
import { PatientGeneralSummary } from "../../../types/PatientGeneralSummary";
import { PatientDentalSummary } from "../../../types/PatientDentalSummary";
import { ToothStatus } from "../../../types/ToothStatus";

export const getStringifyPatientGeneralSummary = (
  patientPersonalSummary: PatientPersonalSummary,
  patientGeneralSummary?: PatientGeneralSummary[],
  patientDentalSummary?: PatientDentalSummary[]
) => {
  const { isPatientMale, patientDateOfBirth } = patientPersonalSummary;

  let height, weight, temperature, pulse, oxygenSaturation, bloodGlucose;
  let bloodPressureDiastolic, bloodPressureSystolic;
  let visionLeftNormalDistance, visionLeftTestedDistance;
  let visionRightNormalDistance, visionRightTestedDistance;

  const generalMedications: string[] = [];
  const dentalMedications: string[] = [];
  const treatedTeeth: string[] = [];
  const extractedTeeth: string[] = [];

  patientGeneralSummary?.forEach(
    (
      {
        patientHeight,
        patientWeight,
        patientTemperature,
        patientPulse,
        patientOxygenSaturation,
        patientBloodGlucose,
        patientBloodPressureDiastolic,
        patientBloodPressureSystolic,
        patientVisionLeftNormalDistance,
        patientVisionLeftTestedDistance,
        patientVisionRightNormalDistance,
        patientVisionRightTestedDistance,
        drug,
        dose,
        quantity,
        instructions,
      },
      index
    ) => {
      if (index === 0) {
        height = patientHeight;
        weight = patientWeight;
        temperature = patientTemperature;
        pulse = patientPulse;
        oxygenSaturation = patientOxygenSaturation;
        bloodGlucose = patientBloodGlucose;
        bloodPressureDiastolic = patientBloodPressureDiastolic;
        bloodPressureSystolic = patientBloodPressureSystolic;
        visionLeftNormalDistance = patientVisionLeftNormalDistance;
        visionLeftTestedDistance = patientVisionLeftTestedDistance;
        visionRightNormalDistance = patientVisionRightNormalDistance;
        visionRightTestedDistance = patientVisionRightTestedDistance;
      }

      if (drug || dose || quantity || instructions) {
        const medicationDetails = `Drug: ${drug}, Dose: ${dose}, Quantity: ${quantity}, Instructions: ${instructions}`;
        if (!generalMedications.includes(medicationDetails)) {
          generalMedications.push(medicationDetails);
        }
      }
    }
  );

  patientDentalSummary?.forEach(
    ({ toothName, toothStatus, drug, dose, quantity, instructions }) => {
      if (
        toothStatus === ToothStatus.EXTRACTED &&
        !extractedTeeth.includes(toothName)
      ) {
        extractedTeeth.push(toothName);
      }

      if (
        toothStatus === ToothStatus.TREATED &&
        !treatedTeeth.includes(toothName)
      ) {
        treatedTeeth.push(toothName);
      }

      if (drug || dose || quantity || instructions) {
        const medicationDetails = `Drug: ${drug}, Dose: ${dose}, Quantity: ${quantity}, Instructions: ${instructions}`;

        if (!dentalMedications.includes(medicationDetails)) {
          dentalMedications.push(medicationDetails);
        }
      }
    }
  );

  return `
    DoB ${patientDateOfBirth} 
    IsMale ${isPatientMale} 
    Height ${height ?? "null"} cm 
    Weight ${weight ?? "null"} kg 
    Temperature ${temperature ?? "null"} C 
    Pulse ${pulse ?? "null"} bpm 
    Oxygen Saturation ${oxygenSaturation ?? "null"} % 
    Blood Glucose ${bloodGlucose ?? "null"} mg/dL 
    Blood Pressure ${bloodPressureSystolic ?? "null"}/${
    bloodPressureDiastolic ?? "null"
  } mmHg 
    Vision Left ${visionLeftNormalDistance ?? "null"}/${
    visionLeftTestedDistance ?? "null"
  } 
    Vision Right ${visionRightNormalDistance ?? "null"}/${
    visionRightTestedDistance ?? "null"
  } 
    Medications: ${
      generalMedications.length > 0 ? generalMedications.join("; ") : "none"
    }
    Dental medications: ${
      dentalMedications.length > 0 ? dentalMedications.join("; ") : "none"
    }
    Extracted teeth names ${extractedTeeth ?? "none"}
    Treated teeth names ${treatedTeeth ?? "none"}
  `.trim();
};
