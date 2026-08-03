"use client";

// Hooks
import { useState, useEffect, useCallback } from "react";

// Database
import { getProjectUsersByName } from "../database/project-user/GetProjectUsersByName";
import { getProjectUserByEmail } from "../database/project-user/GetProjectUserByEmail";

// Types
import { ProjectUser } from "../types/ProjectUserTypes";
import { ProjectId } from "../types/ProjectTypes";
import { actionData } from "../types/ActionResult";

// Utils
import { getDuplicateUserWarning } from "../utils/getDuplicateUserWarning";
import { getExistingProjectUserError } from "../utils/getExistingProjectUserError";
import { isSameName } from "../utils/isSameName";
import { isValidEmail } from "../utils/isValidEmail";

const isSameEmail = (email?: string, otherEmail?: string) =>
  (email ?? "").trim().toLowerCase() ===
  (otherEmail ?? "").trim().toLowerCase();

/**
 * What the new-user form needs to know about the two values it collects, and the
 * difference between the two answers:
 *
 *  - the name is already on the project, so this may be the same person twice.
 *    A warning: namesakes are real, and the owner is the one who can tell.
 *  - the email is already on the project. An error: a project holds an account
 *    once, so there is nothing to confirm and the save cannot go through.
 *
 * The email check used to ask a different question -- whether the address
 * belonged to an account registered under another name, anywhere in the system --
 * and warned when it did. On a form whose whole purpose is adding someone who is
 * not here yet, that fired almost every time while saying nothing about what
 * actually fails, so it is gone.
 */
export const useNewProjectUserChecks = ({
  projectId,
  userName,
  userEmail,
}: {
  projectId: ProjectId;
  userName?: string;
  userEmail?: string;
}) => {
  const [duplicateProjectUsers, setDuplicateProjectUsers] = useState<
    ProjectUser[]
  >([]);
  const [existingProjectUser, setExistingProjectUser] = useState<ProjectUser>();
  // The values the answers belong to, so the caller can tell an answered check
  // from one that has not come back yet.
  const [checkedUserName, setCheckedUserName] = useState("");
  const [checkedUserEmail, setCheckedUserEmail] = useState("");

  // The name lookup may not stand between the user and adding a collaborator, so
  // a failure is reported as "nothing found" rather than as an error. The email
  // lookup is treated the same way: a lookup that could not answer must not
  // invent an error that blocks the save. The insert still refuses a duplicate.
  const findUsersWithSameName = useCallback(
    async (name: string) =>
      actionData(await getProjectUsersByName({ projectId, userName: name })) ??
      [],
    [projectId]
  );

  const findProjectUserForEmail = useCallback(
    async (email: string) => {
      if (!isValidEmail(email.trim())) {
        return undefined;
      }

      return actionData(
        await getProjectUserByEmail({ projectId, userEmail: email.trim() })
      );
    },
    [projectId]
  );

  useEffect(() => {
    if (!userName || userName.trim() === "") {
      setDuplicateProjectUsers([]);
      setCheckedUserName("");
      return;
    }

    let isCurrentName = true;

    const findDuplicates = async () => {
      const usersWithSameName = await findUsersWithSameName(userName);

      // A slower response for a value the user has already replaced would
      // otherwise warn about the wrong one.
      if (isCurrentName) {
        setDuplicateProjectUsers(usersWithSameName);
        setCheckedUserName(userName);
      }
    };

    findDuplicates();

    return () => {
      isCurrentName = false;
    };
  }, [userName, findUsersWithSameName]);

  useEffect(() => {
    if (!userEmail || userEmail.trim() === "") {
      setExistingProjectUser(undefined);
      setCheckedUserEmail("");
      return;
    }

    let isCurrentEmail = true;

    const findProjectUser = async () => {
      const projectUser = await findProjectUserForEmail(userEmail);

      if (isCurrentEmail) {
        setExistingProjectUser(projectUser);
        setCheckedUserEmail(userEmail);
      }
    };

    findProjectUser();

    return () => {
      isCurrentEmail = false;
    };
  }, [userEmail, findProjectUserForEmail]);

  const hasCheckedCurrentName = isSameName(userName, checkedUserName);
  const hasCheckedCurrentEmail = isSameEmail(userEmail, checkedUserEmail);

  const duplicateWarnings = [
    hasCheckedCurrentName
      ? getDuplicateUserWarning({ userName, duplicateProjectUsers })
      : "",
  ].filter(Boolean);

  const existingUserError = hasCheckedCurrentEmail
    ? getExistingProjectUserError({ userEmail, existingProjectUser })
    : "";

  /**
   * Runs both checks now and answers whether the save may go ahead. For the
   * moment before the effects above have replied -- a form filled in and
   * confirmed in one motion -- where the alternative is adding a duplicate with
   * nothing on screen having said a word.
   *
   * A warning does not stop anything, so it counts as "shown, go ahead". An error
   * does: `blocked` is what the caller returns on.
   */
  const runChecks = useCallback(async () => {
    const [usersWithSameName, projectUser] = await Promise.all([
      findUsersWithSameName(userName ?? ""),
      findProjectUserForEmail(userEmail ?? ""),
    ]);

    setDuplicateProjectUsers(usersWithSameName);
    setCheckedUserName(userName ?? "");
    setExistingProjectUser(projectUser);
    setCheckedUserEmail(userEmail ?? "");

    return {
      blocked:
        getExistingProjectUserError({
          userEmail,
          existingProjectUser: projectUser,
        }) !== "",
      hasWarning:
        getDuplicateUserWarning({
          userName,
          duplicateProjectUsers: usersWithSameName,
        }) !== "",
    };
  }, [userName, userEmail, findUsersWithSameName, findProjectUserForEmail]);

  return {
    duplicateWarnings,
    existingUserError,
    hasCheckedCurrentValues: hasCheckedCurrentName && hasCheckedCurrentEmail,
    runChecks,
  };
};
