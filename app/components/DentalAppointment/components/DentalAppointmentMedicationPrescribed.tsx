"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { MedicationTable } from "../../ui/MedicationTable";
import { Space } from "../../ui/Space";

// Styles
import styles from "../styles/DentalAppointment.module.css";

// Types
import { Medication } from "../../../types/Medication";
import { DentistryPrescribedMedication } from "../../../types/DentistryPrescribedMedication";
import { PatientDentistryId } from "../../../types/PatientDentistryTypes";
import { databaseRetries } from "../../../types/DatabaseRetries";

// Hooks
import { useState, useEffect, useCallback, useRef } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useLiveData } from "../../../lib/useLiveData";

// Utils
import {
  mergeMedicationRows,
  toMedicationRows,
} from "../../ui/MedicationTable/utils/mergeMedicationRows";

// Database
import { getPatientDentistryMedications } from "../../../database/patient-dentistry-medication/GetPatientDentistryMedications";
import { insertPatientDentistryMedication } from "../../../database/patient-dentistry-medication/InsertPatientDentistryMedication";
import { updatePatientDentistryMedication } from "../../../database/patient-dentistry-medication/UpdatePatientDentistryMedication";
import { deletePatientDentistryMedication } from "../../../database/patient-dentistry-medication/DeletePatientDentistryMedication";

// Types
import { actionData } from "../../../types/ActionResult";

export const DentalAppointmentMedicationPrescribed = ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [medications, setMedications] = useState<Medication[]>([]);

  // Whether the cursor is in this table. A refresh that landed while someone was
  // choosing a drug or halfway through an instruction would take the row out from
  // under them -- and would do it to the row whose insert is still in flight,
  // which is the one that cannot be rebuilt from the database yet.
  const tableRef = useRef<HTMLDivElement>(null);

  const isBeingEdited = () => {
    const focused = document.activeElement;

    return Boolean(focused && tableRef.current?.contains(focused));
  };

  // The id is the only thing this table names differently from the general one, so
  // it is renamed here and everything downstream is shared.
  const toRows = (records: DentistryPrescribedMedication[]) =>
    records.map(
      ({
        patientDentistryPrescribedMedicationId,
        drug,
        dose,
        quantity,
        instructions,
      }) => ({
        medicationUid: patientDentistryPrescribedMedicationId,
        drug,
        dose,
        quantity,
        instructions,
      }),
    );

  useEffect(() => {
    const updatePatientMedications = async () => {
      if (patientDentistryId) {
        const dentistryMedications = actionData(await getPatientDentistryMedications({
          patientDentistryId,
        }));

        if (dentistryMedications) {
          setMedications(toMedicationRows(toRows(dentistryMedications)));
        } else {
          console.log(
            `Error to get patient dentistry medications with id ${patientDentistryId}`
          );
        }
      }
    };

    updatePatientMedications();
  }, [patientDentistryId]);

  // Read once when the tab opened, and never again -- so a colleague's
  // prescription never arrived. The chair and the dispensary are two people.
  const refreshMedications = useCallback(
    () => getPatientDentistryMedications({ patientDentistryId }),
    [patientDentistryId],
  );

  useLiveData({
    load: refreshMedications,
    apply: (result) => {
      const records = actionData(result);

      if (!records || isBeingEdited()) {
        return;
      }

      setMedications((current) =>
        mergeMedicationRows({ current, incoming: toRows(records) }),
      );
    },
    enabled: Boolean(patientDentistryId),
  });

  const insertMedication = async (
    drug: string,
    updatedMedications: Medication[]
  ) => {
    let attempt = 0;
    let isOnline;

    while (attempt < databaseRetries && !isOnline) {
      isOnline = navigator.onLine;

      if (isOnline) {
        const insertedMedication = actionData(await insertPatientDentistryMedication({
          patientDentistryId,
          medication: {
            drug,
          },
        }));
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
            setMessage("Error to save medication. Please try again.");
            setMessageType("error");
          }

          console.error("Error to insert drug to prescribed medications.");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempt++;
        console.warn(`Attempt to run ${attempt}`);
      }
    }

    if (!isOnline && setMessage && setMessageType) {
      setMessage("Error to save medication. Please try again.");
      setMessageType("error");
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
      <Text className={styles.section_title}>
        {"Prescribed medication"}
      </Text>
      <Space height={8} />
      {/* The ref is what tells a refresh to wait: everything the user can put a
          cursor in is inside this element. */}
      <div ref={tableRef}>
        <MedicationTable
          medications={medications}
          setMedications={setMedications}
          insertMedication={insertMedication}
          updateMedication={updateMedication}
          deleteMedication={deleteMedication}
        />
      </div>
    </Box>
  );
};
