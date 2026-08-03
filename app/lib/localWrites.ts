"use client";

/**
 * A count of the writes this tab has made.
 *
 * It exists so a page can tell "the records changed" from "I changed the
 * records". Both look identical to a poll: the data that comes back differs from
 * the data that came back last time. Announcing every difference would mean
 * telling someone a colleague edited the page every time they themselves typed a
 * weight into it.
 *
 * A module-level counter rather than a context, because the question is about
 * this browser tab and nothing else, and every part of the app that writes
 * already goes through useSaveField. A counter rather than a timestamp so the
 * comparison is "did a write happen since the previous refresh" rather than "was
 * a write recent", which would need a window long enough to cover the poll
 * interval and would swallow anything a colleague did inside it.
 *
 * The counter is never reset. It only has to change.
 */
let localWriteCount = 0;

/** Called after a write of this tab's own reaches the database. */
export const markLocalWrite = () => {
  localWriteCount += 1;
};

export const getLocalWriteCount = () => localWriteCount;
