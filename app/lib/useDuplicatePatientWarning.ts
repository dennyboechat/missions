"use client";

// Hooks
import { useState, useEffect, useCallback } from "react";

// Database
import { getPatientPersonalsByFullName } from "../database/patient-personal/GetPatientPersonalsByFullName";

// Types
import { PatientPersonalTypes } from "../types/PatientPersonalTypes";
import { ProjectId } from "../types/ProjectTypes";
import { actionData } from "../types/ActionResult";

// Utils
import { getDuplicatePatientWarning } from "../utils/getDuplicatePatientWarning";
import { isValidPatientFullName } from "../utils/isValidPatientFullName";
import { isSameName } from "../utils/isSameName";

/**
 * Warns when a patient name is already registered in the project.
 *
 * Shared by the two places a name is set -- the new patient form and the name
 * field of an existing patient -- so renaming someone onto an existing name
 * says so too, rather than only the create path being watched.
 *
 * `excludePatientPersonalId` keeps a patient from being reported as a
 * duplicate of themselves.
 */
export const useDuplicatePatientWarning = ({
  projectId,
  patientFullName,
  excludePatientPersonalId,
}: {
  projectId: ProjectId;
  patientFullName?: string;
  excludePatientPersonalId?: string;
}) => {
  const [duplicatePatientPersonals, setDuplicatePatientPersonals] = useState<
    PatientPersonalTypes[]
  >([]);
  // The name the list belongs to, so a caller can tell an answered check from
  // one that has not come back yet.
  const [checkedFullName, setCheckedFullName] = useState("");

  // Failing this lookup must not stand between the user and saving a patient,
  // so a failure is reported as "no duplicates" rather than as an error.
  const findPatientsWithSameName = useCallback(
    async (fullName: string) => {
      const patientsWithSameName =
        actionData(
          await getPatientPersonalsByFullName({
            projectId,
            patientFullName: fullName,
          })
        ) ?? [];

      return patientsWithSameName.filter(
        ({ patientPersonalId }) => patientPersonalId !== excludePatientPersonalId
      );
    },
    [projectId, excludePatientPersonalId]
  );

  useEffect(() => {
    if (!isValidPatientFullName({ patientFullName })) {
      setDuplicatePatientPersonals([]);
      setCheckedFullName("");
      return;
    }

    let isCurrentName = true;

    const findDuplicates = async () => {
      const patientsWithSameName = await findPatientsWithSameName(
        patientFullName ?? ""
      );

      // A slower response for a name the user has already replaced would
      // otherwise warn about the wrong name.
      if (isCurrentName) {
        setDuplicatePatientPersonals(patientsWithSameName);
        setCheckedFullName(patientFullName ?? "");
      }
    };

    findDuplicates();

    return () => {
      isCurrentName = false;
    };
  }, [patientFullName, findPatientsWithSameName]);

  const hasCheckedCurrentName = isSameName(patientFullName, checkedFullName);

  /**
   * Runs the check now and answers whether the name is taken. For the moment
   * before the effect above has replied -- a name typed and confirmed in one
   * motion -- where the alternative is saving with no warning shown at all.
   */
  const checkForDuplicates = useCallback(async () => {
    const patientsWithSameName = await findPatientsWithSameName(
      patientFullName ?? ""
    );

    setDuplicatePatientPersonals(patientsWithSameName);
    setCheckedFullName(patientFullName ?? "");

    return patientsWithSameName.length > 0;
  }, [patientFullName, findPatientsWithSameName]);

  return {
    duplicateWarning: hasCheckedCurrentName
      ? getDuplicatePatientWarning({
          patientFullName,
          duplicatePatientPersonals,
        })
      : "",
    hasCheckedCurrentName,
    checkForDuplicates,
  };
};
