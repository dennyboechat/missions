import { describe, it, expect } from "vitest";

import { generateUID } from "../generateUID";

/**
 * The key React uses for a medication row before that row has been saved and
 * has a database id of its own. It never reaches the database; what it has to
 * do is stay distinct within one table, or editing one row moves another.
 */
describe("generateUID", () => {
  it("gives a different id every time, over more rows than a table will ever hold", () => {
    const ids = new Set(Array.from({ length: 10_000 }, generateUID));

    expect(ids.size).toBe(10_000);
  });

  it("gives a non-empty id of a stable shape", () => {
    for (let attempt = 0; attempt < 500; attempt++) {
      const id = generateUID();

      expect(id.length).toBeGreaterThan(0);
      expect(id).toMatch(/^[0-9a-z]+$/);
    }
  });

  it("never returns something a React key would collapse", () => {
    for (let attempt = 0; attempt < 500; attempt++) {
      const id = generateUID();

      expect(id).not.toBe("");
      expect(id.trim()).toBe(id);
    }
  });
});
