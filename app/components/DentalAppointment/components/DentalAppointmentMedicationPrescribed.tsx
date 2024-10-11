"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { MedicationTable } from "../../ui/MedicationTable";
import { Space } from "../../ui/Space";

// Types
import { Medication } from "../../../types/Medication";
import { PatientDentistryId } from "../../../types/PatientDentistryTypes";

// Hooks
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Utils
import { getNewMedicationRecord } from "../../ui/MedicationTable/utils/getNewMedicationRecord";
import { generateUID } from "../../../utils/generateUID";

// Database
import { getPatientDentistryMedications } from "../../../database/patient-dentistry-medication/GetPatientDentistryMedications";
import { insertPatientDentistryMedication } from "../../../database/patient-dentistry-medication/InsertPatientDentistryMedication";
import { updatePatientDentistryMedication } from "../../../database/patient-dentistry-medication/UpdatePatientDentistryMedication";
import { deletePatientDentistryMedication } from "../../../database/patient-dentistry-medication/DeletePatientDentistryMedication";

export const DentalAppointmentMedicationPrescribed = ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    const updatePatientMedications = async () => {
      if (patientDentistryId) {
        const dentistryMedications = await getPatientDentistryMedications({
          patientDentistryId,
        });

        if (dentistryMedications) {
          const retrievedMedications: Medication[] = [];

          dentistryMedications.map(
            ({
              patientDentistryPrescribedMedicationId,
              drug,
              dose,
              quantity,
              instructions,
            }) => {
              retrievedMedications.push({
                rowId: generateUID(),
                medicationUid: patientDentistryPrescribedMedicationId,
                drug,
                dose,
                quantity,
                instructions,
              });
            }
          );

          retrievedMedications.push(getNewMedicationRecord());
          setMedications(retrievedMedications);
        } else {
          console.log(
            `Error to get patient dentistry medications with id ${patientDentistryId}`
          );
        }
      }
    };

    updatePatientMedications();
  }, [patientDentistryId]);

  const insertMedication = async (
    drug: string,
    updatedMedications: Medication[]
  ) => {
    const insertedMedication = await insertPatientDentistryMedication({
      patientDentistryId,
      medication: {
        drug,
      },
    });

    if (insertedMedication) {
      const lastIndex = updatedMedications.length - 1;
      updatedMedications[lastIndex] = {
        ...updatedMedications[lastIndex],
        drug,
        medicationUid:
          insertedMedication.patientDentistryPrescribedMedicationId,
      };

      if (setMessage && setMessageType) {
        setMessage("Saved");
        setMessageType("regular");
      }
    } else {
      if (setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
        setMessageType("error");
      }

      console.error("Error to insert drug to prescribed medications.");
    }
  };

  const updateMedication = async (
    medicationUid: string,
    field: "drug" | "dose" | "quantity" | "instructions_usage",
    value?: string | number
  ) => {
    return await updatePatientDentistryMedication({
      patientDentistryPrescribedMedicationId: medicationUid,
      field,
      value,
    });
  };

  const deleteMedication = async (medicationUid: string) => {
    return await deletePatientDentistryMedication({
      patientDentistryPrescribedMedicationId: medicationUid,
    });
  };

  return (
    <Box>
      <Text>{"Prescribed medication by the dentist:"}</Text>
      <Space height={3} />
      <MedicationTable
        medications={medications}
        setMedications={setMedications}
        insertMedication={insertMedication}
        updateMedication={updateMedication}
        deleteMedication={deleteMedication}
      />
    </Box>
  );
};
