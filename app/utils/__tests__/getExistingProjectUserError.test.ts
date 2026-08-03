import { describe, it, expect } from "vitest";

import { getExistingProjectUserError } from "../getExistingProjectUserError";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";

const projectUser = (userName?: string): ProjectUser => ({
  projectUserId: "pu-1",
  projectId: "p-1",
  userId: "u-1",
  userName,
  userEmail: "maria@example.com",
  isUserActive: true,
  isUserAdmin: false,
});

describe("getExistingProjectUserError", () => {
  it("names the person already holding the address", () => {
    const error = getExistingProjectUserError({
      userEmail: "maria@example.com",
      existingProjectUser: projectUser("Maria Silva"),
    });

    // The address is the only thing the owner typed; the name is what tells them
    // whether it is the person they meant.
    expect(error).toContain("maria@example.com");
    expect(error).toContain("Maria Silva");
  });

  it("says nothing when the address is not on the project", () => {
    // The normal case on this form, and the reason the old warning had to go: it
    // spoke up here, where there is nothing wrong at all.
    expect(
      getExistingProjectUserError({ userEmail: "new@example.com" }),
    ).toBe("");
  });

  it("says nothing before an address has been typed", () => {
    expect(
      getExistingProjectUserError({
        existingProjectUser: projectUser("Maria Silva"),
      }),
    ).toBe("");
  });

  it("normalises the address it quotes", () => {
    const error = getExistingProjectUserError({
      userEmail: "  Maria@Example.com  ",
      existingProjectUser: projectUser("Maria Silva"),
    });

    // Stored lower-cased and matched that way, so it is quoted that way rather
    // than echoing the capitals back as though they were part of the account.
    expect(error).toContain("maria@example.com");
    expect(error).not.toContain("Maria@Example.com");
  });

  it("still reports the clash when the row has no name", () => {
    const error = getExistingProjectUserError({
      userEmail: "maria@example.com",
      existingProjectUser: projectUser(undefined),
    });

    expect(error).toContain("already on this project");
    expect(error).not.toContain("undefined");
  });
});
