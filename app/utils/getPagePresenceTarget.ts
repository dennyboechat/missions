// Types
import { PagePresenceTarget } from "../types/PagePresence";

/**
 * The pages a roster appears on, each its own room.
 *
 * Three of the four patient tabs, and nothing else. The test is whether two
 * people on the page can quietly overwrite each other: General, Dental and
 * Personal are all fields that save as they are edited, so knowing a colleague is
 * in there is worth a line of chrome. Summary writes nothing -- it is the record
 * read back -- and a roster there answers a question nobody was asking.
 *
 * A tab at a time, not a record at a time. These used to share one key, so a
 * colleague who moved from Summary to General stayed in everyone's header --
 * correctly, by that design, and confusingly in practice: the block says "also
 * here", and a reader takes "here" to mean the page in front of them.
 *
 * What that costs: two people in one record on different tabs no longer see each
 * other. The concurrent-edit protection does not depend on this -- useLiveData
 * and useLiveValue keep the fields honest whether or not anybody was warned.
 */
const PRESENCE_SEGMENTS: Record<string, string> = {
  "patient-general": "General",
  "patient-dentistry": "Dental",
  "patient-personal": "Personal",
};

/**
 * The page the current URL is looking at, or nothing if the URL is not one two
 * people can collide on.
 *
 * Derived from the pathname rather than passed down, so a page opts in by
 * existing at a known route instead of by wiring a component -- the same way the
 * header already decides where Back should go. Adding a screen is a line in the
 * map above; a screen scoped to the project rather than to a patient would also
 * need its own scope, since the roster is authorised against the record named
 * here.
 *
 * Summary, the patients list, sign-in, the dashboard and the standalone forms all
 * return nothing: a roster on a screen nobody edits is noise, and no heartbeat
 * means no write.
 */
export const getPagePresenceTarget = (
  pathname: string,
): PagePresenceTarget | undefined => {
  const [, segment, id] = pathname.split("/");

  if (!segment || !id) {
    return undefined;
  }

  const label = PRESENCE_SEGMENTS[segment];

  if (!label) {
    return undefined;
  }

  return {
    // The segment is part of the key, which is what makes a tab a room. The scope
    // stays the patient: that is what the roster is authorised against, and it
    // does not change when the tab does.
    resourceKey: `${segment}:${id}`,
    resourceLabel: label,
    scope: { patientPersonalId: id },
  };
};
