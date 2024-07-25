"use client";

// Components
import { DentalAppointmentToothDetails } from "../../DentalAppointmentToothDetails";
import { DentalMap } from "../../ui/DentalMap";
import { Grid } from "@radix-ui/themes";

// Hooks
import { useState, useEffect } from "react";

// Types
import { ToothDetails } from "../../DentalAppointmentToothDetails/types/DentalAppointmentToothDetailsProps";
import { Tooth } from "../../../types/Tooth";
import { PatientDentistryId } from "../../../types/PatientDentistryTypes";

// Database
import { getPatientToothMap } from "../../../database/patient-tooth/GetPatientToothMap";

export const DentalAppointmentMap = ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}) => {
  const [selectedTooth, setSelectedTooth] = useState<Tooth>();
  const [toothDetails, setToothDetails] =
    useState<Record<Tooth, ToothDetails>>();

  useEffect(() => {
    const fetchToothMap = async () => {
      if (patientDentistryId) {
        const toothMap = await getPatientToothMap({ patientDentistryId });

        if (toothMap) {
          const details: Record<Tooth, ToothDetails> = toothMap.reduce(
            (acc, tooth) => {
              acc[tooth.toothName] = {
                toothStatus: tooth.toothStatus,
                toothNotes: tooth.toothNotes,
                patientDentistryToothId: tooth.patientDentistryToothId,
              };
              return acc;
            },
            {} as Record<Tooth, ToothDetails>
          );

          setToothDetails(details);
        }
      }
    };

    fetchToothMap();
  }, [patientDentistryId]);

  return (
    <Grid columns="2" gap="5">
      <DentalMap
        onClickTooth={(toothNumber) => setSelectedTooth(toothNumber)}
        selectedTooth={selectedTooth}
        toothDetails={toothDetails}
      />
      {selectedTooth && (
        <DentalAppointmentToothDetails
          patientDentistryId={patientDentistryId}
          selectedTooth={selectedTooth}
          toothDetails={toothDetails}
          setToothDetails={setToothDetails}
        />
      )}
    </Grid>
  );
};
