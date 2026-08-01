// Utils
import { joinWithAnd } from "./joinWithAnd";

// Types
import { ProjectUser } from "../types/ProjectUserTypes";

/**
 * Wording for the "this name is already on the project" warning shown while a
 * new user is being added. The email is what tells a namesake apart from a
 * second entry for the same person, so it is always spelled out.
 *
 * Returns an empty string when there is nothing to warn about, so callers can
 * use the result as the whole condition for rendering the warning.
 */
export const getDuplicateUserWarning = ({
  userName,
  duplicateProjectUsers,
}: {
  userName?: string;
  duplicateProjectUsers: ProjectUser[];
}) => {
  if (!userName || duplicateProjectUsers.length === 0) {
    return "";
  }

  const emails = duplicateProjectUsers.map(({ userEmail }) => userEmail ?? "");

  if (emails.length === 1) {
    return (
      `A user named "${userName.trim()}" is already on this project, with the ` +
      `email ${emails[0]}. Please check this is not a duplicate before confirming.`
    );
  }

  return (
    `${emails.length} users named "${userName.trim()}" are already on this ` +
    `project, with the emails ${joinWithAnd(emails)}. ` +
    `Please check this is not a duplicate before confirming.`
  );
};
