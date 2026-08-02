"use client";

// Hooks
import { useEffect, useRef, useState } from "react";

/**
 * Local state for a field whose value can also change on the server.
 *
 * Every editable field here keeps a copy of its value in state and saves it a
 * second after typing stops. Once the page refreshes itself, that copy and the
 * server disagree far more often, and the naive reading of the disagreement is
 * wrong in both directions: adopting the server's value always would delete
 * what someone is typing, and ignoring it always would make two open tabs
 * overwrite each other forever -- each one seeing a value it did not write and
 * dutifully saving its own back.
 *
 * So the question is not "which value is newer" but "has the person at this
 * keyboard touched the field". Their edit is anything that moved the field
 * away from the last value the server sent. If they have not touched it, the
 * field is theirs to update and the new value simply appears. If they have,
 * their draft stands and the save that follows wins -- the same last-write-wins
 * the app already had, just no longer triggered by someone merely watching.
 *
 * Returned exactly like useState, so a field adopts it by changing one line.
 */
export const useLiveValue = <T,>(remoteValue: T) => {
  const [value, setValue] = useState(remoteValue);

  // The last value the server told us about -- the baseline a local edit is
  // measured against, not necessarily what is on screen.
  const lastRemoteValueRef = useRef(remoteValue);

  useEffect(() => {
    if (remoteValue === lastRemoteValueRef.current) {
      return;
    }

    const hasLocalEdit = value !== lastRemoteValueRef.current;

    lastRemoteValueRef.current = remoteValue;

    if (!hasLocalEdit) {
      setValue(remoteValue);
    }
  }, [remoteValue, value]);

  return [value, setValue] as const;
};
