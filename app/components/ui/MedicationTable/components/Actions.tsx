"use client";

// Components
import { Button } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Types
import { ActionsProps } from "../types/ActionsProps";
import { Medication } from "../../../../types/Medication";

// Icons
import { faRemove } from "@fortawesome/free-solid-svg-icons";

// Database
import { deletePatientDentistryMedication } from "../../../../database/patient-dentistry-medication/deletePatientDentistryMedication";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

export const Actions = ({
  medicationUid,
  drug,
  setMedications,
}: ActionsProps) => {
  const { setMessage } = usePopupMessage();

  const onDeleteRow = async () => {
    if (!drug || !medicationUid) {
      return;
    }

    setMedications((prevMedications: Medication[]) =>
      prevMedications.filter(
        (medication) => medication.medicationUid !== medicationUid
      )
    );

    await deletePatientDentistryMedication({
      patientDentistryPrescribedMedicationId: medicationUid,
    });

    if (setMessage) {
      setMessage("Saved");
    }
  };

  return (
    <Button
      variant="outline"
      disabled={!drug}
      title="Delete row"
      onClick={onDeleteRow}
    >
      <FontAwesomeIcon icon={faRemove} />
    </Button>
  );
};
