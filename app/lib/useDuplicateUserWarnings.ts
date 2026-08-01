"use client";

// Hooks
import { useState, useEffect, useCallback } from "react";

// Database
import { getProjectUsersByName } from "../database/project-user/GetProjectUsersByName";
import { getAppUser } from "../database/app-user/GetAppUser";

// Types
import { ProjectUser } from "../types/ProjectUserTypes";
import { ProjectId } from "../types/ProjectTypes";
import { actionData } from "../types/ActionResult";

// Utils
import { getDuplicateUserWarning } from "../utils/getDuplicateUserWarning";
import { getExistingAccountWarning } from "../utils/getExistingAccountWarning";
import { isSameName } from "../utils/isSameName";
import { isValidEmail } from "../utils/isValidEmail";

const isSameEmail = (email?: string, otherEmail?: string) =>
  (email ?? "").trim().toLowerCase() ===
  (otherEmail ?? "").trim().toLowerCase();

/**
 * The two ways adding a project user can mean something other than what it
 * looks like:
 *
 *  - the name is already on the project, so this may be the same person twice;
 *  - the email already belongs to an account under a different name, so
 *    confirming adds *that* person and drops the name typed here.
 *
 * Neither blocks the save. Both have to be on screen before it happens.
 */
export const useDuplicateUserWarnings = ({
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
  const [existingAccountName, setExistingAccountName] = useState<string>();
  // The values the answers belong to, so the caller can tell an answered check
  // from one that has not come back yet.
  const [checkedUserName, setCheckedUserName] = useState("");
  const [checkedUserEmail, setCheckedUserEmail] = useState("");

  // Neither lookup may stand between the user and adding a collaborator, so a
  // failure is reported as "nothing found" rather than as an error.
  const findUsersWithSameName = useCallback(
    async (name: string) =>
      actionData(await getProjectUsersByName({ projectId, userName: name })) ??
      [],
    [projectId]
  );

  const findAccountForEmail = useCallback(async (email: string) => {
    if (!isValidEmail(email.trim())) {
      return undefined;
    }

    return actionData(
      await getAppUser({ field: "user_email", value: email.trim() })
    )?.userName;
  }, []);

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
      setExistingAccountName(undefined);
      setCheckedUserEmail("");
      return;
    }

    let isCurrentEmail = true;

    const findAccount = async () => {
      const accountName = await findAccountForEmail(userEmail);

      if (isCurrentEmail) {
        setExistingAccountName(accountName);
        setCheckedUserEmail(userEmail);
      }
    };

    findAccount();

    return () => {
      isCurrentEmail = false;
    };
  }, [userEmail, findAccountForEmail]);

  const hasCheckedCurrentName = isSameName(userName, checkedUserName);
  const hasCheckedCurrentEmail = isSameEmail(userEmail, checkedUserEmail);

  const duplicateWarnings = [
    hasCheckedCurrentName
      ? getDuplicateUserWarning({ userName, duplicateProjectUsers })
      : "",
    hasCheckedCurrentEmail
      ? getExistingAccountWarning({ userName, userEmail, existingAccountName })
      : "",
  ].filter(Boolean);

  /**
   * Runs both checks now and answers whether either has something to say. For
   * the moment before the effects above have replied -- a form filled in and
   * confirmed in one motion -- where the alternative is saving with no warning
   * shown at all.
   */
  const checkForDuplicates = useCallback(async () => {
    const [usersWithSameName, accountName] = await Promise.all([
      findUsersWithSameName(userName ?? ""),
      findAccountForEmail(userEmail ?? ""),
    ]);

    setDuplicateProjectUsers(usersWithSameName);
    setCheckedUserName(userName ?? "");
    setExistingAccountName(accountName);
    setCheckedUserEmail(userEmail ?? "");

    return (
      getDuplicateUserWarning({
        userName,
        duplicateProjectUsers: usersWithSameName,
      }) !== "" ||
      getExistingAccountWarning({
        userName,
        userEmail,
        existingAccountName: accountName,
      }) !== ""
    );
  }, [userName, userEmail, findUsersWithSameName, findAccountForEmail]);

  return {
    duplicateWarnings,
    hasCheckedCurrentValues: hasCheckedCurrentName && hasCheckedCurrentEmail,
    checkForDuplicates,
  };
};
