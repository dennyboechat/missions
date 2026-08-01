import { describe, it, expect } from "vitest";

import { getExistingAccountWarning } from "../getExistingAccountWarning";
import { joinWithAnd } from "../joinWithAnd";
import { isSameName } from "../isSameName";

describe("getExistingAccountWarning", () => {
  it("stays empty when the email is not registered", () => {
    expect(
      getExistingAccountWarning({
        userName: "Ana Costa",
        userEmail: "ana@example.com",
        existingAccountName: undefined,
      }),
    ).toBe("");
  });

  it("stays empty when the account is the same person", () => {
    expect(
      getExistingAccountWarning({
        userName: "denny boechat ",
        userEmail: "denny@example.com",
        existingAccountName: "Denny Boechat",
      }),
    ).toBe("");
  });

  it("says whose account the email is when the names differ", () => {
    const warning = getExistingAccountWarning({
      userName: "Ana Costa",
      userEmail: "  Denny@Example.com  ",
      existingAccountName: "Denny Boechat",
    });

    expect(warning).toContain("denny@example.com");
    expect(warning).toContain('"Denny Boechat"');
    expect(warning).toContain("not a new user");
  });
});

describe("joinWithAnd", () => {
  it("renders lists the way a sentence reads", () => {
    expect(joinWithAnd([])).toBe("");
    expect(joinWithAnd(["a"])).toBe("a");
    expect(joinWithAnd(["a", "b"])).toBe("a and b");
    expect(joinWithAnd(["a", "b", "c"])).toBe("a, b and c");
  });
});

describe("isSameName", () => {
  it("ignores case and surrounding spaces, like the queries do", () => {
    expect(isSameName("  Denny Boechat ", "denny boechat")).toBe(true);
    expect(isSameName("Denny Boechat", "Denny  Boechat")).toBe(false);
    expect(isSameName(undefined, "")).toBe(true);
  });
});
