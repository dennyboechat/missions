// Types
import { ProjectUser } from "../types/ProjectUserTypes";

/**
 * Wording for the "this person is already on the project" error on the new user
 * form.
 *
 * An error rather than a warning, because there is nothing to confirm: a project
 * holds an account once, so adding it again is not a judgement call about
 * duplicates -- it cannot be done, and the insert would be refused anyway. Saying
 * so on the form saves the round trip and, more to the point, says it while the
 * owner is still looking at the address they typed.
 *
 * This replaced a warning that fired whenever the email belonged to an account
 * registered under some other name, whether or not that account was on this
 * project. On the form for adding somebody new that is the normal case, so the
 * warning appeared almost every time and said nothing about the thing that
 * actually goes wrong.
 *
 * Names the person as they are recorded here, which is the point: the address
 * typed may be the only thing the owner recognises, and "Maria Silva already has
 * access" is what tells them whether they have the right person.
 *
 * Returns an empty string when there is nothing to report, so callers can use the
 * result as the whole condition for rendering the error.
 */
export const getExistingProjectUserError = ({
  userEmail,
  existingProjectUser,
}: {
  userEmail?: string;
  existingProjectUser?: ProjectUser;
}) => {
  if (!userEmail || !existingProjectUser) {
    return "";
  }

  const existingName = existingProjectUser.userName?.trim();
  const address = userEmail.trim().toLowerCase();

  // The name is not nullable in the schema, but it is read off a join here, and
  // an error message is the wrong place to print "undefined".
  if (!existingName) {
    return `${address} is already on this project.`;
  }

  return (
    `${address} is already on this project, as "${existingName}". ` +
    `To change what they can do, open them from the users list.`
  );
};
