// Utils
import { isSameName } from "./isSameName";

/**
 * Wording for the "that email is someone else's account" warning on the new
 * user form.
 *
 * Accounts are keyed by email. Adding a user whose address is already
 * registered does not create anything: the existing account is what joins the
 * project, and the name typed into the form is discarded. When that name is
 * somebody else's, the owner has added a person they did not mean to add and
 * nothing on screen said so.
 *
 * Silent when the names agree -- reusing Denny's account for Denny is what
 * should happen, and saying so would be noise.
 */
export const getExistingAccountWarning = ({
  userName,
  userEmail,
  existingAccountName,
}: {
  userName?: string;
  userEmail?: string;
  existingAccountName?: string;
}) => {
  if (!userEmail || !existingAccountName) {
    return "";
  }

  if (isSameName(userName, existingAccountName)) {
    return "";
  }

  return (
    `The email ${userEmail.trim().toLowerCase()} already belongs to the account ` +
    `"${existingAccountName}". Confirming adds that account to the project, ` +
    `not a new user, and the name entered here is not used.`
  );
};
