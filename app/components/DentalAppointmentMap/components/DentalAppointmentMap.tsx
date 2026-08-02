"use client";

// Components
import { DentalAppointmentToothDetails } from "../../DentalAppointmentToothDetails";
import { DentalMap } from "../../ui/DentalMap";
import { Grid } from "@radix-ui/themes";

// Hooks
import { useState, useEffect, useCallback, useRef } from "react";
import { useLiveData } from "../../../lib/useLiveData";

// Types
import { ToothDetails } from "../../DentalAppointmentToothDetails/types/DentalAppointmentToothDetailsProps";
import { Tooth } from "../../../types/Tooth";
import { DentalAppointmentMapProps } from "../types/DentalAppointmentMapProps";
import { PatientDentistryTooth } from "../../../types/PatientDentistryTooth";

// Database
import { getPatientToothMap } from "../../../database/patient-tooth/GetPatientToothMap";
import { ChildDentalMap } from "../../ui/DentalMap/components/ChildDentalMap";

// Types
import { actionData } from "../../../types/ActionResult";

const toToothDetails = (toothMap: PatientDentistryTooth[]) =>
  toothMap.reduce((acc, tooth) => {
    acc[tooth.toothName] = {
      toothStatus: tooth.toothStatus,
      toothNotes: tooth.toothNotes,
      patientDentistryToothId: tooth.patientDentistryToothId,
    };
    return acc;
  }, {} as Record<Tooth, ToothDetails>);

const isSameTooth = (a?: ToothDetails, b?: ToothDetails) =>
  a?.toothStatus === b?.toothStatus &&
  a?.toothNotes === b?.toothNotes &&
  a?.patientDentistryToothId === b?.patientDentistryToothId;

export const DentalAppointmentMap = ({
  patientDentistryId,
}: DentalAppointmentMapProps) => {
  const [selectedTooth, setSelectedTooth] = useState<Tooth>();
  const [toothDetails, setToothDetails] =
    useState<Record<Tooth, ToothDetails>>();

  // The last map the server sent -- the baseline an edit made here is measured
  // against, not necessarily what is on screen.
  const lastRemoteToothDetailsRef = useRef<
    Record<Tooth, ToothDetails> | undefined
  >(undefined);

  /**
   * Takes a tooth map, from the first load or from the refresh.
   *
   * A tooth is adopted from the server unless it has been changed here since
   * the last time the server spoke -- the tooth notes live in this state and
   * are saved a beat after typing stops, so overwriting one wholesale would
   * delete a sentence mid-word. The same rule as useLiveValue, applied per
   * tooth so that charting one tooth still lets every other tooth update.
   */
  const applyToothMap = useCallback((toothMap?: PatientDentistryTooth[]) => {
    if (!toothMap) {
      return;
    }

    const remoteToothDetails = toToothDetails(toothMap);
    const lastRemoteToothDetails = lastRemoteToothDetailsRef.current;

    lastRemoteToothDetailsRef.current = remoteToothDetails;

    setToothDetails((localToothDetails) => {
      if (!localToothDetails || !lastRemoteToothDetails) {
        return remoteToothDetails;
      }

      const mergedToothDetails = { ...remoteToothDetails };

      (Object.keys(localToothDetails) as Tooth[]).forEach((toothName) => {
        const hasLocalEdit = !isSameTooth(
          localToothDetails[toothName],
          lastRemoteToothDetails[toothName],
        );

        if (hasLocalEdit) {
          mergedToothDetails[toothName] = localToothDetails[toothName];
        }
      });

      return mergedToothDetails;
    });
  }, []);

  useEffect(() => {
    const fetchToothMap = async () => {
      if (patientDentistryId) {
        applyToothMap(
          actionData(await getPatientToothMap({ patientDentistryId })),
        );
      }
    };

    fetchToothMap();
  }, [patientDentistryId, applyToothMap]);

  // Charting is the part of a dental appointment two people are most likely to
  // split between them, so the map re-reads itself while it is open. The
  // selected tooth is separate state and is left alone, so nobody loses the
  // tooth they are working on.
  const refreshToothMap = useCallback(
    () => getPatientToothMap({ patientDentistryId }),
    [patientDentistryId],
  );

  useLiveData({
    load: refreshToothMap,
    apply: (result) => applyToothMap(actionData(result)),
    enabled: Boolean(patientDentistryId),
  });

  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="5">
      <Grid columns={{ initial: "1", lg: "2" }} gap="5" align='center'>
        <DentalMap
          onClickTooth={(toothNumber) => setSelectedTooth(toothNumber)}
          selectedTooth={selectedTooth}
          toothDetails={toothDetails}
        />
        <ChildDentalMap
          onClickTooth={(toothNumber) => setSelectedTooth(toothNumber)}
          selectedTooth={selectedTooth}
          toothDetails={toothDetails}
        />
      </Grid>
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
