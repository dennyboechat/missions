import { describe, it, expect } from "vitest";

import { markLocalWrite, getLocalWriteCount } from "../localWrites";

/**
 * How a page tells "the records changed" from "I changed the records". Both look
 * the same to a poll -- the data differs from last time -- so without this every
 * weight a clinician typed came back as a colleague's edit.
 */
describe("localWrites", () => {
  it("moves on for each write this tab makes", () => {
    const before = getLocalWriteCount();

    markLocalWrite();

    expect(getLocalWriteCount()).toBe(before + 1);
  });

  it("stays put when nothing is written", () => {
    const before = getLocalWriteCount();

    expect(getLocalWriteCount()).toBe(before);
    expect(getLocalWriteCount()).toBe(before);
  });

  it("counts every write, so two saves inside one poll are not read as one", () => {
    // A timestamp would have needed a window wide enough to cover the poll
    // interval, and would have swallowed anything a colleague did inside it.
    const before = getLocalWriteCount();

    markLocalWrite();
    markLocalWrite();
    markLocalWrite();

    expect(getLocalWriteCount()).toBe(before + 3);
  });

  it("only ever goes up, so a comparison against a remembered count is safe", () => {
    const seen = [getLocalWriteCount()];

    for (let write = 0; write < 5; write++) {
      markLocalWrite();
      seen.push(getLocalWriteCount());
    }

    expect(seen).toEqual([...seen].sort((a, b) => a - b));
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("is a count and not a flag, which is what a refresh compares against", () => {
    const before = getLocalWriteCount();

    markLocalWrite();
    const afterFirst = getLocalWriteCount();
    markLocalWrite();

    // Never reset: a page only asks whether the number changed since its last
    // refresh, so there is nothing to clear and nothing to race with.
    expect(afterFirst).not.toBe(before);
    expect(getLocalWriteCount()).not.toBe(afterFirst);
  });
});
